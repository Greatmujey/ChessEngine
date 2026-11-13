import { Terminal, ArrowUpRight } from "lucide-react";
import { PY_BYTES } from "../lib/pythonSource";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-md bg-mint text-void grid place-items-center">
              <Terminal size={16} strokeWidth={2.5} />
            </span>
            <div>
              <div className="font-mono font-bold text-sm">
                tiny<span className="text-mint">//</span>fish
              </div>
              <div className="font-mono text-[10px] text-faint">
                built with {PY_BYTES.toLocaleString()} of the 4,096 permitted bytes · 1464 practice elo
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-7 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
            {["Play", "Source", "Budget", "Bounty"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-mint transition-colors">
                {l}
              </a>
            ))}
            <a href="/main.py" download="main.py" className="hover:text-mint transition-colors inline-flex items-center gap-1">
              main.py <ArrowUpRight size={11} />
            </a>
            <a
              href="https://github.com/Greatmujey/ChessEngine"
              target="_blank"
              rel="noreferrer"
              className="hover:text-mint transition-colors inline-flex items-center gap-1"
            >
              github <ArrowUpRight size={11} />
            </a>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row justify-between gap-3 font-mono text-[10px] text-faint">
          <span>entry for make.fun/bounty/tiny-chess-01 · by @greatmujey</span>
          <span className="font-serif italic text-xs normal-case tracking-normal text-dim">
            good things come in small binaries.
          </span>
        </div>
      </div>
    </footer>
  );
}
