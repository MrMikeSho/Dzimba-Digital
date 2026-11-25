import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { apiClient } from "@/api/client";
import HeroSection from "../components/home/HeroSection";
import HighPriorityListings from "../components/home/HighPriorityListings";
import NeighborhoodExpertise from "../components/home/NeighborhoodExpertise";
import ServicesOverview from "../components/home/ServicesOverview";
import AgentHighlights from "../components/home/AgentHighlights";
import ClientStories from "../components/home/ClientStories";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, a, t] = await Promise.all([
        apiClient.entities.Property.filter({ is_featured: true }, "-created_date", 6),
        apiClient.entities.Agent.filter({ is_featured: true }, "-created_date", 3),
        apiClient.entities.Testimonial.list("-created_date", 5),
      ]);

      const normalized = p.map((item) => ({
        ...item,
        featured_image: item.featured_image || item.image_url,
        images: item.images || item.gallery_urls || [item.image_url].filter(Boolean),
        neighborhood: item.neighborhood || item.district,
        price: item.price ?? item.price_monthly,
        bedrooms: item.bedrooms ?? item.rooms,
        sqft: item.sqft ?? item.area_sqm,
      }));

      const sorted = normalized.sort((x, y) => {
        if (x.title === "Marina District Mediterranean Villa") return -1;
        if (y.title === "Marina District Mediterranean Villa") return 1;
        return 0;
      });

      setProperties(sorted);
      setAgents(a);
      setTestimonials(t);
      setLoading(false);
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
      <HighPriorityListings properties={properties} />
      <div className="hairline max-w-[1400px] mx-auto" />
      <NeighborhoodExpertise />
      <ServicesOverview />
      <div className="hairline max-w-[1400px] mx-auto" />
      <AgentHighlights agents={agents} />
      <ClientStories testimonials={testimonials} />
      <section className="w-full h-[280px] md:h-[600px] overflow-hidden relative">
        <motion.div
          ref={parallaxRef}
          className="absolute inset-0 w-full h-[140%] top-[-20%]"
          style={{ y: parallaxY }}
        >
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1800&q=80"
            alt="Luxury modern home"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>
    </div>
  );
}
