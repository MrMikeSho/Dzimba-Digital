import LegalPage from "../components/LegalPage";

const sections = [
  {
    title: "Our commitment",
    text: "We are working to make this site accessible to people with disabilities. This statement was last updated on 25 November 2026.",
  },
  {
    title: "What web accessibility is",
    text: "An accessible site allows visitors with disabilities to browse the site with the same or a similar level of ease and enjoyment as other visitors. This can be achieved with the capabilities of the system on which the site is operating, and through assistive technologies.",
  },
  {
    title: "Accessibility adjustments on this site",
    text: "We aim to make the contents of this site work with assistive technologies such as screen readers and keyboard navigation. As part of this effort, we have:",
    items: [
      "Set the language of the site",
      "Defined clear heading structures on the site's pages",
      "Added alternative text to images",
      "Used colour combinations designed for readable contrast",
      "Kept motion subtle and non-essential",
    ],
  },
  {
    title: "Feedback and contact",
    text: "If you find an accessibility problem on this site, or need information in a different format, please let us know using the contact form on our Sell page and we will do our best to help.",
  },
];

export default function Accessibility() {
  return <LegalPage title="Accessibility Statement" sections={sections} />;
}
