import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { apiClient } from "@/api/client";
import HeroSection from "../components/home/HeroSection";
import HighPriorityListings from "../components/home/HighPriorityListings";
import NeighborhoodExpertise from "../components/home/NeighborhoodExpertise";
import ServicesOverview from "../components/home/ServicesOverview";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setProperties(await apiClient.entities.Property.list("-created_date", 4));
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const parallaxRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <HeroSection heroImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80" />

      {properties.length > 0 ? (
        <HighPriorityListings properties={properties} />
      ) : (
        <section className="py-24 md:py-40 px-[4%] max-w-[760px] mx-auto text-center">
          <h2 className="font-display text-display-md font-light">
            New listings <span className="italic">coming soon</span>
          </h2>
          <p className="font-body text-muted-foreground mt-6">
            Are you a landlord? List your property and we'll find you a tenant.
          </p>
          <Link to="/list-property" className="ghost-btn inline-block mt-8">
            List your property
          </Link>
        </section>
      )}

      <div className="hairline max-w-[1400px] mx-auto" />
      <NeighborhoodExpertise />
      <ServicesOverview />

      <section className="w-full h-[280px] md:h-[600px] overflow-hidden relative">
        <motion.div
          ref={parallaxRef}
          className="absolute inset-0 w-full h-[140%] top-[-20%]"
          style={{ y: parallaxY }}
        >
          <img
            src="/images/home-garden.jpg"
            alt="Modern home"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>
    </div>
  );
}
