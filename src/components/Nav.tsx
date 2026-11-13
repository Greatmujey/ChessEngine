import { useEffect, useState } from "react";
import { Terminal, Download } from "lucide-react";
import { PY_BYTES } from "../lib/pythonSource";

const links = [
  ["Play", "#play"],
  ["Source", "#source"],
  ["Budget", "#budget"],
  ["Bounty", "#bounty"],
] as const;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-md bg-void/80 border-b border-line"
          : "border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 group">
          <span className="w-8 h-8 rounded-md bg-mint text-void grid place-items-center group-hover:rotate-6 transition-transform duration-300">
            <Terminal size={16} strokeWidth={2.5} />
          </span>
          <span className="font-mono font-bold tracking-tight text-sm">
            tiny<span className="text-mint">//</span>fish
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-faint border border-line rounded px-1.5 py-0.5 ml-1">
            {PY_BYTES.toLocaleString()} B · 1464 elo
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-7 font-mono text-[11px] tracking-[0.18em] uppercase text-dim">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="hover:text-mint transition-colors">
              {l}
            </a>
          ))}
        </nav>
        <a
          href="/main.py"
          download="main.py"
          className="flex items-center gap-2 font-mono text-[11px] tracking-wider border border-line rounded-full px-4 py-2 hover:border-mint hover:text-mint transition-colors"
        >
          <Download size={13} />
          <span className="hidden sm:inline">main.py</span>
          <span className="sm:hidden">.py</span>
        </a>
      </div>
    </header>
  );
}
