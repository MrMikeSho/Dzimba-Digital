import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { FEATURE_OPTIONS, PROPERTY_TYPES, SUBURBS, TOWN } from "@/lib/config";
import { createListing, updateProfile, uploadListingImages } from "@/api/rentals";

const MAX_PHOTOS = 8;

const selectClass =
  "w-full h-12 bg-transparent border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function ListProperty() {
  const { user, profile, role, isAuthenticated, isBroker, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    property_type: "House",
    suburbChoice: "",
    suburbOther: "",
    rent_monthly: "",
    deposit: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    address: "",
    contact_name: "",
    contact_phone: "",
  });
  const [features, setFeatures] = useState([]);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isBroker) return;
    setForm((f) => ({
      ...f,
      contact_name: f.contact_name || profile?.full_name || "",
      contact_phone: f.contact_phone || profile?.phone || "",
    }));
  }, [profile, isBroker]);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const suburb = form.suburbChoice === "__other" ? form.suburbOther.trim() : form.suburbChoice;

  const addFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
    e.target.value = "";
  };

  const toggleFeature = (name) =>
    setFeatures((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-24 px-[4%] max-w-[560px] mx-auto text-center">
        <h1 className="font-display text-display-md font-light mb-4">List your property</h1>
        <p className="font-body text-muted-foreground mb-8">
          Create a free landlord account to submit your home. We review every listing before it goes live.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/register?role=landlord&returnTo=%2Flist-property" className="ghost-btn">
            Create landlord account
          </Link>
          <Link to="/login?returnTo=%2Flist-property" className="ghost-btn">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (role === "tenant") {
    const becomeLandlord = async () => {
      try {
        await updateProfile(user.id, { role: "landlord" });
        await refreshProfile();
      } catch (err) {
        toast({ title: "Couldn't switch", description: err.message, variant: "destructive" });
      }
    };
    return (
      <div className="pt-32 pb-24 px-[4%] max-w-[560px] mx-auto text-center">
        <h1 className="font-display text-display-md font-light mb-4">List your property</h1>
        <p className="font-body text-muted-foreground mb-8">
          Your account is a tenant account. Switch it to a landlord account to list a property.
        </p>
        <Button onClick={becomeLandlord}>Switch to landlord account</Button>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!suburb) {
      toast({ title: "Choose the suburb", variant: "destructive" });
      return;
    }
    if (!isBroker && files.length === 0) {
      toast({ title: "Add at least one photo", variant: "destructive" });
      return;
    }
    if (form.contact_phone.replace(/\D/g, "").length < 9) {
      toast({ title: "Enter a phone number for the landlord", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const images = files.length ? await uploadListingImages(files, user.id) : [];
      await createListing({
        asBroker: isBroker,
        uid: user.id,
        listing: {
          title: form.title.trim(),
          description: form.description.trim() || null,
          property_type: form.property_type,
          town: TOWN,
          suburb,
          rent_monthly: Number(form.rent_monthly),
          deposit: form.deposit === "" ? null : Number(form.deposit),
          bedrooms: form.bedrooms === "" ? null : Number(form.bedrooms),
          bathrooms: form.bathrooms === "" ? null : Number(form.bathrooms),
          features,
          images,
        },
        priv: {
          address: form.address.trim() || null,
          contact_name: form.contact_name.trim() || null,
          contact_phone: form.contact_phone.trim(),
        },
      });
      toast({
        title: isBroker ? "Listing published" : "Submitted for approval",
        description: isBroker
          ? "It's live on the site."
          : "We'll review it and it will go live once approved.",
      });
      navigate(isBroker ? "/broker?tab=listings" : "/account");
    } catch (err) {
      toast({ title: "Couldn't submit", description: err.message, variant: "destructive" });
      setBusy(false);
    }
  };

  return (
    <div className="pt-28 md:pt-32 pb-24 px-[4%] md:px-[2%] max-w-[760px] mx-auto">
      <h1 className="font-display text-display-md font-light mb-2">
        {isBroker ? "Add a listing" : "List your property"}
      </h1>
      <p className="font-body text-sm text-muted-foreground mb-10">
        {isBroker
          ? "Listings you add are published immediately."
          : "We review every listing before it goes live. Your address and phone number stay private until a tenant is linked to you."}
      </p>

      <form onSubmit={submit} className="space-y-8">
        <Field label="Title">
          <Input required value={form.title} onChange={set("title")} placeholder="e.g. 3-bedroom house in Fairbridge Park" className="h-12" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Type">
            <select value={form.property_type} onChange={set("property_type")} className={selectClass}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label={`Suburb (${TOWN})`}>
            <select required value={form.suburbChoice} onChange={set("suburbChoice")} className={selectClass}>
              <option value="">Choose…</option>
              {SUBURBS.map((s) => (
                <option key={s}>{s}</option>
              ))}
              <option value="__other">Other…</option>
            </select>
            {form.suburbChoice === "__other" && (
              <Input value={form.suburbOther} onChange={set("suburbOther")} placeholder="Type the suburb" className="h-12 mt-2" required />
            )}
          </Field>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Field label="Rent per month ($)">
            <Input required type="number" min="1" inputMode="decimal" value={form.rent_monthly} onChange={set("rent_monthly")} className="h-12" />
          </Field>
          <Field label="Deposit ($)">
            <Input type="number" min="0" inputMode="decimal" value={form.deposit} onChange={set("deposit")} className="h-12" />
          </Field>
          <Field label="Bedrooms">
            <Input type="number" min="0" inputMode="numeric" value={form.bedrooms} onChange={set("bedrooms")} className="h-12" />
          </Field>
          <Field label="Bathrooms">
            <Input type="number" min="0" inputMode="numeric" value={form.bathrooms} onChange={set("bathrooms")} className="h-12" />
          </Field>
        </div>

        <Field label="Description" hint="Tell tenants what makes the home good: size, condition, nearby schools or shops.">
          <Textarea rows={5} value={form.description} onChange={set("description")} />
        </Field>

        <div className="space-y-3">
          <Label>Features</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FEATURE_OPTIONS.map((f) => (
              <label key={f} className="flex items-center gap-3 text-sm border border-border px-3 py-3 cursor-pointer">
                <input type="checkbox" checked={features.includes(f)} onChange={() => toggleFeature(f)} className="w-4 h-4" />
                {f}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Photos {isBroker ? "(optional)" : `(1 to ${MAX_PHOTOS})`}</Label>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addFiles} className="block w-full text-sm" />
          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <div key={src} className="relative aspect-square">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Photos are shrunk automatically to save data. The first photo is the cover.</p>
        </div>

        <div className="border border-border p-5 space-y-5">
          <div>
            <p className="font-display text-xl">Private details</p>
            <p className="text-xs text-muted-foreground mt-1">
              Only {isBroker ? "you" : "our broker"} can see these. Tenants receive them only after they are linked to the landlord.
            </p>
          </div>
          <Field label="Exact address">
            <Input value={form.address} onChange={set("address")} placeholder="Stand number, street, suburb" className="h-12" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Landlord name">
              <Input value={form.contact_name} onChange={set("contact_name")} className="h-12" />
            </Field>
            <Field label="Landlord phone (WhatsApp)">
              <Input required type="tel" value={form.contact_phone} onChange={set("contact_phone")} className="h-12" />
            </Field>
          </div>
        </div>

        <Button type="submit" className="w-full h-12" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading…
            </>
          ) : isBroker ? (
            "Publish listing"
          ) : (
            "Submit for approval"
          )}
        </Button>
      </form>
    </div>
  );
}
