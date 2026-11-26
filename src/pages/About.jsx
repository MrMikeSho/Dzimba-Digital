import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import InquiryForm from "../components/InquiryForm";
import { SITE, TOWN } from "@/lib/config";

export default function About() {
  const parallaxRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <section className="py-16 md:py-24 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
              About us
            </p>
            <h1 className="font-display text-display-lg font-light">
              Rentals in <span className="italic">{TOWN}</span>, made simple
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
              {SITE.name} is a rental broker. Landlords list their homes with
              us, and tenants send a request for the ones they like.
            </p>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              When we can place a tenant, a once-off fee is paid, and we then
              link the tenant with the landlord directly. We review every
              listing before it goes live.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="hairline max-w-[1400px] mx-auto" />

      <section className="py-16 md:py-24 px-[4%] md:px-[2%] max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
        <div>
          <h2 className="font-display text-display-sm font-light mb-4">For tenants</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
            Browsing is free and so is sending a request. We contact you on
            WhatsApp, and after the fee is paid you receive the landlord's
            contact and the exact address.
          </p>
          <Link to="/properties" className="ghost-btn inline-block">
            Browse listings
          </Link>
        </div>
        <div>
          <h2 className="font-display text-display-sm font-light mb-4">For landlords</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
            Submit your property with photos from your phone. Your address and
            phone number stay private until a tenant is linked to you.
          </p>
          <Link to="/list-property" className="ghost-btn inline-block">
            List your property
          </Link>
        </div>
      </section>

      <div className="w-full h-[400px] md:h-[550px] overflow-hidden relative">
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
      </div>

      <section
        id="contact"
        className="py-12 md:py-40 px-[4%] md:px-[2%] max-w-[1400px] mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <h2 className="font-display text-display-lg font-light mt-3 mb-6">
              Get in
              <br />
              <span className="italic">touch</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md">
              Questions about a listing, or want to list your home? Send us a
              message and we'll reply.
            </p>
          </div>
          <div className="md:border md:border-border/50 md:p-8">
            <InquiryForm />
          </div>
        </div>
      </section>
    </div>
  );
}
