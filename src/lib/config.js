// Site-wide settings. Edit the lists below to change what people can pick.

export const SITE = {
  name: "Dzimba Digital",
  tagline: "Connecting tenants and landlords",
};

export const TOWN = "Mutare";

export const SUBURBS = [
  "Avenues",
  "Bordervale",
  "Chikanga",
  "Dangamvura",
  "Darlington",
  "Fairbridge Park",
  "Fern Valley",
  "Florida",
  "Greenside",
  "Hobhouse",
  "Morningside",
  "Murambi",
  "Palmerston",
  "Sakubva",
  "Tigers Kloof",
  "Utopia",
  "Weirmouth",
  "Westlea",
  "Yeovil",
];

export const PROPERTY_TYPES = ["Room", "Cottage", "Flat", "House", "Townhouse", "Commercial"];

export const PRICE_RANGES = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under $150", min: 0, max: 150 },
  { label: "$150 – $300", min: 150, max: 300 },
  { label: "$300 – $600", min: 300, max: 600 },
  { label: "$600+", min: 600, max: Infinity },
];

export const FEATURE_OPTIONS = [
  "Borehole",
  "Solar / backup power",
  "Prepaid electricity meter",
  "Fenced / walled",
  "Garage / parking",
  "Furnished",
  "Tiled floors",
  "Security / alarm",
  "Own entrance",
  "Pets allowed",
];

export const FEE_PRESETS = [5, 7, 10];

export const STATUS_LABELS = {
  // listings
  pending: "Awaiting approval",
  approved: "Live",
  rejected: "Not approved",
  rented: "Rented",
  // requests
  new: "Received",
  accepted: "Fee requested",
  paid: "Fee paid",
  linked: "Linked",
  declined: "Declined",
  closed: "Closed",
};

export function formatRent(n) {
  if (n === null || n === undefined || n === "") return "";
  return `$${Number(n).toLocaleString("en-US")}`;
}

// Turns a Zimbabwean phone number into the digits WhatsApp links need.
export function toWhatsAppNumber(phone) {
  let d = String(phone || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("263")) return d;
  if (d.startsWith("0")) return "263" + d.slice(1);
  if (d.length === 9) return "263" + d;
  return d;
}

export function waLink(phone, text) {
  const num = toWhatsAppNumber(phone);
  return `https://wa.me/${num}?text=${encodeURIComponent(text || "")}`;
}

const first = (name) => (name || "there").trim().split(/\s+/)[0];

export function feeRequestMessage({ tenantName, listingTitle, amount }) {
  return (
    `Hi ${first(tenantName)}, this is ${SITE.name}. Thanks for your interest in "${listingTitle}". ` +
    `To link you with the landlord we charge a once-off fee of $${amount}. ` +
    `Reply here and I'll send the EcoCash / Paynow payment details. ` +
    `Once the fee is received I'll share the landlord's contact and the exact address.`
  );
}

export function tenantLinkedMessage(link) {
  return (
    `Hi ${first(link.tenant_name)}, your payment is received, thank you. ` +
    `Landlord for "${link.listing_title}": ${link.landlord_name || "see below"}` +
    `${link.landlord_phone ? `, ${link.landlord_phone}` : ""}. ` +
    `${link.address ? `Address: ${link.address}. ` : ""}` +
    `Please contact them to arrange a viewing.`
  );
}

export function landlordLinkedMessage(link) {
  return (
    `Hi ${first(link.landlord_name)}, I've linked a tenant interested in "${link.listing_title}": ` +
    `${link.tenant_name || "Tenant"}${link.tenant_phone ? `, ${link.tenant_phone}` : ""}. ` +
    `They will contact you to arrange a viewing.`
  );
}
