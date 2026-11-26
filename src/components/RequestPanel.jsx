import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import StatusBadge from "@/components/StatusBadge";
import { createRequest, getMyRequestForListing, updateProfile } from "@/api/rentals";

const inputClass =
  "w-full bg-transparent border border-border px-4 py-3 text-sm focus:border-foreground outline-none transition-colors";

const statusText = {
  new: "We've received your request and will contact you on WhatsApp.",
  accepted: "We'll send you the once-off fee amount and payment details on WhatsApp.",
  paid: "Payment received. We're linking you with the landlord.",
  linked: "You've been linked with the landlord. Open your account to see their details.",
  declined: "Sorry, we couldn't place you at this home.",
  closed: "This request is closed.",
};

export default function RequestPanel({ listing }) {
  const { user, profile, isAuthenticated, refreshProfile } = useAuth();
  const location = useLocation();
  const returnTo = encodeURIComponent(location.pathname);

  const [existing, setExisting] = useState(undefined); // undefined = loading
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPhone(profile?.phone || "");
  }, [profile]);

  useEffect(() => {
    if (!user) {
      setExisting(null);
      return;
    }
    getMyRequestForListing(listing.id, user.id)
      .then(setExisting)
      .catch(() => setExisting(null));
  }, [listing.id, user]);

  if (!isAuthenticated) {
    return (
      <div>
        <h3 className="font-heading text-2xl mb-2">Interested in this home?</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Create a free account to send a request. Requesting costs nothing.
        </p>
        <div className="flex flex-col gap-3">
          <Link to={`/register?returnTo=${returnTo}`} className="ghost-btn text-center">
            Create account
          </Link>
          <Link to={`/login?returnTo=${returnTo}`} className="text-sm text-center text-primary hover:underline">
            I already have an account
          </Link>
        </div>
      </div>
    );
  }

  if (listing.landlord_id && listing.landlord_id === user.id) {
    return <p className="text-sm text-muted-foreground">This is your listing.</p>;
  }

  if (existing === undefined) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (existing) {
    return (
      <div className="border border-primary/30 bg-primary/5 p-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="font-heading text-lg">Your request</div>
          <StatusBadge status={existing.status} />
        </div>
        <p className="text-sm text-muted-foreground">{statusText[existing.status]}</p>
        <Link to="/account" className="inline-block mt-4 text-sm text-primary hover:underline">
          Go to my account →
        </Link>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 9) {
      toast({ title: "Enter a phone number we can WhatsApp", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      if (phone.trim() !== (profile?.phone || "")) {
        await updateProfile(user.id, { phone: phone.trim() });
        refreshProfile();
      }
      const created = await createRequest({
        listing,
        uid: user.id,
        name: profile?.full_name,
        phone: phone.trim(),
        message: message.trim(),
        preferred_date: date,
      });
      setExisting(created);
    } catch (err) {
      toast({ title: "Couldn't send your request", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h3 className="font-heading text-2xl mb-2">Request this home</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Requesting is free. If we can place you, we'll WhatsApp you the once-off fee amount. After the fee is paid we
        share the landlord's contact and the exact address.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">
            Your WhatsApp number
          </label>
          <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0771 234 567" className={inputClass} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">
            Preferred viewing date (optional)
          </label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>
        <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Anything we should know? (optional)" className={`${inputClass} resize-none`} />
        <Button type="submit" className="w-full h-12" disabled={busy}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              Send request <Check size={16} />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
