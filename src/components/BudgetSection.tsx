import { motion } from "framer-motion";
import { sections, PY_BYTES, UNPACKED_BYTES } from "../lib/pythonSource";

export default function BudgetSection() {
  const secs = sections();
  const total = secs.reduce((a, s) => a + s.bytes, 0);
  const spare = 4096 - total;

  return (
    <section id="budget" className="relative py-24 md:py-32 border-t border-line overflow-hidden">
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-mint/6 blur-[130px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          {/* left: visual + copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-mint mb-4">
              03 — byte budget
            </div>
            <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight leading-[0.95]">
              Where the
              <br />
              <span className="font-serif italic font-normal text-dim">kilobyte went.</span>
            </h2>
            <p className="mt-6 text-dim text-sm md:text-base leading-relaxed max-w-md">
              Four kilobytes is 4,096 chances to be clever. From{" "}
              <span className="font-mono text-ivory">{UNPACKED_BYTES.toLocaleString()} B</span>{" "}
              of raw SWAR + PVS Python down to{" "}
              <span className="font-mono text-mint/90">{PY_BYTES.toLocaleString()} B</span>{" "}
              via LZMA + printable Base-92, here is the real compressed share of
              every subsystem.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 relative rounded-2xl overflow-hidden border border-line"
            >
              <img src="/images/chip.jpg" alt="Silicon die etched like a chessboard" className="w-full h-64 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                <div>
                  <div className="font-mono font-bold text-4xl text-ivory">{spare}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">bytes unused · safety margin</div>
                </div>
                <div className="font-mono text-[10px] text-mint border border-mint/30 rounded-full px-3 py-1 bg-void/70 backdrop-blur">
                  1.54× lzma · 0 deps
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* right: stacked bar + rows */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:pt-14"
          >
            {/* stacked */}
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-faint mb-3">
              <span>allocation map · main.py</span>
              <span>{total.toLocaleString()} / 4,096 B</span>
            </div>
            <div className="flex h-9 rounded-lg overflow-hidden border border-line mb-10">
              {secs.map((s, i) => (
                <motion.div
                  key={s.id}
                  className="h-full"
                  style={{ background: s.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(s.bytes / 4096) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  title={`${s.label}: ${s.bytes} B`}
                />
              ))}
              <motion.div
                className="h-full bg-repeating-linear"
                style={{
                  background: "repeating-linear-gradient(45deg, rgba(237,230,214,.13) 0 6px, transparent 6px 12px)",
                }}
                initial={{ width: 0 }}
                whileInView={{ width: `${(spare / 4096) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                title={`spare: ${spare} B`}
              />
            </div>

            {/* rows */}
            <div className="space-y-5">
              {secs.map((s, i) => {
                const pct = (s.bytes / 4096) * 100;
                return (
                  <div key={s.id} className="group">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[10px] text-faint">0{i + 1}</span>
                        <span className="font-medium text-sm group-hover:text-mint transition-colors">{s.label}</span>
                      </div>
                      <div className="font-mono text-xs">
                        <span className="text-ivory">{s.bytes.toLocaleString()} B</span>
                        <span className="text-faint"> · {pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-ivory/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: s.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(s.bytes / total) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 flex items-center justify-between font-mono text-[11px] text-faint border-t border-line">
                <span>total competition payload</span>
                <span className="text-mint">{PY_BYTES.toLocaleString()} bytes of 4,096 allowed</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
