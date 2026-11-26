import LegalPage from "../components/LegalPage";

const sections = [
  {
    title: "What this notice covers",
    text: "This notice explains what information Dzimba Digital collects through this website, why we collect it, and who can see it. It describes how the site works and is not legal advice.",
  },
  {
    title: "What we collect",
    text: "When you create an account we collect your name, phone number and email address. When you send a request for a home, we record the request and any message or preferred date you add. When a landlord lists a property, we collect the listing details, photos, the exact address and the landlord's contact details. If you use a contact form on the site, we collect what you type into it.",
  },
  {
    title: "Why we collect it",
    text: "We use this information to run the rental service: to review listings, to contact tenants and landlords (usually on WhatsApp), to record the once-off fee, and to link a tenant with a landlord.",
  },
  {
    title: "Who can see it",
    text: "Listing photos and general details (area, rent, rooms and features) are public. A listing's exact address and the landlord's phone number are private. They are visible only to the landlord and to us, until we link a tenant to that landlord. At that point the tenant receives the landlord's contact and address, and the landlord receives the tenant's name and phone number. We do not sell your information.",
  },
  {
    title: "Where it is stored",
    text: "Your information is stored in a database and file storage service provided by Supabase. The website is hosted by Vercel. Passwords are not stored by us in readable form.",
  },
  {
    title: "Your choices",
    text: "You can update your name and phone number from your account page, cancel a request that has not yet been actioned, and delete your own listings. To have your account and information removed, send us a message using the contact form.",
  },
];

export default function Privacy() {
  return <LegalPage title="Privacy Policy" sections={sections} />;
}
