import { supabase } from "@/lib/supabase";

export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="#e7e2da"/><text x="50%" y="50%" fill="#8a8178" font-family="sans-serif" font-size="36" text-anchor="middle">No photo yet</text></svg>'
  );

// Maps a database row to the field names the page components read.
export function normalizeListing(row) {
  if (!row) return null;
  const images = Array.isArray(row.images) ? row.images : [];
  const cover = images[0] || PLACEHOLDER_IMG;
  return {
    ...row,
    type: row.property_type,
    city: row.town,
    district: row.suburb,
    neighborhood: row.suburb,
    price: row.rent_monthly,
    price_monthly: row.rent_monthly,
    featured_image: cover,
    image_url: cover,
    gallery_urls: images,
    created_date: row.created_at,
  };
}

const blogPosts = [
  {
    id: "bp1",
    slug: "how-renting-with-dzimba-digital-works",
    title: "How renting with Dzimba Digital works",
    category: "Tenants",
    read_time: 3,
    author_name: "Dzimba Digital",
    featured_image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    excerpt: "Browse for free, send a request, and we link you with the landlord.",
    content:
      "Browsing listings is free and you don't need an account to look around.\n\nWhen you find a home you like, create a free account and send a request. We contact you on WhatsApp to confirm the details.\n\nIf we can place you, we send the once-off fee amount and the payment details. Once the fee is received, we share the landlord's contact and the exact address so you can arrange a viewing.",
    created_date: "2026-11-26T00:00:00.000Z",
  },
  {
    id: "bp2",
    slug: "landlords-photos-that-get-your-home-rented",
    title: "Landlords: photos that get your home rented",
    category: "Landlords",
    read_time: 3,
    author_name: "Dzimba Digital",
    featured_image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    excerpt: "Simple tips for taking photos that make tenants ask for a viewing.",
    content:
      "Clear photos are the biggest reason a tenant asks about a home. Tidy each room first and open the curtains for natural light.\n\nPhotograph every room, the kitchen, the bathroom, the yard and the outside of the house. Hold your phone sideways, and keep it steady.\n\nUpload at least four photos when you submit your property. We review each listing before it goes live.",
    created_date: "2026-11-25T00:00:00.000Z",
  },
  {
    id: "bp3",
    slug: "tenants-viewing-checklist",
    title: "Tenants: a viewing checklist",
    category: "Tenants",
    read_time: 3,
    author_name: "Dzimba Digital",
    featured_image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    excerpt: "What to check before you agree to rent a home.",
    content:
      "Check the water supply, the electricity meter and the roof for leaks. Open and close the windows and doors, and test the locks.\n\nAsk what is included in the rent, how the deposit works, and who to call if something breaks.\n\nWrite down what you agree with the landlord before you pay anything towards the rent.",
    created_date: "2026-11-24T00:00:00.000Z",
  },
];

export const apiClient = {
  entities: {
    // Live listings only. Brokers and landlords use src/api/rentals.js.
    Property: {
      async list(_sort, limit = 100) {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .in("status", ["approved", "reserved"])
          .order("created_at", { ascending: false })
          .limit(limit);
        if (error) throw error;
        return (data || []).map(normalizeListing);
      },
      async get(id) {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        return normalizeListing(data);
      },
    },
    Inquiry: {
      async create(record) {
        const { error } = await supabase.from("inquiries").insert({
          full_name: record.full_name || null,
          email: record.email || null,
          phone: record.phone || null,
          message: record.message || null,
          inquiry_type: record.inquiry_type || null,
          preferred_date: record.preferred_date || null,
          property_id: record.property_id || null,
        });
        if (error) throw error;
        return true;
      },
    },
    BlogPost: {
      async list(_sort, limit = 20) {
        return blogPosts.slice(0, limit);
      },
      async filter(query = {}, _sort, limit = 20) {
        return blogPosts
          .filter((p) => Object.entries(query).every(([k, v]) => p[k] === v))
          .slice(0, limit);
      },
    },
  },
  auth: {
    async me() {
      const { data } = await supabase.auth.getSession();
      return data.session?.user || null;
    },
    async loginViaEmailPassword(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.user;
    },
    async register({ email, password, full_name, phone, role }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, phone, role: role === "landlord" ? "landlord" : "tenant" },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { needsConfirmation: !data.session, user: data.user };
    },
    async verifyOtp({ email, otpCode }) {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "signup",
      });
      if (error) throw error;
      return data;
    },
    async resendOtp(email) {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      return true;
    },
    async resetPasswordRequest(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return true;
    },
    async updatePassword(newPassword) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return true;
    },
  },
};
