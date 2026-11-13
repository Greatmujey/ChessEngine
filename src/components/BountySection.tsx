import { motion } from "framer-motion";
import {
  Trophy, CheckCircle2, CircleDot, FileCode2, Scale, Swords, Info,
} from "lucide-react";
import { PY_BYTES } from "../lib/pythonSource";

const rules = [
  { icon: FileCode2, text: "single python file, ≤ 4,096 bytes — every byte counted" },
  { icon: Scale, text: "full legal chess: castling, en-passant, promotion, mate & stalemate" },
  { icon: Swords, text: "strength ranked by round-robin gauntlet at fixed time control" },
];

const checklist = [
  { done: true, label: "engine written", detail: "tiny-fish.py — negamax, quiescence, packed PSTs" },
  { done: true, label: "size verified", detail: `${PY_BYTES.toLocaleString()} B ≤ 4,096 B budget` },
  { done: true, label: "legality proven", detail: "perft 8902 / 197281 nodes + kiwipete castling" },
  { done: true, label: "mate confirmed", detail: "finds Qxf7# from the scholar's pattern" },
  { done: false, label: "bounty entered", detail: "make.fun/bounty/tiny-chess-01 — awaiting account link" },
];

export default function BountySection() {
  return (
    <section id="bounty" className="relative py-24 md:py-32 border-t border-line bg-panel/30">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-mint mb-4">
            04 — the bounty
          </div>
          <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight leading-[0.95]">
            Built for <span className="font-serif italic font-normal text-mint">tiny-chess-01.</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-stretch">
          {/* listing card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-line bg-void p-7 md:p-9 relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber/8 blur-[90px] pointer-events-none" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-amber/10 border border-amber/30 grid place-items-center">
                  <Trophy size={17} className="text-amber" />
                </span>
                <div>
                  <div className="font-mono text-[10px] text-faint tracking-widest uppercase">make.fun bounty board</div>
                  <div className="font-semibold">tiny-chess-01</div>
                </div>
              </div>
              <span className="font-mono text-[10px] tracking-widest text-mint border border-mint/40 rounded-full px-3 py-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" /> OPEN
              </span>
            </div>

            <h3 className="font-display font-bold text-2xl md:text-[2rem] leading-tight tracking-tight">
              "Build the strongest chess engine
              <span className="font-serif italic font-normal text-dim"> in 4 KB of Python."</span>
            </h3>

            <div className="mt-7 space-y-3.5">
              {rules.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 text-sm text-dim">
                  <Icon size={15} className="text-mint mt-0.5 shrink-0" />
                  <span className="font-mono text-[12.5px] leading-relaxed">{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-faint mb-1">reward pool</div>
                <div className="font-mono font-bold text-3xl text-amber">$4,096<span className="text-faint text-sm font-normal"> · illustrative</span></div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-widest text-faint mb-1">entry filed by</div>
                <div className="font-mono text-sm text-ivory">@greatmujey</div>
              </div>
            </div>
          </motion.div>

          {/* checklist timeline */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-line bg-void p-7 md:p-9 flex flex-col"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint mb-6">
              entry checklist — this page's engine
            </div>
            <div className="space-y-0 flex-1">
              {checklist.map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  {i < checklist.length - 1 && (
                    <span className="absolute left-[13px] top-7 bottom-0 w-px bg-line" />
                  )}
                  {c.done ? (
                    <CheckCircle2 size={27} className="text-mint shrink-0 bg-void relative" />
                  ) : (
                    <CircleDot size={27} className="text-amber shrink-0 bg-void relative" />
                  )}
                  <div>
                    <div className="font-semibold text-sm">{c.label}</div>
                    <div className="font-mono text-[11px] text-dim mt-1 leading-relaxed">{c.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <a
              href="#play"
              className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-mint text-void font-semibold text-sm py-3.5 hover:bg-ivory transition-colors"
            >
              Test the engine first
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-8 flex items-start gap-3 rounded-xl border border-line bg-panel/60 p-4 max-w-3xl mx-auto"
        >
          <Info size={14} className="text-faint shrink-0 mt-0.5" />
          <p className="font-mono text-[10.5px] leading-relaxed text-faint">
            Independent concept entry crafted as a tribute. Not affiliated with or endorsed
            by make.fun; the reward figure and listing details are illustrative. The engine,
            byte count, and test results on this page are entirely real.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
