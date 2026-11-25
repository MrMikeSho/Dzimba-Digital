import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiClient } from "@/api/client";

export default function AdvisorsSection() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    apiClient.entities.Agent.list("-created_date", 12).then(setAgents);
  }, []);

  return (
    <section className="py-16 md:py-32 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
      <div className="mb-12 md:mb-16">
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
          The Team
        </p>
        <h2 className="font-display text-display-lg font-light">
          Our <span className="italic">Advisors</span>
        </h2>
      </div>

      {agents.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground">
          Our advisor profiles are coming soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              {agent.photo && (
                <div className="aspect-[4/5] overflow-hidden mb-5">
                  <img
                    src={agent.photo}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h3 className="font-display text-2xl font-light">{agent.name}</h3>
              <p className="font-body text-xs tracking-label uppercase text-muted-foreground mt-1">
                {agent.title}
              </p>
              {agent.total_sales_volume && (
                <p className="font-body text-sm text-muted-foreground mt-3">
                  {agent.total_sales_volume} in transactions
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
