import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  MOVE_IN_OPTIONS,
  PROPERTY_TYPES,
  SUBURBS,
  TERMS_AGREEMENT_RENTER,
} from "@/lib/config";
import {
  cancelRenterRequest,
  createRenterRequest,
  getMyRenterRequests,
  updateProfile,
} from "@/api/rentals";

const field =
  "w-full bg-transparent border border-border px-4 py-3 text-sm focus:border-foreground outline-none transition-colors";
const label = "text-xs uppercase tracking-wider text-muted-foreground block mb-2";

export default function FindRental() {
  const { user, profile, isAuthenticated, refreshProfile } = useAuth();
  const [mine, setMine] = useState([]);
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [f, setF] = useState({
    phone: "",
    area: "",
    budget: "",
    bedrooms: "",
    property_type: "",
    move_in: MOVE_IN_OPTIONS[0],
    notes: "",
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    setF((x) => ({ ...x, phone: profile?.phone || "" }));
  }, [profile]);

  const load = () =>
    user ? getMyRenterRequests(user.id).then(setMine).catch(() => {}) : null;
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!isAuthenticated) return <Navigate to="/login?returnTo=%2Ffind-rental" replace />;

  async function submit(e) {
    e.preventDefault();
    if (f.phone.replace(/\D/g, "").length < 9) {
      toast({ title: "Enter a phone number we can WhatsApp", variant: "destructive" });
      return;
    }
    if (!agreed) return;
    setBusy(true);
    try {
      if (f.phone.trim() !== (profile?.phone || "")) {
        await updateProfile(user.id, { phone: f.phone.trim() });
        refreshProfile();
      }
      await createRenterRequest({
        uid: user.id,
        name: profile?.full_name,
        phone: f.phone.trim(),
        area: f.area,
        budget: f.budget,
        bedrooms: f.bedrooms,
        property_type: f.property_type,
        move_in: f.move_in,
        notes: f.notes.trim(),
      });
      toast({ title: "Request sent", description: "We'll contact you on WhatsApp." });
      setF({ ...f, area: "", budget: "", bedrooms: "", property_type: "", notes: "" });
      setAgreed(false);
      await load();
    } catch (err) {
      toast({ title: "Couldn't send", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id) {
    try {
      await cancelRenterRequest(id);
      await load();
    } catch (err) {
      toast({ title: "Couldn't cancel", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="pt-28 md:pt-32 pb-24 px-[4%] max-w-[640px] mx-auto">
      <h1 className="font-display text-display-md font-light mb-3">Tell us what you need</h1>
      <p className="font-body text-sm text-muted-foreground mb-8">
        Can't see the right home? Tell us what you're looking for and we'll look for it.
        Or <Link to="/properties" className="text-primary hover:underline">browse listings</Link>.
      </p>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className={label}>Your WhatsApp number</label>
          <input type="tel" required value={f.phone} onChange={set("phone")} placeholder="0771 234 567" className={field} />
        </div>
        <div>
          <label className={label}>Area</label>
          <input list="fr-areas" value={f.area} onChange={set("area")} placeholder="e.g. Murambi" className={field} />
          <datalist id="fr-areas">{SUBURBS.map((s) => <option key={s} value={s} />)}</datalist>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Budget (USD / month)</label>
            <input type="number" min="0" inputMode="numeric" value={f.budget} onChange={set("budget")} className={field} />
          </div>
          <div>
            <label className={label}>Bedrooms</label>
            <input type="number" min="0" max="10" inputMode="numeric" value={f.bedrooms} onChange={set("bedrooms")} className={field} />
          </div>
        </div>
        <div>
          <label className={label}>Type of home</label>
          <select value={f.property_type} onChange={set("property_type")} className={field}>
            <option value="" className="text-black">Any</option>
            {PROPERTY_TYPES.map((t) => <option key={t} value={t} className="text-black">{t}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Move-in</label>
          <select value={f.move_in} onChange={set("move_in")} className={field}>
            {MOVE_IN_OPTIONS.map((t) => <option key={t} value={t} className="text-black">{t}</option>)}
          </select>
        </div>
        <textarea rows={3} value={f.notes} onChange={set("notes")} placeholder="Anything else? (optional)" className={`${field} resize-none`} />
        <label className="flex items-start gap-3 text-sm text-muted-foreground leading-snug cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
          <span>{TERMS_AGREEMENT_RENTER}</span>
        </label>
        <Button type="submit" className="w-full h-12" disabled={busy || !agreed}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send request"}
        </Button>
      </form>

      {mine.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-2xl mb-4">Your requests</h2>
          <ul className="space-y-3">
            {mine.map((r) => (
              <li key={r.id} className="border border-border p-4 text-sm flex justify-between gap-3">
                <span>
                  {[r.area, r.bedrooms != null && `${r.bedrooms} bd`, r.property_type, r.budget != null && `$${r.budget}`]
                    .filter(Boolean)
                    .join(" · ") || "Any home"}
                  <span className="block text-xs text-muted-foreground mt-1 capitalize">{r.status}</span>
                </span>
                {r.status === "new" && (
                  <button onClick={() => cancel(r.id)} className="text-xs text-primary hover:underline shrink-0">Cancel</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
