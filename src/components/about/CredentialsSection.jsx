import { motion } from "framer-motion";
import { Award, ShieldCheck, Handshake } from "lucide-react";

const credentials = [
  {
    icon: Award,
    title: "Experienced & Accredited",
    description:
      "Our advisors hold the professional qualifications and local market experience that clients expect.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Process",
    description:
      "Clear pricing, honest feedback and regular updates at every stage of your search or sale.",
  },
  {
    icon: Handshake,
    title: "Long-Term Relationships",
    description:
      "Most of our work comes from repeat clients and referrals, which we never take for granted.",
  },
];

export default function CredentialsSection() {
  return (
    <section className="py-16 md:py-32 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
      <div className="text-center mb-12 md:mb-16">
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
          Why Choose Us
        </p>
        <h2 className="font-display text-display-lg font-light">
          Credentials &amp; <span className="italic">Care</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
        {credentials.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            className="text-center"
          >
            <c.icon size={28} className="text-accent mx-auto mb-4" />
            <h3 className="font-display text-xl font-light mb-3">{c.title}</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {c.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
