import { motion } from "framer-motion";

const stats = [
  { value: "15+", label: "Years of experience" },
  { value: "$120M+", label: "Property managed" },
  { value: "98%", label: "Client satisfaction" },
];

export default function MissionSection() {
  return (
    <section className="py-16 md:py-32 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
            Our Mission
          </p>
          <h1 className="font-display text-display-lg font-light">
            Homes with <span className="italic">purpose</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
            We believe finding a home should feel personal, transparent and
            unhurried. Our team pairs deep local knowledge with honest advice, so
            every client can make confident decisions about where they live and
            invest.
          </p>
          <p className="font-body text-base text-muted-foreground leading-relaxed">
            From the first viewing to the final handover, we manage the details
            with discretion and care, so you can focus on what matters.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mt-16 md:mt-24 text-center">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
          >
            <p className="font-display text-display-md font-light">{s.value}</p>
            <p className="font-body text-xs tracking-label uppercase text-muted-foreground mt-2">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
