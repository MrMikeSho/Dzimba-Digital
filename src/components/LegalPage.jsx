import { motion } from "framer-motion";

// Shared layout for the Terms, Privacy and Accessibility pages.
// `sections` is an array of { title, text, items? }. Paragraphs in `text`
// are separated by a blank line.
export default function LegalPage({ title, sections }) {
  return (
    <div className="min-h-screen">
      <section className="pt-32 md:pt-40 pb-24 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-[760px]"
        >
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
            Legal
          </p>
          <h1 className="font-display text-display-lg font-light mb-16">{title}</h1>

          <div className="space-y-14">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="hairline mb-8" />
                <h2 className="font-display text-display-sm font-light mb-4">
                  {section.title}
                </h2>
                {section.text.split("\n\n").map((para, j) => (
                  <p
                    key={j}
                    className="font-body text-sm text-muted-foreground leading-relaxed mb-4 last:mb-0"
                  >
                    {para}
                  </p>
                ))}
                {section.items && (
                  <ul className="space-y-2 mt-4">
                    {section.items.map((item, k) => (
                      <li
                        key={k}
                        className="font-body text-sm text-muted-foreground leading-relaxed flex gap-3"
                      >
                        <span className="text-accent mt-1">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
