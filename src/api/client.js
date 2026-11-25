const STORAGE_KEYS = {
  PROPERTIES: "native_app_properties",
  AGENTS: "native_app_agents",
  TESTIMONIALS: "native_app_testimonials",
  INQUIRIES: "native_app_inquiries",
  USER: "native_app_user",
  TOKEN: "native_app_token",
};

const defaultProperties = [
  {
    id: "fb1",
    title: "Marina District Mediterranean Villa",
    type: "Villa",
    property_type: "Villa",
    city: "Zurich",
    district: "Hottingen",
    neighborhood: "Marina District",
    price_monthly: 5800,
    price: 5800,
    rooms: 4.5,
    bedrooms: 4,
    bathrooms: 3,
    garage: 2,
    area_sqm: 168,
    sqft: 1808,
    floor: "6th floor",
    is_featured: true,
    is_high_priority: true,
    image_url:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    featured_image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    gallery_urls: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    ],
    description:
      "A remarkable residence combining generous proportions with architectural clarity, natural stone, warm oak, and refined living spaces.",
    features: [
      "Terrace",
      "Air conditioning",
      "Parking",
      "Panoramic views",
      "Fitted kitchen",
      "Underfloor heating",
    ],
    atmosphere: "Modern",
    available_from: "2026-09-01",
    status: "available",
    created_date: "2026-11-01T00:00:00.000Z",
  },
];

const defaultAgents = [
  {
    id: "ag1",
    name: "Elena Vance",
    title: "Senior Property Advisor",
    is_featured: true,
    total_sales_volume: "$48M+",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
    created_date: "2026-11-01T00:00:00.000Z",
  },
];

const defaultTestimonials = [
  {
    id: "tm1",
    client_name: "Marcus & Claire",
    property_type: "Penthouse",
    location: "Marina District",
    quote: "Seamless execution from initial viewing to final handover.",
    created_date: "2026-11-01T00:00:00.000Z",
  },
];

function getCollection(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function createEntityStore(storageKey, fallback) {
  return {
    async list(_sort, limit = 100) {
      return getCollection(storageKey, fallback).slice(0, limit);
    },
    async filter(query = {}, _sort, limit = 100) {
      const items = getCollection(storageKey, fallback);
      return items
        .filter((item) =>
          Object.entries(query).every(([k, v]) => item[k] === v)
        )
        .slice(0, limit);
    },
    async get(id) {
      const items = getCollection(storageKey, fallback);
      return items.find((item) => item.id === id) || null;
    },
    async create(record) {
      const items = getCollection(storageKey, fallback);
      const created = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now()),
        created_date: new Date().toISOString(),
        ...record,
      };
      localStorage.setItem(storageKey, JSON.stringify([created, ...items]));
      return created;
    },
  };
}

export const apiClient = {
  entities: {
    Property: createEntityStore(STORAGE_KEYS.PROPERTIES, defaultProperties),
    Agent: createEntityStore(STORAGE_KEYS.AGENTS, defaultAgents),
    Testimonial: createEntityStore(
      STORAGE_KEYS.TESTIMONIALS,
      defaultTestimonials
    ),
    Inquiry: createEntityStore(STORAGE_KEYS.INQUIRIES, []),
  },
  auth: {
    async loginViaEmailPassword(email, _password) {
      const user = { email, id: "local-user" };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, "local-session-token");
      return user;
    },
    async register({ email }) {
      return { email, pendingOtp: true };
    },
    async verifyOtp({ email }) {
      const user = { email, id: "local-user" };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { access_token: "local-session-token", user };
    },
    async resendOtp() {
      return true;
    },
    async resetPasswordRequest() {
      return true;
    },
    async resetPassword() {
      return true;
    },
    setToken(token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    },
    loginWithProvider(_provider, returnTo = "/") {
      window.location.href = returnTo;
    },
  },
};
