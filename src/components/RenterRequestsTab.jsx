import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { FEE_TIERS, formatRent, waLink } from "@/lib/config";
import { updateRenterRequest } from "@/api/rentals";

const FILTERS = [
  ["new", "Pending review"],
  ["accepted", "Accepted"],
  ["declined", "Declined"],
  ["closed", "Closed"],
  ["all", "All"],
];

export default function RenterRequestsTab({ rows, reload }) {
  const [filter, setFilter] = useState("new");
  const [busy, setBusy] = useState("");
  const shown = rows.filter((r) => filter === "all" || r.status === filter);

  async function setStatus(r, status) {
    setBusy(r.id);
    try {
      await updateRenterRequest(r.id, { status });
      await reload();
    } catch (err) {
      toast({ title: "Couldn't update", description: err.message, variant: "destructive" });
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 text-sm border ${filter === key ? "bg-foreground text-background" : "border-border"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground">Nothing here.</p>
      ) : (
        <div className="space-y-4">
          {shown.map((r) => (
            <div key={r.id} className="border border-border p-4">
              <p className="font-display text-xl">{r.tenant_name || "Tenant"}</p>
              <p className="font-body text-sm text-muted-foreground">{r.tenant_phone}</p>
              <p className="font-body text-sm mt-2">
                {[
                  r.area && `Area: ${r.area}`,
                  r.budget != null && `Budget: ${formatRent(r.budget)}`,
                  r.bedrooms != null && `${r.bedrooms} bd`,
                  r.property_type,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {r.move_in && <p className="font-body text-sm text-muted-foreground">Move-in: {r.move_in}</p>}
              {r.notes && <p className="font-body text-sm mt-2 bg-secondary/40 p-3">"{r.notes}"</p>}
              <p className="font-body text-xs text-muted-foreground mt-2">
                {new Date(r.created_at).toLocaleString()} · Terms signed
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Fees: {FEE_TIERS.map((t) => `${t.label} ${formatRent(t.amount)}`).join(" · ")}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {r.tenant_phone && (
                  <a
                    href={waLink(r.tenant_phone, `Hi ${r.tenant_name || ""}, we've received your request for a home. Dzimba Digital.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-border px-3 h-9 text-sm"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {r.status === "new" && (
                  <>
                    <Button size="sm" disabled={busy === r.id} onClick={() => setStatus(r, "accepted")}>Accept</Button>
                    <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => setStatus(r, "declined")}>Decline</Button>
                  </>
                )}
                {r.status === "accepted" && (
                  <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => setStatus(r, "closed")}>Close</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
