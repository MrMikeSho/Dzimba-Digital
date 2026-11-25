import { ChevronDown } from "lucide-react";

export const priceRanges = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under $2M", min: 0, max: 2000000 },
  { label: "$2M – $5M", min: 2000000, max: 5000000 },
  { label: "$5M – $10M", min: 5000000, max: 10000000 },
  { label: "$10M+", min: 10000000, max: Infinity },
];

export const propertyTypes = [
  "All Types",
  "Villa",
  "Penthouse",
  "Waterfront",
  "Modernist",
  "Estate",
  "Townhouse",
  "Condo",
];

export const locations = [
  "All Locations",
  "Zurich",
  "Pacific Heights",
  "Marina District",
  "Nob Hill",
  "Sea Cliff",
  "Russian Hill",
  "Presidio Heights",
];

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

export default function PropertyFilters({ filters, onChange, total }) {
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
