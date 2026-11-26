import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { formatRent } from "@/lib/config";
import {
  addCashflowViewer,
  addTransaction,
  deleteTransaction,
  getCashflowViewers,
  getTransactions,
  removeCashflowViewer,
} from "@/api/rentals";

const EXPENSE_CATEGORIES = ["Airtime/data", "Transport", "Advertising", "Fees & charges", "Other"];
const METHODS = ["EcoCash", "Cash", "Bank transfer", "Other"];

function Total({ label, value, tone }) {
  return (
    <div className="border border-border p-4">
      <p className="font-body text-[11px] tracking-label uppercase text-muted-foreground">{label}</p>
      <p className={`font-display text-2xl mt-1 ${tone || ""}`}>{value}</p>
    </div>
  );
}

function sum(rows, kind) {
  return rows.filter((t) => t.kind === kind).reduce((s, t) => s + Number(t.amount || 0), 0);
}

export default function CashFlowPanel({ canEdit }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [viewers, setViewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ kind: "expense", amount: "", category: "", note: "", method: "" });
  const [email, setEmail] = useState("");

  const load = useCallback(async () => {
    try {
      setRows(await getTransactions());
      if (canEdit) setViewers(await getCashflowViewers());
    } catch (e) {
      toast({ title: "Couldn't load cash flow", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [canEdit]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const now = new Date();
    const month = rows.filter((t) => {
      const d = new Date(t.occurred_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    return {
      mIn: sum(month, "income"),
      mOut: sum(month, "expense"),
      aIn: sum(rows, "income"),
      aOut: sum(rows, "expense"),
    };
  }, [rows]);

  async function submit(e) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!(amount > 0)) {
      toast({ title: "Enter an amount", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await addTransaction({ ...form, amount, uid: user.id });
      setForm({ kind: form.kind, amount: "", category: "", note: "", method: "" });
      await load();
    } catch (err) {
      toast({ title: "Couldn't save", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function remove(t) {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await deleteTransaction(t.id);
      await load();
    } catch (err) {
      toast({ title: "Couldn't delete", description: err.message, variant: "destructive" });
    }
  }

  async function share(e) {
    e.preventDefault();
    if (!email.includes("@")) return;
    try {
      await addCashflowViewer(email);
      setEmail("");
      await load();
    } catch (err) {
      toast({ title: "Couldn't share", description: err.message, variant: "destructive" });
    }
  }

  async function unshare(addr) {
    try {
      await removeCashflowViewer(addr);
      await load();
    } catch (err) {
      toast({ title: "Couldn't remove", description: err.message, variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const select = "h-12 border border-input bg-background px-3 text-sm w-full";

  return (
    <div className="space-y-10">
      <div>
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-3">This month</p>
        <div className="grid grid-cols-3 gap-3">
          <Total label="Income" value={formatRent(totals.mIn)} tone="text-green-700" />
          <Total label="Expenses" value={formatRent(totals.mOut)} tone="text-red-700" />
          <Total label="Net" value={formatRent(totals.mIn - totals.mOut)} />
        </div>
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mt-6 mb-3">All time</p>
        <div className="grid grid-cols-3 gap-3">
          <Total label="Income" value={formatRent(totals.aIn)} tone="text-green-700" />
          <Total label="Expenses" value={formatRent(totals.aOut)} tone="text-red-700" />
          <Total label="Net" value={formatRent(totals.aIn - totals.aOut)} />
        </div>
      </div>

      {canEdit && (
        <form onSubmit={submit} className="border border-border p-5 space-y-4">
          <h3 className="font-display text-xl">Log a transaction</h3>
          <p className="font-body text-xs text-muted-foreground">
            Tenant fees are logged automatically when you mark them paid. Use this for anything else.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select className={select} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <Input className="h-12" type="number" min="0" step="0.01" placeholder="Amount (USD)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <Input className="h-12" list="cf-cats" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <datalist id="cf-cats">{EXPENSE_CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
            <select className={select} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              <option value="">Method (optional)</option>
              {METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
            <Input className="h-12 sm:col-span-2" placeholder="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
          </Button>
        </form>
      )}

      <div>
        <h3 className="font-display text-xl mb-4">Log of transactions</h3>
        {rows.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground">Nothing logged yet.</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {rows.map((t) => (
              <li key={t.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-body text-sm">
                    {t.category || (t.kind === "income" ? "Income" : "Expense")}
                    {t.auto && <span className="ml-2 text-[11px] bg-muted px-2 py-0.5 rounded-full">auto</span>}
                  </p>
                  <p className="font-body text-xs text-muted-foreground break-words">
                    {new Date(t.occurred_at).toLocaleDateString()}
                    {t.method ? ` · ${t.method}` : ""}
                    {t.reference ? ` · ${t.reference}` : ""}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-body text-sm ${t.kind === "income" ? "text-green-700" : "text-red-700"}`}>
                    {t.kind === "income" ? "+" : "-"}{formatRent(t.amount)}
                  </span>
                  {canEdit && (
                    <button onClick={() => remove(t)} aria-label="Delete" className="text-muted-foreground hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {canEdit && (
        <div className="border border-border p-5 space-y-4">
          <h3 className="font-display text-xl">Share (read-only)</h3>
          <p className="font-body text-xs text-muted-foreground">
            Anyone you add can log in with that email and see only Cash Flow. They cannot change anything.
          </p>
          <form onSubmit={share} className="flex gap-2">
            <Input className="h-12" type="email" placeholder="name@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit">Share</Button>
          </form>
          <ul className="space-y-2">
            {viewers.map((v) => (
              <li key={v.email} className="flex items-center justify-between font-body text-sm">
                {v.email}
                <button onClick={() => unshare(v.email)} className="text-xs text-primary hover:underline">Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
