import { ChevronDown } from "lucide-react";
import { PRICE_RANGES, PROPERTY_TYPES, SMALL_UNIT_OPTIONS, SUBURBS } from "@/lib/config";

export const priceRanges = PRICE_RANGES;

export const propertyTypes = ["All Types", ...PROPERTY_TYPES];

export const bedOptions = ["Any Beds", "1+", "2+", "3+", "4+", "5+"];

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent border-b border-border py-3 pr-8 font-display text-lg italic focus:outline-none focus:border-accent"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="font-body not-italic text-sm">
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </label>
  );
}

export default function PropertyFilters({ filters, onChange, total, extraLocations = [] }) {
  const locations = ["All Locations", ...SUBURBS, ...extraLocations.filter((l) => !SUBURBS.includes(l))];
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="border-y border-border/60 py-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4 items-end">
        <FilterSelect
          label="Property type"
          value={filters.type}
          options={propertyTypes}
          onChange={(v) => set("type", v)}
        />
        <FilterSelect
          label="Location"
          value={filters.location}
          options={locations}
          onChange={(v) => set("location", v)}
        />
        <FilterSelect
          label="Price"
          value={filters.price}
          options={priceRanges.map((r) => r.label)}
          onChange={(v) => set("price", v)}
        />
        <FilterSelect
          label="Bedrooms"
          value={filters.beds}
          options={bedOptions}
          onChange={(v) => set("beds", v)}
        />
        <p className="col-span-2 md:col-span-1 font-body text-xs tracking-label uppercase text-muted-foreground md:text-right pb-3">
          {total} {total === 1 ? "property" : "properties"}
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {SMALL_UNIT_OPTIONS.map((opt) => {
          const on = (filters.included || []).includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() =>
                set("included", on ? filters.included.filter((x) => x !== opt) : [...(filters.included || []), opt])
              }
              className={`px-3 py-2 text-xs border transition-colors ${
                on ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <input
        type="search"
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        placeholder="Search by title, area or address"
        className="mt-6 w-full bg-transparent border-b border-border py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent"
      />
    </div>
  );
}
