import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/api/client";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Wallet,
  Building2,
  Check,
  Sun,
} from "lucide-react";
import RequestPanel from "@/components/RequestPanel";
import { formatRent } from "@/lib/config";

const sunLabels = ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [sunIndex, setSunIndex] = useState(2);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiClient.entities.Property.get(id);
        setProperty(data);
      } catch {
        setProperty(null);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-[6vw]">
        <h1 className="font-heading text-4xl mb-4">Listing not found</h1>
        <p className="text-muted-foreground mb-8">
          This property does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/properties")}
          className="px-6 py-3 border border-foreground hover:bg-foreground hover:text-background transition-all"
        >
          Back to listings
        </button>
      </div>
    );
  }

  const gallery =
    property.gallery_urls && property.gallery_urls.length
      ? property.gallery_urls
      : [property.image_url].filter(Boolean);

  const sunOverlays = [
    "rgba(255, 160, 80, 0.35)",
    "rgba(255, 220, 150, 0.15)",
    "rgba(255, 255, 240, 0.0)",
    "rgba(255, 210, 140, 0.18)",
    "rgba(255, 150, 70, 0.38)",
    "rgba(60, 50, 90, 0.45)",
  ];

  const features = property.features || [];

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="px-[6vw] py-6 border-b border-border">
        <button
          onClick={() => navigate("/properties")}
          className="group inline-flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to listings
        </button>
      </div>

      <div className="px-[6vw] py-12 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <div className="flex items-center gap-3 mb-5">
            {property.type && (
              <span className="text-xs uppercase tracking-[0.2em] px-3 py-1.5 border border-border text-muted-foreground">
                {property.type}
              </span>
            )}
            {property.atmosphere && (
              <span className="text-xs uppercase tracking-[0.2em] px-3 py-1.5 bg-accent text-accent-foreground">
                {property.atmosphere}
              </span>
            )}
            {property.status === "reserved" && (
              <span className="text-xs uppercase tracking-[0.2em] px-3 py-1.5 bg-amber-200 text-amber-950">
                Pending
              </span>
            )}
            {property.status === "approved" && (
              <span className="text-xs uppercase tracking-[0.2em] px-3 py-1.5 bg-primary text-primary-foreground">
                Available
              </span>
            )}
          </div>
          <h1
            className="font-heading text-balance leading-[1.02]"
            style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}
          >
            {property.title}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-4">
            <MapPin size={16} />
            {[property.suburb, property.town].filter(Boolean).join(", ")}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 lg:text-right flex lg:justify-end items-end">
          <div>
            <div className="font-heading text-4xl lg:text-5xl">
              {formatRent(property.rent_monthly)}
              <span className="text-base font-body text-muted-foreground ml-1">
                / month
              </span>
            </div>
            {property.deposit != null && (
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                Deposit {formatRent(property.deposit)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-[6vw]">
        {gallery.length > 0 && (
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <img
              src={gallery[activeImage]}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-700"
            />
            <div
              className="absolute inset-0 pointer-events-none mix-blend-multiply transition-all duration-500"
              style={{ backgroundColor: sunOverlays[sunIndex] }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/20 p-4 md:p-6">
              <div className="flex items-center gap-4 max-w-3xl mx-auto">
                <Sun size={18} className="text-white shrink-0" />
                <span className="text-xs uppercase tracking-[0.2em] text-white/70 hidden md:inline shrink-0">
                  Sun position
                </span>
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={sunIndex}
                  onChange={(e) => setSunIndex(parseInt(e.target.value, 10))}
                  className="flex-1 accent-accent"
                />
                <span className="text-sm text-white font-mono w-12 text-right">
                  {sunLabels[sunIndex]}
                </span>
              </div>
            </div>
          </div>
        )}

        {gallery.length > 1 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
            {gallery.map((url, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative aspect-[4/3] overflow-hidden transition-all duration-200 ${
                  activeImage === i
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={url}
                  alt={`Image ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-[6vw] py-16 md:py-24 grid grid-cols-12 gap-6 lg:gap-12">
        <div className="col-span-12 lg:col-span-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-foreground" />
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-medium">
              Description
            </span>
          </div>
          <div className="font-body text-lg leading-relaxed text-foreground/85 space-y-6 max-w-2xl">
            <p>
              {property.description ||
                "A detailed property description will be added shortly."}
            </p>
          </div>

          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-foreground" />
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-medium">
                Property details
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
              {[
                { icon: Building2, label: "Property type", value: property.type || "—" },
                { icon: BedDouble, label: "Bedrooms", value: property.bedrooms ?? "—" },
                { icon: Bath, label: "Bathrooms", value: property.bathrooms ?? "—" },
                { icon: Wallet, label: "Rent per month", value: formatRent(property.rent_monthly) },
                { icon: Wallet, label: "Deposit", value: property.deposit != null ? formatRent(property.deposit) : "—" },
                {
                  icon: MapPin,
                  label: "Location",
                  value: [property.suburb, property.town].filter(Boolean).join(", ") || "—",
                },
              ].map((row) => (
                <div key={row.label} className="bg-background p-6">
                  <row.icon
                    size={18}
                    strokeWidth={1.5}
                    className="text-muted-foreground mb-3"
                  />
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    {row.label}
                  </div>
                  <div className="font-heading text-xl">{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          {features.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-foreground" />
                <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-medium">
                  Features
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-3 border-b border-border pb-3"
                  >
                    <div className="w-5 h-5 border border-foreground flex items-center justify-center shrink-0">
                      <Check size={12} />
                    </div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <div className="border border-border p-8">
              <RequestPanel listing={property} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
