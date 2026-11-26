import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiClient } from "@/api/client";

// Shows the areas that currently have live listings, with a count for each.
export default function NeighborhoodExpertise() {
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    apiClient.entities.Property.list("-created_date", 500)
      .then((properties) => {
        const counts = {};
        properties.forEach((p) => {
          if (p.suburb) counts[p.suburb] = (counts[p.suburb] || 0) + 1;
        });
        setAreas(
          Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
        );
      })
      .catch(() => setAreas([]));
  }, []);

  if (areas.length === 0) return null;

  return (
    <section className="py-24 md:py-40 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
      <h2 className="font-display text-display-lg font-light mb-12">
        Browse by <span className="italic">area</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {areas.map(([name, count], i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link
              to={`/properties?location=${encodeURIComponent(name)}`}
              className="block border border-border p-6 md:p-8 hover:bg-foreground hover:text-background transition-colors"
            >
              <p className="font-display text-2xl md:text-3xl font-light">{name}</p>
              <p className="font-body text-xs tracking-label uppercase opacity-70 mt-2">
                {count} {count === 1 ? "listing" : "listings"}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
