import { motion } from "framer-motion";
import { ArrowDown, Play, Hash, Trophy, Timer } from "lucide-react";
import { PY_BYTES, UNPACKED_BYTES, UNPACKED_LINES } from "../lib/pythonSource";

const ease = [0.16, 1, 0.3, 1] as const;

const stats = [
  { icon: Hash, k: "size", v: `${PY_BYTES.toLocaleString()} bytes` },
  { icon: Trophy, k: "rating", v: "1464 practice elo" },
  { icon: Timer, k: "search", v: "pvs d8 · 32k nodes" },
];

const marquee = [
  "SWAR 464-BIT STATE", "PRINCIPAL VARIATION SEARCH", "64K ZOBRIST TT",
  "TAPERED PESTO EVAL", "NULL-MOVE + LMR + SEE", "4,081 / 4,096 BYTES",
  "1464 PRACTICE ELO", "ZERO DEPENDENCIES", "MAKEFUN_ENV_URL READY",
];

export default function Hero() {
  return (
    <section id="top" className="relative min-h-screen grid-bg overflow-hidden flex flex-col">
      {/* glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-mint/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-amber/5 blur-[120px] pointer-events-none" />

      <div className="flex-1 max-w-7xl mx-auto w-full px-5 md:px-8 pt-28 md:pt-36 pb-10 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="flex items-center gap-3 font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-dim mb-7"
          >
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            make.fun bounty · tiny-chess-01 · entry @greatmujey
          </motion.div>

          <h1 className="font-display font-bold leading-[0.93] tracking-tight text-[13.5vw] sm:text-7xl lg:text-[5.6rem] xl:text-[6.4rem]">
            {["THE STRONGEST", "CHESS ENGINE"].map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.08 + i * 0.1, ease }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
            <span className="block overflow-hidden">
              <motion.span
                className="block font-serif italic font-normal text-mint"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.28, ease }}
              >
                in four kilobytes.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease }}
            className="mt-7 max-w-xl text-dim text-base md:text-lg leading-relaxed"
          >
            One 4,081-byte Python file. Zero third-party libraries. 464-bit SWAR
            incremental state, Tapered PeSTO + passed-pawn bitboards, Principal
            Variation Search, 64K Zobrist TT, Null-Move &amp; LMR — live below on
            Python serverless.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="#play"
              className="group inline-flex items-center gap-2.5 bg-mint text-void font-semibold rounded-full px-7 py-3.5 text-sm hover:bg-ivory transition-colors"
            >
              <Play size={15} className="fill-current" />
              Play the engine
            </a>
            <a
              href="#source"
              className="inline-flex items-center gap-2.5 border border-line rounded-full px-7 py-3.5 text-sm font-mono text-dim hover:text-ivory hover:border-ivory/40 transition-colors"
            >
              Read the source
              <ArrowDown size={14} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.75 }}
            className="mt-12 flex flex-wrap gap-x-10 gap-y-4"
          >
            {stats.map(({ icon: Icon, k, v }) => (
              <div key={k} className="flex items-center gap-3">
                <Icon size={15} className="text-mint" />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{k}</div>
                  <div className="font-mono text-sm text-ivory">{v}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* knight visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease }}
          className="relative hidden lg:block"
        >
          <div className="relative rounded-2xl overflow-hidden border border-line rotate-2 shadow-[0_40px_120px_-30px_rgba(52,211,153,0.25)]">
            <img
              src="/images/knight.jpg"
              alt="Obsidian chess knight under emerald light"
              className="w-full h-[540px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-void/20" />
            <div className="absolute top-4 right-4 font-mono text-[10px] tracking-widest text-mint/80">
              FIG. 01 — THE CHALLENGER
            </div>
          </div>

          {/* floating terminal */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-16 bottom-10 w-72 rounded-xl border border-line bg-panel/95 backdrop-blur p-4 shadow-2xl -rotate-2"
          >
            <div className="flex gap-1.5 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <pre className="font-mono text-[11px] leading-relaxed text-dim">
              <span className="text-mint">$</span> python3 -P -s main.py<span className="cursor-blink text-mint">▌</span>{"\n"}
              <span className="text-ivory">bestmove g8f6 · d8</span>{"\n"}
              score +0.18 · nodes 32,000
            </pre>
          </motion.div>

          {/* floating byte chip */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute -right-5 top-16 rounded-lg border border-mint/30 bg-void/90 backdrop-blur px-4 py-3 rotate-3"
          >
            <div className="font-mono text-[10px] text-faint uppercase tracking-widest">payload</div>
            <div className="font-mono text-mint font-bold text-lg">{PY_BYTES.toLocaleString()} B</div>
            <div className="font-mono text-[10px] text-dim">{UNPACKED_BYTES.toLocaleString()} B · {UNPACKED_LINES}L unpacked</div>
          </motion.div>
        </motion.div>
      </div>

      {/* marquee */}
      <div className="relative border-y border-line py-3.5 overflow-hidden bg-panel/40">
        <div className="marquee-track flex whitespace-nowrap w-max">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex items-center" aria-hidden={rep === 1}>
              {marquee.map((t) => (
                <span key={`${rep}-${t}`} className="font-mono text-[11px] tracking-[0.25em] text-dim flex items-center">
                  <span className="mx-6">{t}</span>
                  <span className="text-mint">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
