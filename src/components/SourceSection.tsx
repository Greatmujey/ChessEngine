import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Download, Cpu, Workflow, Binary } from "lucide-react";
import {
  MAIN_PY,
  MAIN_PY_UNPACKED,
  TINY_PY,
  PY_BYTES,
  UNPACKED_BYTES,
  UNPACKED_LINES,
  TINY_BYTES,
} from "../lib/pythonSource";

const RE =
  /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(#.*$)|(\b(?:def|return|yield|for|in|if|elif|else|while|import|as|global|not|and|or|lambda|is|None|True|False|break|continue)\b)|(\b(?:enumerate|sum|sorted|dict|range|int|str|bool|print|any|all|len|ord|chr|divmod|list|set|min|max|abs|pow|exec)\b)|(\b\d+\b)/g;

function Highlighted({ line }: { line: string }) {
  const out: React.ReactNode[] = [];
  let last = 0, m: RegExpExecArray | null, k = 0;
  RE.lastIndex = 0;
  while ((m = RE.exec(line))) {
    if (m.index > last) out.push(<span key={k++}>{line.slice(last, m.index)}</span>);
    const [tok, str, cmt, kw, bi, num] = m;
    if (str) out.push(<span key={k++} className="text-amber/90">{str}</span>);
    else if (cmt)
      out.push(
        <span key={k++} className={cmt.startsWith("#@[") ? "text-mint italic" : "text-faint italic"}>{cmt}</span>
      );
    else if (kw) out.push(<span key={k++} className="text-ivory font-semibold">{kw}</span>);
    else if (bi) out.push(<span key={k++} className="text-mint/80">{bi}</span>);
    else if (num) out.push(<span key={k++} className="text-[#e2c08d]">{num}</span>);
    void tok;
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(<span key={k++} className="text-[#b8b09c]">{line.slice(last)}</span>);
  return <>{out}</>;
}

const TABS = [
  {
    id: "unpacked",
    label: "main.py · unpacked",
    sub: `${UNPACKED_BYTES.toLocaleString()} B · ${UNPACKED_LINES}L`,
    code: MAIN_PY_UNPACKED,
    dlHref: "/main.py",
    dlName: "main.py",
    wrap: false,
  },
  {
    id: "packed",
    label: "main.py · 4,081 B",
    sub: "lzma + base92",
    code: MAIN_PY,
    dlHref: "/main.py",
    dlName: "main.py",
    wrap: true,
  },
  {
    id: "tiny",
    label: "tiny-fish.py",
    sub: `${TINY_BYTES.toLocaleString()} B ref`,
    code: TINY_PY,
    dlHref: "/tiny-fish.py",
    dlName: "tiny-fish.py",
    wrap: false,
  },
] as const;

const notes = [
  {
    icon: Cpu,
    t: "464-bit SWAR single-int state",
    d: "Middlegame & endgame tapered PeSTO scores, phase, piece counts, pawn bitboards, king squares, and 64-bit Zobrist hash update in one p += delta integer op.",
  },
  {
    icon: Workflow,
    t: "PVS + 64K TT + NMP + LMR + SEE",
    d: "Iterative deepening Principal Variation Search with Zobrist transposition table, Reverse Futility, Null-Move Pruning, Late Move Reductions, and SEE quiescence.",
  },
  {
    icon: Binary,
    t: "printable Base-92 + LZMA (1.54×)",
    d: "Packs 6,283 bytes of pure Python stdlib chess + MAKEFUN_ENV_URL loop into 4,081 ASCII-safe bytes with 15 bytes to spare under the 4,096 B rule.",
  },
];

export default function SourceSection() {
  const [tabId, setTabId] = useState<(typeof TABS)[number]["id"]>("unpacked");
  const [copied, setCopied] = useState(false);

  const active = TABS.find((t) => t.id === tabId) ?? TABS[0];
  const lines = useMemo(() => active.code.replace(/\n$/, "").split("\n"), [active]);
  const pct = (PY_BYTES / 4096) * 100;
  const R = 44, C = 2 * Math.PI * R;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(active.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <section id="source" className="relative py-24 md:py-32 border-t border-line bg-panel/30">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-28"
          >
            <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-mint mb-4">
              02 — the submission
            </div>
            <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight leading-[0.95]">
              Every byte,
              <br />
              <span className="font-serif italic font-normal text-dim">on the record.</span>
            </h2>
            <p className="mt-6 text-dim text-sm md:text-base leading-relaxed max-w-md">
              Inspect both the unpacked 142-line SWAR + PVS engine and the exact
              4,081-byte <span className="font-mono text-ivory">main.py</span>{" "}
              payload running live on <span className="font-mono text-mint">/api/engine</span>{" "}
              — plus the uncompressed <span className="font-mono text-ivory">tiny-fish.py</span>{" "}
              reference engine.
            </p>

            {/* gauge */}
            <div className="mt-10 flex items-center gap-7">
              <div className="relative w-[110px] h-[110px]">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(237,230,214,0.08)" strokeWidth="7" />
                  <motion.circle
                    cx="50" cy="50" r={R} fill="none" stroke="#34d399" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={C}
                    initial={{ strokeDashoffset: C }}
                    whileInView={{ strokeDashoffset: C * (1 - pct / 100) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    style={{ filter: "drop-shadow(0 0 6px rgba(52,211,153,.5))" }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div className="font-mono font-bold text-lg leading-none">{pct.toFixed(1)}<span className="text-xs">%</span></div>
                    <div className="font-mono text-[8px] text-faint uppercase tracking-widest mt-1">of budget</div>
                  </div>
                </div>
              </div>
              <div className="font-mono text-xs leading-relaxed">
                <div><span className="text-ivory">{PY_BYTES.toLocaleString()}</span> <span className="text-faint">/ 4,096 bytes (main.py)</span></div>
                <div><span className="text-ivory">{UNPACKED_BYTES.toLocaleString()} B</span> <span className="text-faint">unpacked · {UNPACKED_LINES} lines</span></div>
                <div className="mt-2 inline-flex items-center gap-1.5 border border-amber/40 text-amber rounded-full px-2.5 py-1 text-[10px] tracking-wider uppercase">
                  {4096 - PY_BYTES} bytes to spare
                </div>
              </div>
            </div>
          </motion.div>

          {/* terminal */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-line bg-[#0d0c0a] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-line bg-panel/60">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1.5 mr-1">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTabId(t.id)}
                    className={`font-mono text-[10.5px] rounded-lg px-2.5 py-1 border transition-colors ${
                      tabId === t.id
                        ? "border-mint/60 bg-mint/10 text-mint"
                        : "border-line text-dim hover:text-ivory"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="hidden sm:inline font-mono text-[9px] text-faint mr-1">{active.sub}</span>
                <button
                  onClick={copy}
                  className="p-2 rounded-lg text-dim hover:text-mint hover:bg-mint/10 transition-colors"
                  title="Copy source"
                >
                  {copied ? <Check size={15} className="text-mint" /> : <Copy size={15} />}
                </button>
                <a
                  href={active.dlHref}
                  download={active.dlName}
                  className="p-2 rounded-lg text-dim hover:text-mint hover:bg-mint/10 transition-colors"
                  title={`Download ${active.dlName}`}
                >
                  <Download size={15} />
                </a>
              </div>
            </div>
            <div className="slim-scroll overflow-auto max-h-[560px] py-4">
              <pre className="font-mono text-[11.5px] leading-[1.7]">
                {lines.map((l, i) => (
                  <div key={i} className="flex hover:bg-ivory/[0.03] px-4">
                    <span className="w-8 shrink-0 text-right text-faint/70 select-none pr-4">{i + 1}</span>
                    <code className={`${active.wrap ? "whitespace-pre-wrap break-all" : "whitespace-pre"} text-[#cfc8b4]`}>
                      {l === "" ? " " : <Highlighted line={l} />}
                    </code>
                  </div>
                ))}
              </pre>
            </div>
          </motion.div>
        </div>

        {/* notes */}
        <div className="grid sm:grid-cols-3 gap-4 mt-14">
          {notes.map(({ icon: Icon, t, d }, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-line bg-panel p-6 hover:border-mint/30 hover:-translate-y-1 transition-all duration-300"
            >
              <Icon size={18} className="text-mint mb-4" />
              <div className="font-semibold mb-2">{t}</div>
              <p className="text-dim text-sm leading-relaxed">{d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
