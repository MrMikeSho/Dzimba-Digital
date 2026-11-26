import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Home as HomeIcon, KeyRound, Menu, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationsBell from "@/components/NotificationsBell";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/lib/AuthContext";
import { SITE } from "@/lib/config";

const navItems = [
  { to: "/properties", label: "Listings" },
  { to: "/sell", label: "For Landlords" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Insights" },
];

function Header() {
  const { pathname } = useLocation();
  const { isAuthenticated, isBroker } = useAuth();
  const accountLink = isAuthenticated
    ? { to: isBroker ? "/broker" : "/account", label: isBroker ? "Broker" : "Account" }
    : { to: "/login", label: "Log in" };
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearching(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
        overHero
          ? "bg-transparent text-white"
          : "bg-background/95 backdrop-blur border-b border-border/60 text-foreground"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-[4%] md:px-[2%] h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl md:text-3xl font-light tracking-wide">
          {SITE.name}
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `font-body text-xs tracking-label uppercase transition-opacity ${
                  isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to={accountLink.to}
            className={`font-body text-xs tracking-label uppercase border px-5 py-2 transition-colors ${
              overHero
                ? "border-white/70 hover:bg-white hover:text-black"
                : "border-foreground hover:bg-foreground hover:text-background"
            }`}
          >
            {accountLink.label}
          </Link>
        </nav>

        <div className="flex items-center">
          <button type="button" aria-label="Search" className="p-2" onClick={() => setSearching((v) => !v)}>
            <Search size={20} />
          </button>
          <NotificationsBell />
          <ThemeToggle />
        <button
          type="button"
          className="md:hidden p-2 -mr-2"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
        </div>
      </div>

      {searching && (
        <form
          className="bg-background text-foreground border-t border-border/60 px-[4%] py-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSearching(false);
            navigate(`/properties?search=${encodeURIComponent(q.trim())}`);
          }}
        >
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by area, title or type"
            className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground"
          />
        </form>
      )}

      {open && (
        <nav className="md:hidden bg-background text-foreground border-t border-border/60 px-[4%] py-6 flex flex-col gap-5">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="font-display text-2xl font-light"
            >
              {item.label}
            </Link>
          ))}
          <Link to={accountLink.to} className="ghost-btn text-center">
            {accountLink.label}
          </Link>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="max-w-[1400px] mx-auto px-[4%] md:px-[2%] py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <p className="font-display text-3xl font-light mb-3">{SITE.name}</p>
          <p className="font-body text-sm text-muted-foreground max-w-xs leading-relaxed">
            {SITE.tagline}. Find a home to rent, or list your property.
          </p>
        </div>
        <div>
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
            Explore
          </p>
          <ul className="space-y-2 font-body text-sm">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="hover:text-accent transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
            Legal
          </p>
          <ul className="space-y-2 font-body text-sm">
            <li>
              <Link to="/terms" className="hover:text-accent transition-colors">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-accent transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/accessibility" className="hover:text-accent transition-colors">
                Accessibility Statement
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center font-body text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}

function BottomBar() {
  const { pathname } = useLocation();
  const tabs = [
    { to: "/list-property", label: "List Your Property", Icon: KeyRound },
    { to: "/properties", label: "Find a Rental", Icon: HomeIcon },
  ];
  return (
    <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 flex gap-1 p-1.5 rounded-full bg-card/95 backdrop-blur border border-border shadow-lg">
      {tabs.map(({ to, label, Icon }) => (
        <Link
          key={to}
          to={to}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm ${
            pathname.startsWith(to) ? "bg-muted text-accent" : "text-muted-foreground"
          }`}
        >
          <Icon size={18} /> {label}
        </Link>
      ))}
    </nav>
  );
}

export default function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomBar />
    </div>
  );
}
