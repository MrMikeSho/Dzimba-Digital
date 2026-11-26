import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getNotifications } from "@/api/rentals";

export default function NotificationsBell() {
  const { user, isBroker } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return undefined;
    }
    let live = true;
    const run = () =>
      getNotifications({ uid: user.id, isBroker })
        .then((x) => live && setItems(x))
        .catch(() => {});
    run();
    const t = setInterval(run, 60000);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, [user, isBroker]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button type="button" aria-label="Notifications" onClick={() => setOpen((v) => !v)} className="p-2 relative">
        <Bell size={20} />
        {items.length > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-background text-foreground border border-border shadow-lg z-50">
          {items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Nothing new.</p>
          ) : (
            items.map((n, i) => (
              <Link key={i} to={n.to} onClick={() => setOpen(false)} className="block px-4 py-3 text-sm border-b border-border last:border-0 hover:bg-muted">
                {n.text}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
