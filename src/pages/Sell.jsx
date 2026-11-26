import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import InquiryForm from "../components/InquiryForm";

export default function Sell() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#contact") {
      setTimeout(() => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location.hash]);

  const benefits = [
    "Submit your home in minutes, with photos from your phone",
    "Every listing is reviewed before it goes live",
    "Your address and phone number stay private until a tenant is linked to you",
    "We receive tenant requests and link you with interested tenants",
    "Follow your listings and linked tenants from your account",
    "Questions? Message us any time",
  ];

  return (
    <div className="min-h-screen">
      {/* Intro Section */}
      <section className="pt-32 md:pt-40 pb-24 md:pb-32 px-[2%] max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-display-lg font-light mt-3 mb-6">
            Landlords, <span className="italic">list with us</span>
          </h1>
          <p className="font-body text-muted-foreground max-w-[600px] leading-relaxed text-base">
            Have a property to rent out in Mutare? Submit it with us. Tenants
            send requests for the homes they like, and we link you directly
            with interested tenants.
          </p>
          <Link to="/list-property" className="ghost-btn inline-block mt-8">
            List your property
          </Link>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 md:py-40 px-[2%] max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="font-display text-display-md font-light">
            How it <span className="italic">works for you</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex gap-4"
            >
              <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <p className="font-body text-base text-foreground leading-relaxed">
                {benefit}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Full Width Image */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="w-full h-[500px] md:h-[700px] overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=800&fit=crop"
          alt="Luxury property"
          className="w-full h-full object-cover"
        />
      </motion.section>

      {/* Contact / Inquiry */}
      <div id="contact" style={{ scrollMarginTop: "80px" }} />
      <section className="py-12 md:py-16 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <h2 className="font-display text-display-lg font-light mt-3 mb-6">
              Talk to
              <br />
              <span className="italic">us</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md">
              Not sure how it works, or want us to help you list your property?
              Send us a message and we'll reply.
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
