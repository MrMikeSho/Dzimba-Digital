import { motion } from "framer-motion";
import { Search, Send, Wallet, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: Search,
    title: "Browse for free",
    description:
      "Look through approved listings by area, type and price. You don't need an account to look around.",
  },
  {
    icon: Send,
    title: "Send a request",
    description:
      "Create a free account and request the home you like. Requesting costs nothing.",
  },
  {
    icon: Wallet,
    title: "Pay a once-off fee",
    description:
      "If we can place you, we WhatsApp you the fee amount and the EcoCash or Paynow payment details.",
  },
  {
    icon: KeyRound,
    title: "Get linked to the landlord",
    description:
      "Once the fee is received, we share the landlord's contact and the exact address so you can arrange a viewing.",
  },
];

export default function ServicesOverview() {
  return (
    <section className="py-24 md:py-40 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
        <div>
          <h2 className="font-display text-display-lg font-light mt-3">
            How renting
            <br />
            <span className="italic">works</span>
          </h2>
          <p className="font-body text-muted-foreground text-base mt-6 leading-snug max-w-md">
            We connect tenants with landlords. Landlords list their homes with
            us; we review each one before it goes live.
          </p>
          <Link to="/list-property" className="ghost-btn inline-block mt-8 text-sm">
            I'M A LANDLORD
          </Link>
        </div>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="py-8 border-b border-border/90 first:border-t"
            >
              <div className="flex items-start gap-5">
                <step.icon size={20} className="text-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-display text-xl font-light mb-2">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
