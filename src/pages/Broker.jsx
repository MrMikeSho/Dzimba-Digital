import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { MessageCircle, Phone, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import CashFlowPanel from "@/components/CashFlowPanel";
import RenterRequestsTab from "@/components/RenterRequestsTab";
import StatusBadge from "@/components/StatusBadge";
import {
  FEE_PRESETS,
  FEE_TIERS,
  suggestFee,
  feeRequestMessage,
  formatRent,
  landlordLinkedMessage,
  tenantLinkedMessage,
  waLink,
} from "@/lib/config";
import {
  deleteInquiry,
  deleteListing,
  getAllLinks,
  getAllListings,
  getAllRenterRequests,
  getAllRequests,
  getInquiries,
  getPrivateMap,
  linkTenantToLandlord,
  setListingStatus,
  updateInquiry,
  updateRequest,
} from "@/api/rentals";

const fail = (title) => (err) =>
  toast({ title, description: err.message, variant: "destructive" });

const dateOf = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";

function Stat({ label, value }) {
  return (
    <div className="border border-border p-4">
      <p className="font-display text-3xl font-light">{value}</p>
      <p className="font-body text-xs tracking-label uppercase text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function WaButton({ phone, text, children }) {
  return (
    <a className="ghost-btn text-xs" target="_blank" rel="noreferrer" href={waLink(phone, text)}>
      <MessageCircle size={14} className="mr-2" />
      {children}
    </a>
  );
}

// ---------------------------------------------------------------- requests

function RequestCard({ req, listing, priv, link, onChanged }) {
  const [mode, setMode] = useState(null); // null | "accept" | "paid"
  const [amount, setAmount] = useState(() => String(suggestFee(listing)));
  const [method, setMethod] = useState("EcoCash");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(() =>
    feeRequestMessage({
      tenantName: req.tenant_name,
      listingTitle: req.listing_title,
      amount: req.fee_amount,
    })
  );

  const run = async (fn, okTitle) => {
    setBusy(true);
    try {
      await fn();
      if (okTitle) toast({ title: okTitle });
      setMode(null);
      await onChanged();
    } catch (err) {
      fail("Couldn't update")(err);
    } finally {
      setBusy(false);
    }
  };

  const accept = () =>
    run(async () => {
      const fee = Number(amount);
      await updateRequest(req.id, { status: "accepted", fee_amount: fee });
    }, "Request accepted");

  const markPaid = () =>
    run(
      () =>
        updateRequest(req.id, {
          status: "paid",
          fee_method: method,
          fee_reference: reference.trim() || null,
          fee_paid_at: new Date().toISOString(),
        }),
      "Fee recorded"
    );

  const decline = () => {
    if (!window.confirm("Decline this request?")) return;
    run(() => updateRequest(req.id, { status: "declined" }), "Declined");
  };

  const doLink = () =>
    run(
      () => linkTenantToLandlord({ request: req, listing, priv }),
      "Tenant linked"
    );

  const linkInfo = link
    ? link
    : {
        listing_title: req.listing_title,
        tenant_name: req.tenant_name,
        tenant_phone: req.tenant_phone,
        landlord_name: priv?.contact_name,
        landlord_phone: priv?.contact_phone,
        address: priv?.address,
      };

  return (
    <div className="border border-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xl leading-tight">{req.tenant_name || "Tenant"}</p>
          <p className="font-body text-sm text-muted-foreground mt-1">
            wants{" "}
            <Link to={`/property/${req.listing_id}`} className="underline hover:text-accent">
              {req.listing_title || "a property"}
            </Link>{" "}
            · {dateOf(req.created_at)}
          </p>
        </div>
        <StatusBadge status={req.status} />
      </div>

      {req.message && <p className="font-body text-sm mt-3 bg-secondary/40 p-3">"{req.message}"</p>}
      {req.preferred_date && (
        <p className="font-body text-xs text-muted-foreground mt-2">
          Preferred viewing: {req.preferred_date}{req.preferred_time ? `, ${req.preferred_time}` : ""}
        </p>
      )}
      {req.terms_accepted_at && (
        <p className="font-body text-xs text-muted-foreground mt-1">
          Terms signed {new Date(req.terms_accepted_at).toLocaleString()}
        </p>
      )}

      <div className="flex flex-wrap gap-3 mt-4">
        {req.tenant_phone && (
          <a className="ghost-btn text-xs" href={`tel:${req.tenant_phone}`}>
            <Phone size={14} className="mr-2" /> {req.tenant_phone}
          </a>
        )}
        {req.status === "new" && req.tenant_phone && (
          <WaButton
            phone={req.tenant_phone}
            text={`Hi ${(req.tenant_name || "").split(" ")[0]}, this is Dzimba Digital about "${req.listing_title}".`}
          >
            Message
          </WaButton>
        )}
      </div>

      {(req.fee_amount != null || req.fee_paid_at) && (
        <p className="font-body text-sm mt-4">
          Fee {formatRent(req.fee_amount)}
          {req.fee_paid_at && (
            <>
              {" "}
              · paid {dateOf(req.fee_paid_at)} via {req.fee_method || "?"}
              {req.fee_reference ? ` (${req.fee_reference})` : ""}
            </>
          )}
        </p>
      )}

      {/* NEW: choose a fee */}
      {req.status === "new" && mode !== "accept" && (
        <div className="flex gap-3 mt-4">
          <Button onClick={() => setMode("accept")}>Accept &amp; set fee</Button>
          <Button variant="outline" onClick={decline} disabled={busy}>
            Decline
          </Button>
        </div>
      )}
      {req.status === "new" && mode === "accept" && (
        <div className="mt-4 border-t border-border pt-4 space-y-3">
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground">Fee amount (USD)</p>
          <select
            value={FEE_TIERS.some((t) => String(t.amount) === amount) ? amount : ""}
            onChange={(e) => e.target.value && setAmount(e.target.value)}
            className="w-full h-10 border border-border bg-background px-3 text-sm"
          >
            <option value="">Choose by size of home…</option>
            {FEE_TIERS.map((t) => (
              <option key={t.amount} value={String(t.amount)}>{t.label} — ${t.amount}</option>
            ))}
          </select>
          {listing && <p className="font-body text-xs text-muted-foreground">Suggested for this home: {formatRent(suggestFee(listing))}</p>}
          <div className="flex flex-wrap items-center gap-2">
            {FEE_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className={`px-4 py-2 border text-sm ${amount === String(p) ? "bg-foreground text-background" : "border-border"}`}
              >
                ${p}
              </button>
            ))}
            <Input type="number" min="1" inputMode="decimal" placeholder="Other" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-28 h-10" />
          </div>
          <div className="flex gap-3">
            <Button onClick={accept} disabled={busy || !(Number(amount) > 0)}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save fee"}
            </Button>
            <Button variant="outline" onClick={() => setMode(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ACCEPTED: send WhatsApp message, then record payment */}
      {req.status === "accepted" && (
        <div className="mt-4 border-t border-border pt-4 space-y-3">
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground">Message to tenant (edit if needed)</p>
          <textarea
            rows={5}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            className="w-full bg-transparent border border-input rounded-md p-3 text-sm"
          />
          <div className="flex flex-wrap gap-3">
            <WaButton phone={req.tenant_phone} text={msg}>
              Send on WhatsApp
            </WaButton>
            {mode !== "paid" && <Button onClick={() => setMode("paid")}>Mark fee paid</Button>}
            <Button variant="outline" onClick={decline} disabled={busy}>
              Decline
            </Button>
          </div>
          {mode === "paid" && (
            <div className="flex flex-wrap items-center gap-2">
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="h-10 border border-input rounded-md bg-transparent px-3 text-sm">
                {["EcoCash", "Paynow", "Cash", "Other"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <Input placeholder="Reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)} className="w-48 h-10" />
              <Button onClick={markPaid} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save payment"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* PAID: link tenant to landlord */}
      {req.status === "paid" && (
        <div className="mt-4 border-t border-border pt-4 space-y-3">
          {priv?.contact_phone ? (
            <p className="font-body text-sm text-muted-foreground">
              Landlord: {priv.contact_name || "(no name)"} · {priv.contact_phone}
              {priv.address ? ` · ${priv.address}` : ""}
            </p>
          ) : (
            <p className="font-body text-sm text-destructive">
              This listing has no landlord phone number saved. Add it to the listing first.
            </p>
          )}
          <Button onClick={doLink} disabled={busy || !listing}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Link tenant to landlord"}
          </Button>
        </div>
      )}

      {/* LINKED: send details to both sides */}
      {req.status === "linked" && (
        <div className="mt-4 border-t border-border pt-4 space-y-3">
          <p className="font-body text-sm text-muted-foreground">
            Landlord: {linkInfo.landlord_name || "(no name)"} · {linkInfo.landlord_phone || "(no phone)"}
          </p>
          <div className="flex flex-wrap gap-3">
            <WaButton phone={linkInfo.tenant_phone} text={tenantLinkedMessage(linkInfo)}>
              Send details to tenant
            </WaButton>
            <WaButton phone={linkInfo.landlord_phone} text={landlordLinkedMessage(linkInfo)}>
              Tell the landlord
            </WaButton>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestsTab({ requests, listingsById, privateMap, linksByRequest, reload }) {
  const [filter, setFilter] = useState("active");
  const shown = requests.filter((r) =>
    filter === "active"
      ? ["new", "accepted", "paid"].includes(r.status)
      : filter === "all"
        ? true
        : r.status === filter
  );
  const filters = [
    ["active", "Needs action"],
    ["linked", "Linked"],
    ["declined", "Declined"],
    ["all", "All"],
  ];
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(([key, label]) => (
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
            <RequestCard
              key={`${r.id}-${r.status}`}
              req={r}
              listing={listingsById[r.listing_id]}
              priv={privateMap[r.listing_id]}
              link={linksByRequest[r.id]}
              onChanged={reload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- listings

function ListingsTab({ listings, privateMap, reload }) {
  const [filter, setFilter] = useState("pending");
  const shown = listings.filter((l) => (filter === "all" ? true : l.status === filter));

  const act = async (fn, okTitle) => {
    try {
      await fn();
      if (okTitle) toast({ title: okTitle });
      await reload();
    } catch (err) {
      fail("Couldn't update")(err);
    }
  };

  const btn = (label, status, variant = "outline", id) => (
    <Button key={label} variant={variant} size="sm" onClick={() => act(() => setListingStatus(id, status), label)}>
      {label}
    </Button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {[
          ["pending", "To approve"],
          ["approved", "Live"],
          ["rented", "Rented"],
          ["reserved", "Pending"],
          ["rejected", "Rejected"],
          ["all", "All"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 text-sm border ${filter === key ? "bg-foreground text-background" : "border-border"}`}
          >
            {label}
          </button>
        ))}
        <Link to="/list-property" className="ghost-btn text-xs ml-auto">
          Add listing
        </Link>
      </div>

      {shown.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground">Nothing here.</p>
      ) : (
        <div className="space-y-4">
          {shown.map((l) => {
            const p = privateMap[l.id];
            return (
              <div key={l.id} className="border border-border p-4 flex gap-4">
                <img src={l.featured_image} alt="" className="w-24 h-24 object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-lg leading-tight">{l.title}</p>
                    <StatusBadge status={l.status} />
                  </div>
                  <p className="font-body text-sm text-muted-foreground mt-1">
                    {[l.suburb, l.town].filter(Boolean).join(", ")} · {formatRent(l.rent_monthly)}/mo
                    {l.bedrooms != null ? ` · ${l.bedrooms} bed` : ""}
                  </p>
                  {p && (
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Landlord: {p.contact_name || "-"} · {p.contact_phone || "-"}
                      {p.address ? ` · ${p.address}` : ""}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {l.status === "pending" && (
                      <>
                        {btn("Approve", "approved", "default", l.id)}
                        {btn("Reject", "rejected", "outline", l.id)}
                      </>
                    )}
                    {l.status === "approved" && (
                      <>
                        {btn("Mark pending", "reserved", "outline", l.id)}
                        {btn("Mark rented", "rented", "outline", l.id)}
                        {btn("Unlist", "pending", "outline", l.id)}
                      </>
                    )}
                    {l.status === "reserved" && (
                      <>
                        {btn("Available", "approved", "outline", l.id)}
                        {btn("Mark rented", "rented", "outline", l.id)}
                      </>
                    )}
                    {l.status === "rented" && btn("Available", "approved", "outline", l.id)}
                    {l.status === "rejected" && btn("Approve", "approved", "outline", l.id)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm("Delete this listing and its requests?")) act(() => deleteListing(l.id), "Deleted");
                      }}
                    >
                      Delete
                    </Button>
                    {l.status === "approved" && (
                      <Link to={`/property/${l.id}`} className="text-xs text-primary hover:underline self-center">
                        View page
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- messages

function MessagesTab({ inquiries, reload }) {
  const act = async (fn) => {
    try {
      await fn();
      await reload();
    } catch (err) {
      fail("Couldn't update")(err);
    }
  };
  if (inquiries.length === 0) {
    return <p className="font-body text-sm text-muted-foreground">No messages yet.</p>;
  }
  return (
    <div className="space-y-4">
      {inquiries.map((q) => (
        <div key={q.id} className="border border-border p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="font-display text-xl">{q.full_name || "Visitor"}</p>
            <span className="text-xs text-muted-foreground">
              {q.status} · {dateOf(q.created_at)}
            </span>
          </div>
          {q.inquiry_type && (
            <p className="font-body text-xs tracking-label uppercase text-muted-foreground mt-1">{q.inquiry_type}</p>
          )}
          {q.message && <p className="font-body text-sm mt-3 whitespace-pre-wrap">{q.message}</p>}
          <div className="flex flex-wrap gap-3 mt-4">
            {q.phone && (
              <>
                <a className="ghost-btn text-xs" href={`tel:${q.phone}`}>
                  <Phone size={14} className="mr-2" /> {q.phone}
                </a>
                <WaButton phone={q.phone} text={`Hi ${(q.full_name || "").split(" ")[0]}, this is Dzimba Digital.`}>
                  WhatsApp
                </WaButton>
              </>
            )}
            {q.email && (
              <a className="ghost-btn text-xs" href={`mailto:${q.email}`}>
                <Mail size={14} className="mr-2" /> {q.email}
              </a>
            )}
          </div>
          <div className="flex gap-4 mt-4 text-xs">
            {q.status !== "Handled" && (
              <button className="text-primary hover:underline" onClick={() => act(() => updateInquiry(q.id, { status: "Handled" }))}>
                Mark handled
              </button>
            )}
            <button
              className="text-destructive hover:underline"
              onClick={() => window.confirm("Delete this message?") && act(() => deleteInquiry(q.id))}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- page

export default function Broker() {
  const { isAuthenticated, isBroker } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "requests";

  const [requests, setRequests] = useState([]);
  const [listings, setListings] = useState([]);
  const [privateMap, setPrivateMap] = useState({});
  const [links, setLinks] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [renters, setRenters] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [r, l, p, k, q, rr] = await Promise.all([
        getAllRequests(),
        getAllListings(),
        getPrivateMap(),
        getAllLinks(),
        getInquiries(),
        getAllRenterRequests(),
      ]);
      setRenters(rr);
      setRequests(r);
      setListings(l);
      setPrivateMap(p);
      setLinks(k);
      setInquiries(q);
    } catch (err) {
      fail("Couldn't load the panel")(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isBroker) load();
  }, [isBroker, load]);

  const listingsById = useMemo(() => Object.fromEntries(listings.map((l) => [l.id, l])), [listings]);
  const linksByRequest = useMemo(() => Object.fromEntries(links.map((l) => [l.request_id, l])), [links]);

  const stats = useMemo(() => {
    const paid = requests.filter((r) => r.fee_paid_at);
    const sum = (arr) => arr.reduce((t, r) => t + Number(r.fee_amount || 0), 0);
    const now = new Date();
    const thisMonth = paid.filter((r) => {
      const d = new Date(r.fee_paid_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return {
      newRequests: requests.filter((r) => r.status === "new").length,
      newRenters: renters.filter((x) => x.status === "new").length,
      toApprove: listings.filter((l) => l.status === "pending").length,
      month: sum(thisMonth),
      total: sum(paid),
    };
  }, [requests, listings, renters]);

  if (!isAuthenticated) return <Navigate to="/login?returnTo=%2Fbroker" replace />;
  if (!isBroker) {
    return (
      <div className="pt-32 pb-24 px-[4%] max-w-[560px] mx-auto text-center">
        <h1 className="font-display text-display-md font-light mb-4">Broker panel</h1>
        <p className="font-body text-muted-foreground">This page is only for the broker account.</p>
      </div>
    );
  }

  const tabs = [
    ["requests", "Requests", stats.newRequests],
    ["listings", "Listings", stats.toApprove],
    ["renters", "Renter requests", stats.newRenters],
    ["messages", "Messages", inquiries.filter((q) => q.status !== "Handled").length],
    ["cashflow", "Cash flow", 0],
  ];

  return (
    <div className="pt-28 md:pt-32 pb-24 px-[4%] md:px-[2%] max-w-[1000px] mx-auto">
      <h1 className="font-display text-display-md font-light mb-8">Broker panel</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat label="New requests" value={stats.newRequests} />
        <Stat label="Listings to approve" value={stats.toApprove} />
        <Stat label="Fees this month" value={formatRent(stats.month)} />
        <Stat label="Fees all time" value={formatRent(stats.total)} />
      </div>

      <div className="flex gap-2 border-b border-border mb-8 overflow-x-auto">
        {tabs.map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setParams({ tab: key })}
            className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 -mb-px ${
              tab === key ? "border-foreground font-medium" : "border-transparent text-muted-foreground"
            }`}
          >
            {label}
            {count > 0 && (
              <span className="ml-2 inline-block bg-accent text-accent-foreground text-[11px] rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "cashflow" ? (
        <CashFlowPanel canEdit />
      ) : loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
        </div>
      ) : tab === "listings" ? (
        <ListingsTab listings={listings} privateMap={privateMap} reload={load} />
      ) : tab === "renters" ? (
        <RenterRequestsTab rows={renters} reload={load} />
      ) : tab === "messages" ? (
        <MessagesTab inquiries={inquiries} reload={load} />
      ) : (
        <RequestsTab
          requests={requests}
          listingsById={listingsById}
          privateMap={privateMap}
          linksByRequest={linksByRequest}
          reload={load}
        />
      )}
    </div>
  );
}
