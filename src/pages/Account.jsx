import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Phone, MessageCircle, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import StatusBadge from "@/components/StatusBadge";
import { formatRent, waLink } from "@/lib/config";
import {
  cancelRequest,
  deleteListing,
  getMyLinks,
  getMyListings,
  getMyRequests,
  updateProfile,
  amCashflowViewer,
} from "@/api/rentals";

const requestHelp = {
  new: "We've received your request and will contact you on WhatsApp.",
  accepted:
    "We'll send you the once-off fee amount and payment details on WhatsApp.",
  paid: "Payment received. We are linking you with the landlord.",
  linked: "You've been linked with the landlord. Their details are below.",
  declined: "Sorry, we couldn't place you at this home.",
  closed: "This request is closed.",
};

function Section({ title, children, action }) {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-light">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Account() {
  const { user, profile, role, isAuthenticated, isBroker, refreshProfile, logout } =
    useAuth();
  const [isViewer, setIsViewer] = useState(false);
  useEffect(() => {
    if (user?.email) amCashflowViewer(user.email).then(setIsViewer).catch(() => {});
  }, [user?.email]);
  const [requests, setRequests] = useState([]);
  const [links, setLinks] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const uid = user?.id;

  const load = useCallback(async () => {
    if (!uid) return;
    try {
      const [r, l, p] = await Promise.all([
        getMyRequests(uid),
        getMyLinks(uid),
        getMyListings(uid),
      ]);
      setRequests(r);
      setLinks(l);
      setListings(p);
    } catch (err) {
      toast({ title: "Couldn't load your account", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setName(profile?.full_name || "");
    setPhone(profile?.phone || "");
  }, [profile]);

  if (!isAuthenticated) {
    return <Navigate to="/login?returnTo=%2Faccount" replace />;
  }

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(uid, { full_name: name.trim(), phone: phone.trim() });
      await refreshProfile();
      toast({ title: "Saved" });
    } catch (err) {
      toast({ title: "Couldn't save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const switchRole = async (next) => {
    try {
      await updateProfile(uid, { role: next });
      await refreshProfile();
      toast({ title: next === "landlord" ? "Landlord account on" : "Tenant account on" });
    } catch (err) {
      toast({ title: "Couldn't switch", description: err.message, variant: "destructive" });
    }
  };

  const removeListing = async (id) => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await deleteListing(id);
      load();
    } catch (err) {
      toast({ title: "Couldn't delete", description: err.message, variant: "destructive" });
    }
  };

  const withdraw = async (id) => {
    if (!window.confirm("Cancel this request?")) return;
    try {
      await cancelRequest(id);
      load();
    } catch (err) {
      toast({ title: "Couldn't cancel", description: err.message, variant: "destructive" });
    }
  };

  const myTenantLinks = links.filter((l) => l.tenant_id === uid);
  const myLandlordLinks = links.filter((l) => l.landlord_id === uid);
  const showListings = role === "landlord" || isBroker || listings.length > 0;

  return (
    <div className="pt-28 md:pt-32 pb-24 px-[4%] md:px-[2%] max-w-[900px] mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-2">
            {isBroker ? "Broker" : role === "landlord" ? "Landlord account" : "Tenant account"}
          </p>
          <h1 className="font-display text-display-md font-light">
            Hello{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">{user.email}</p>
        </div>
        <Button variant="outline" onClick={logout}>
          Log out
        </Button>
      </div>

      {isBroker && (
        <Link
          to="/broker"
          className="block mt-8 border border-foreground p-5 hover:bg-foreground hover:text-background transition-colors"
        >
          <span className="font-display text-xl">Open the broker panel →</span>
          <span className="block font-body text-sm opacity-70 mt-1">
            Requests, listings and messages
          </span>
        </Link>
      )}

      {isViewer && !isBroker && (
        <Link
          to="/cashflow"
          className="block mt-8 border border-foreground p-5 hover:bg-foreground hover:text-background transition-colors"
        >
          <span className="font-display text-xl">View cash flow →</span>
        </Link>
      )}

      <Section title="Your details">
        <form onSubmit={saveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="acc-name">Full name</Label>
            <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acc-phone">Phone (WhatsApp)</Label>
            <Input id="acc-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12" />
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save details"}
            </Button>
            {!isBroker && role === "tenant" && (
              <button type="button" onClick={() => switchRole("landlord")} className="text-sm text-primary hover:underline">
                I'm a landlord: switch my account
              </button>
            )}
            {!isBroker && role === "landlord" && (
              <button type="button" onClick={() => switchRole("tenant")} className="text-sm text-primary hover:underline">
                I'm looking to rent: switch my account
              </button>
            )}
          </div>
        </form>
      </Section>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {myTenantLinks.length > 0 && (
            <Section title="Your landlord details">
              <div className="space-y-4">
                {myTenantLinks.map((l) => (
                  <div key={l.id} className="border border-border p-5">
                    <p className="font-display text-xl">{l.listing_title}</p>
                    <p className="font-body text-sm mt-3">
                      <span className="text-muted-foreground">Landlord: </span>
                      {l.landlord_name || "See phone number"}
                    </p>
                    {l.address && (
                      <p className="font-body text-sm mt-1 flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 shrink-0" /> {l.address}
                      </p>
                    )}
                    {l.landlord_phone && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        <a className="ghost-btn text-xs" href={`tel:${l.landlord_phone}`}>
                          <Phone size={14} className="mr-2" /> {l.landlord_phone}
                        </a>
                        <a
                          className="ghost-btn text-xs"
                          target="_blank"
                          rel="noreferrer"
                          href={waLink(l.landlord_phone, `Hi, I'm interested in "${l.listing_title}". ${l.tenant_name ? `I'm ${l.tenant_name}.` : ""} Dzimba Digital linked us.`)}
                        >
                          <MessageCircle size={14} className="mr-2" /> WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {myLandlordLinks.length > 0 && (
            <Section title="Tenants linked to your properties">
              <div className="space-y-4">
                {myLandlordLinks.map((l) => (
                  <div key={l.id} className="border border-border p-5">
                    <p className="font-display text-xl">{l.listing_title}</p>
                    <p className="font-body text-sm mt-3">
                      <span className="text-muted-foreground">Tenant: </span>
                      {l.tenant_name || "See phone number"}
                    </p>
                    {l.tenant_phone && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        <a className="ghost-btn text-xs" href={`tel:${l.tenant_phone}`}>
                          <Phone size={14} className="mr-2" /> {l.tenant_phone}
                        </a>
                        <a className="ghost-btn text-xs" target="_blank" rel="noreferrer" href={waLink(l.tenant_phone, `Hi ${l.tenant_name || ""}, regarding "${l.listing_title}".`)}>
                          <MessageCircle size={14} className="mr-2" /> WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="Your requests">
            {requests.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">
                You haven't requested a home yet.{" "}
                <Link to="/properties" className="text-primary hover:underline">
                  Browse listings
                </Link>
              </p>
            ) : (
              <div className="space-y-4">
                {requests.map((r) => (
                  <div key={r.id} className="border border-border p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Link to={`/property/${r.listing_id}`} className="font-display text-xl hover:text-accent transition-colors">
                        {r.listing_title || "Property"}
                      </Link>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="font-body text-sm text-muted-foreground mt-2">
                      {requestHelp[r.status]}
                    </p>
                    {r.fee_amount != null && (
                      <p className="font-body text-sm mt-2">Fee: {formatRent(r.fee_amount)}</p>
                    )}
                    {r.status === "new" && (
                      <button type="button" onClick={() => withdraw(r.id)} className="text-xs text-destructive hover:underline mt-3">
                        Cancel request
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {showListings && (
            <Section
              title="Your properties"
              action={
                <Link to="/list-property" className="ghost-btn text-xs">
                  Add a property
                </Link>
              }
            >
              {listings.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground">
                  You haven't listed a property yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {listings.map((l) => (
                    <div key={l.id} className="border border-border p-4 flex gap-4">
                      <img src={l.featured_image} alt="" className="w-24 h-20 object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-display text-lg leading-tight">{l.title}</p>
                          <StatusBadge status={l.status} />
                        </div>
                        <p className="font-body text-sm text-muted-foreground mt-1">
                          {[l.suburb, l.town].filter(Boolean).join(", ")} · {formatRent(l.rent_monthly)}/mo
                        </p>
                        <div className="flex gap-4 mt-2 text-xs">
                          {l.status === "approved" && (
                            <Link to={`/property/${l.id}`} className="text-primary hover:underline">
                              View
                            </Link>
                          )}
                          <button type="button" onClick={() => removeListing(l.id)} className="text-destructive hover:underline">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}
        </>
      )}
    </div>
  );
}
