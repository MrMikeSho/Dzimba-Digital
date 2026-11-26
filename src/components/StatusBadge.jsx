import { STATUS_LABELS } from "@/lib/config";

const tones = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-900",
  rejected: "bg-red-100 text-red-900",
  rented: "bg-slate-200 text-slate-800",
  new: "bg-sky-100 text-sky-900",
  accepted: "bg-amber-100 text-amber-900",
  paid: "bg-emerald-100 text-emerald-900",
  linked: "bg-emerald-200 text-emerald-950",
  declined: "bg-red-100 text-red-900",
  closed: "bg-slate-200 text-slate-800",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full ${
        tones[status] || "bg-muted text-foreground"
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
