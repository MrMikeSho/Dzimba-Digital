import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function current() {
  try {
    return localStorage.getItem("theme") || "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(t) {
  document.documentElement.classList.toggle("dark", t === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "dark" ? "#050a12" : "#faf8f5");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(current);
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* private mode */
    }
  }, [theme]);
  return (
    <button
      type="button"
      aria-label="Switch light/dark"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
