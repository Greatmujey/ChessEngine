import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, Undo2, Flag, Plus, Cpu, Crown, ChevronRight,
} from "lucide-react";
import {
  initialState, legalMoves, makeMove, inCheck, gameStatus, toSAN,
  findBestMove, sqName, GLYPH,
  type GameState, type Move,
} from "../lib/chess";
import { PY_BYTES } from "../lib/pythonSource";

const moveUci = (m: Move) =>
  sqName(m.fr) + sqName(m.to) + (m.promo ? m.promo.toLowerCase() : "");

const VALS: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const EASY = [
  { id: 2, label: "Casual", note: "depth 2 · playful", jitter: 22, server: false },
  { id: 3, label: "Club", note: "depth 3 · honest", jitter: 0, server: false },
  { id: 4, label: "Master", note: "depth 4 · cruel", jitter: 0, server: false },
  { id: 8, label: "4K Live", note: "python · pvs d8", jitter: 0, server: true },
] as const;

const THINK_MSGS = [
  "ordering captures", "extending forcing lines", "pruning the tree",
  "consulting 384 packed bytes", "weighing the exchange", "hunting tactics",
];

function capturedAndMaterial(b: (string | null)[]) {
  const need: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const have: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, P: 0, N: 0, B: 0, R: 0, Q: 0 };
  let mat = 0;
  for (const p of b) {
    if (!p) continue;
    if (p === p.toUpperCase()) { have[p] = (have[p] ?? 0) + 1; mat += VALS[p.toLowerCase()]; }
    else if (p !== "k") { have[p] = (have[p] ?? 0) + 1; mat -= VALS[p]; }
  }
  const whiteTook: string[] = []; // black pieces white captured
  for (const [pc, n] of Object.entries(need)) {
    const dead = n - (have[pc] ?? 0);
    for (let i = 0; i < dead; i++) whiteTook.push(pc);
  }
  return { whiteTook, mat };
}

export default function PlaySection() {
  const [states, setStates] = useState<GameState[]>(() => [initialState()]);
  const [sans, setSans] = useState<string[]>([]);
  const [ucis, setUcis] = useState<string[]>([]);
  const [human, setHuman] = useState<"w" | "b">("w");
  const [orient, setOrient] = useState<"w" | "b">("w");
  const [diff, setDiff] = useState(3);
  const [selected, setSelected] = useState<number | null>(null);
  const [promo, setPromo] = useState<Move | null>(null);
  const [thinking, setThinking] = useState(false);
  const [lastRes, setLastRes] = useState<{ cp: number; nodes: number; ms: number; depth?: number } | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [resigned, setResigned] = useState<"w" | "b" | null>(null);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const scheduledFor = useRef(-1);
  const gameId = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  const cur = states[states.length - 1];
  const status = useMemo(() => gameStatus(cur), [cur]);
  const lastMoveSq = useMemo(
    () => (lastMove ? { from: lastMove.fr, to: lastMove.to } : null),
    [lastMove]
  );

  const legalHere = useMemo(() => legalMoves(cur, cur.turn), [cur]);
  const targets = useMemo(
    () => (selected === null ? [] : legalHere.filter((m) => m.fr === selected)),
    [selected, legalHere]
  );
  const checkedKing = useMemo(
    () => (inCheck(cur.b, cur.turn) ? cur.b.findIndex((p) => p === (cur.turn === "w" ? "K" : "k")) : -1),
    [cur]
  );

  const { whiteTook, mat } = useMemo(() => capturedAndMaterial(cur.b), [cur]);

  // engine turn
  useEffect(() => {
    if (status.over || resigned || cur.turn === human) return;
    const key = states.length * 2 + (cur.turn === "w" ? 0 : 1);
    if (scheduledFor.current === key) return;
    scheduledFor.current = key;
    const gid = gameId.current;
    let cancelled = false;
    setThinking(true);
    setSelected(null);

    const d = EASY[diff];
    if (d.server) {
      (async () => {
        try {
          const resp = await fetch("/api/engine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              moves: ucis,
              nodes: 32000,
              engine_reply: true,
              game_id: `g_${gid}`,
            }),
          });
          if (!resp.ok) throw new Error("server fallback");
          const data = await resp.json();
          if (cancelled || gid !== gameId.current) return;
          const mv = legalHere.find((m) => moveUci(m) === data.engine_move);
          if (mv) {
            const san = toSAN(cur, mv, legalHere);
            setStates((s) => [...s, makeMove(cur, mv)]);
            setSans((s) => [...s, san]);
            setUcis((u) => [...u, moveUci(mv)]);
            setLastRes({
              cp: data.eval_white_cp ?? 0,
              nodes: data.nodes ?? 0,
              ms: data.time_ms ?? 0,
              depth: data.depth,
            });
            setLastMove(mv);
            setThinking(false);
            return;
          }
        } catch {
          // graceful client-side fallback if /api/engine unavailable
        }
        if (cancelled || gid !== gameId.current) return;
        const res = findBestMove(cur, 4, 0);
        if (!res) { setThinking(false); return; }
        const san = toSAN(cur, res.move, legalHere);
        setStates((s) => [...s, makeMove(cur, res.move)]);
        setSans((s) => [...s, san]);
        setUcis((u) => [...u, moveUci(res.move)]);
        setLastRes({ cp: res.cp, nodes: res.nodes, ms: res.ms, depth: 4 });
        setLastMove(res.move);
        setThinking(false);
      })();
      return () => {
        cancelled = true;
        if (scheduledFor.current === key) scheduledFor.current = -1;
      };
    }

    const t = setTimeout(() => {
      if (cancelled || gid !== gameId.current) return;
      const res = findBestMove(cur, d.id, d.jitter);
      if (!res) { setThinking(false); return; }
      const san = toSAN(cur, res.move, legalHere);
      setStates((s) => [...s, makeMove(cur, res.move)]);
      setSans((s) => [...s, san]);
      setUcis((u) => [...u, moveUci(res.move)]);
      setLastRes({ cp: res.cp, nodes: res.nodes, ms: res.ms, depth: d.id });
      setLastMove(res.move);
      setThinking(false);
    }, 320);
    return () => {
      cancelled = true;
      clearTimeout(t);
      if (scheduledFor.current === key) scheduledFor.current = -1;
    };
  }, [states, cur, human, status.over, resigned, diff, legalHere, ucis]);

  // thinking message rotation
  useEffect(() => {
    if (!thinking) return;
    const i = setInterval(() => setMsgIdx((m) => (m + 1) % THINK_MSGS.length), 700);
    return () => clearInterval(i);
  }, [thinking]);

  // autoscroll move list
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [sans.length]);

  const commit = useCallback(
    (m: Move) => {
      const san = toSAN(cur, m, legalHere);
      setStates((s) => [...s, makeMove(cur, m)]);
      setSans((s) => [...s, san]);
      setUcis((u) => [...u, moveUci(m)]);
      setSelected(null);
      setPromo(null);
      setLastMove(m);
    },
    [cur, legalHere]
  );

  const clickSquare = (sq: number) => {
    if (thinking || status.over || resigned || cur.turn !== human || promo) return;
    if (selected !== null) {
      const opts = targets.filter((m) => m.to === sq);
      if (opts.length) {
        const pr = opts.find((m) => m.promo);
        if (pr) setPromo(pr);
        else commit(opts[0]);
        return;
      }
    }
    const p = cur.b[sq];
    if (p && (p === p.toUpperCase()) === (human === "w")) setSelected(sq === selected ? null : sq);
    else setSelected(null);
  };

  const newGame = (as: "w" | "b") => {
    gameId.current += 1;
    setThinking(false);
    setStates([initialState()]);
    setSans([]);
    setUcis([]);
    setHuman(as);
    setOrient(as);
    setSelected(null);
    setPromo(null);
    setResigned(null);
    setLastRes(null);
    setLastMove(null);
    scheduledFor.current = -1;
  };
  const undo = () => {
    if (thinking || states.length === 1) return;
    const drop = cur.turn === human ? (states.length > 2 ? 2 : 1) : 1;
    setStates((s) => s.slice(0, Math.max(1, s.length - drop)));
    setSans((s) => s.slice(0, Math.max(0, s.length - drop)));
    setUcis((u) => u.slice(0, Math.max(0, u.length - drop)));
    setSelected(null);
    setResigned(null);
    setLastMove(null);
  };

  const cpText = lastRes
    ? Math.abs(lastRes.cp) > 28000
      ? `mate in ${Math.max(1, Math.round(((Math.abs(lastRes.cp) > 90000 ? 100000 : 30000) - Math.abs(lastRes.cp)) / 2))}`
      : `${lastRes.cp >= 0 ? "+" : "−"}${(Math.abs(lastRes.cp) / 100).toFixed(2)}`
    : "even";
  const whitePct = lastRes ? 100 / (1 + Math.pow(10, -lastRes.cp / 400)) : 50;

  const pairs: [string, string?][] = [];
  for (let i = 0; i < sans.length; i += 2) pairs.push([sans[i], sans[i + 1]]);

  const resultBanner = status.over
    ? { title: status.result!, sub: status.reason! }
    : resigned
    ? { title: resigned === "w" ? "0-1" : "1-0", sub: "resignation" }
    : null;

  return (
    <section id="play" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16 flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-mint mb-4">
              01 — proof of strength
            </div>
            <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight leading-[0.95]">
              Sit down.<br />
              <span className="font-serif italic font-normal text-dim">Play 4,088 bytes.</span>
            </h2>
          </div>
          <p className="max-w-sm text-dim text-sm leading-relaxed">
            This board runs a line-for-line JavaScript port of the submission's
            brain. If it beats you here, imagine what the Python does with a
            real clock.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[auto_auto_1fr] gap-8 lg:gap-10 items-start justify-center lg:justify-start">
          {/* eval bar */}
          <div className="hidden lg:flex flex-col items-center gap-3 self-stretch">
            <span className="font-mono text-[10px] text-faint">tiny</span>
            <div className="relative w-3.5 flex-1 rounded-full overflow-hidden border border-line bg-ivory/90">
              <motion.div
                className="absolute bottom-0 inset-x-0 bg-void"
                animate={{ height: `${100 - whitePct}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 16 }}
              />
              <div className="absolute inset-x-0 top-1/2 h-px bg-mint/70" />
            </div>
            <span className="font-mono text-[10px] text-faint">you</span>
            <span className="font-mono text-[11px] text-mint">{cpText}</span>
          </div>

          {/* board */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative w-full max-w-[560px] aspect-square rounded-xl overflow-hidden border border-line shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)] select-none">
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
                {Array.from({ length: 64 }, (_, i) => {
                  const dr = orient === "w" ? Math.floor(i / 8) : 7 - Math.floor(i / 8);
                  const dc = orient === "w" ? i % 8 : 7 - (i % 8);
                  const sq = dr * 8 + dc;
                  const light = (dr + dc) % 2 === 0;
                  const p = cur.b[sq];
                  const isSel = selected === sq;
                  const isTarget = targets.some((m) => m.to === sq && !cur.b[sq] && !m.ep);
                  const isCap = targets.some((m) => m.to === sq && (cur.b[sq] || m.ep));
                  const isLast = lastMoveSq && (lastMoveSq.from === sq || lastMoveSq.to === sq);
                  const isChk = checkedKing === sq;
                  const mine = p && (p === p.toUpperCase()) === (human === "w") && cur.turn === human && !status.over;
                  return (
                    <div
                      key={i}
                      onClick={() => clickSquare(sq)}
                      className={`sq relative grid place-items-center ${light ? "bg-[#E9E0C9]" : "bg-[#214f3a]"} ${
                        mine ? "cursor-pointer" : ""
                      } ${isTarget ? "sq-target" : ""} ${isCap ? "sq-capture" : ""}`}
                      style={{
                        boxShadow: isSel
                          ? "inset 0 0 0 3px #f59e0b, inset 0 0 24px rgba(245,158,11,.35)"
                          : isChk
                          ? "inset 0 0 0 3px rgba(239,68,68,.9), inset 0 0 24px rgba(239,68,68,.4)"
                          : undefined,
                      }}
                    >
                      {isLast && <span className="absolute inset-0 bg-amber/25" />}
                      {p && (
                        <span
                          className={`piece-glyph ${mine ? "playable" : ""} text-[30px] sm:text-[38px] md:text-[44px]`}
                          style={{
                            color: p === p.toUpperCase() ? "#F7F0DC" : "#17120c",
                            textShadow:
                              p === p.toUpperCase()
                                ? "0 0 1px #17120c, 0 2px 3px rgba(0,0,0,.45)"
                                : "0 0 1px #F7F0DC, 0 2px 3px rgba(0,0,0,.4)",
                          }}
                        >
                          {GLYPH[p]}
                        </span>
                      )}
                      {/* coordinates */}
                      {((orient === "w" && dc === 0) || (orient === "b" && dc === 7)) && (
                        <span className={`absolute top-0.5 left-1 font-mono text-[9px] ${light ? "text-[#214f3a]" : "text-[#E9E0C9]"} opacity-80`}>
                          {8 - dr}
                        </span>
                      )}
                      {((orient === "w" && dr === 7) || (orient === "b" && dr === 0)) && (
                        <span className={`absolute bottom-0.5 right-1 font-mono text-[9px] ${light ? "text-[#214f3a]" : "text-[#E9E0C9]"} opacity-80`}>
                          {"abcdefgh"[dc]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* thinking veil */}
              <AnimatePresence>
                {thinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-3 left-1/2 -translate-x-1/2 z-10"
                  >
                    <div className="flex items-center gap-2.5 bg-void/90 border border-mint/30 rounded-full px-4 py-2 backdrop-blur">
                      <Cpu size={13} className="text-mint animate-pulse" />
                      <span className="font-mono text-[11px] text-mint">{THINK_MSGS[msgIdx]}</span>
                      <span className="flex gap-0.5">
                        <span className="think-dot w-1 h-1 rounded-full bg-mint inline-block" />
                        <span className="think-dot w-1 h-1 rounded-full bg-mint inline-block" />
                        <span className="think-dot w-1 h-1 rounded-full bg-mint inline-block" />
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* promotion picker */}
              <AnimatePresence>
                {promo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 z-20 grid place-items-center bg-void/60 backdrop-blur-sm"
                  >
                    <div className="bg-panel border border-line rounded-2xl p-5 shadow-2xl">
                      <div className="font-mono text-[10px] tracking-widest uppercase text-dim mb-3 text-center">
                        promote to
                      </div>
                      <div className="flex gap-2">
                        {["Q", "R", "B", "N"].map((q) => (
                          <button
                            key={q}
                            onClick={() => commit({ ...promo, promo: q })}
                            className="w-14 h-14 rounded-xl bg-ivory text-void grid place-items-center text-3xl hover:bg-mint hover:-translate-y-1 transition-all"
                          >
                            {GLYPH[human === "w" ? q : q.toLowerCase()]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* result overlay */}
              <AnimatePresence>
                {resultBanner && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 grid place-items-center bg-void/70 backdrop-blur-[3px]"
                  >
                    <motion.div
                      initial={{ scale: 0.85, y: 16 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 18 }}
                      className="text-center"
                    >
                      <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-mint mb-2">
                        {resultBanner.sub}
                      </div>
                      <div className="font-display font-bold text-6xl">{resultBanner.title}</div>
                      <div className="font-serif italic text-dim text-xl mt-1">
                        {resultBanner.title === (human === "w" ? "1-0" : "0-1")
                          ? "you beat four kilobytes. respect."
                          : "the bytes remain undefeated."}
                      </div>
                      <button
                        onClick={() => newGame(human)}
                        className="mt-6 bg-mint text-void font-semibold text-sm rounded-full px-6 py-2.5 hover:bg-ivory transition-colors"
                      >
                        Run it back
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* under-board bar */}
            <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-faint">
              <span>
                {human === "w" ? "you are white" : "you are black"} · engine depth {EASY[diff].server && lastRes?.depth ? lastRes.depth : EASY[diff].id}
              </span>
              <span className="text-mint/80">{status.over ? status.result! : inCheck(cur.b, cur.turn) ? "check" : `${cur.full}. to move: ${cur.turn === "w" ? "white" : "black"}`}</span>
            </div>
          </motion.div>

          {/* side panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[560px] lg:max-w-none bg-panel border border-line rounded-2xl p-5 md:p-6 flex flex-col gap-5"
          >
            {/* header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-mint/10 border border-mint/25 grid place-items-center">
                  <Crown size={16} className="text-mint" />
                </span>
                <div>
                  <div className="font-semibold text-sm">You vs. tiny//fish</div>
                  <div className="font-mono text-[10px] text-faint">
                    {PY_BYTES.toLocaleString()} B of pure python
                  </div>
                </div>
              </div>
              <span
                className={`font-mono text-[10px] tracking-widest uppercase rounded-full border px-3 py-1 ${
                  thinking
                    ? "text-mint border-mint/40"
                    : status.over || resigned
                    ? "text-amber border-amber/40"
                    : "text-dim border-line"
                }`}
              >
                {thinking ? "thinking" : status.over || resigned ? "finished" : cur.turn === human ? "your move" : "…"}
              </span>
            </div>

            {/* difficulty */}
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint mb-2">strength</div>
              <div className="grid grid-cols-4 gap-1.5 bg-void border border-line rounded-xl p-1.5">
                {EASY.map((d, i) => (
                  <button
                    key={d.id}
                    onClick={() => setDiff(i)}
                    className={`rounded-lg py-2 px-1 text-center transition-all ${
                      diff === i ? "bg-mint text-void" : "text-dim hover:text-ivory"
                    }`}
                  >
                    <div className="font-semibold text-xs">{d.label}</div>
                    <div className={`font-mono text-[9px] ${diff === i ? "text-void/70" : "text-faint"}`}>{d.note}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* captured */}
            <div className="flex items-center justify-between font-mono text-sm min-h-[22px]">
              <span className="text-dim tracking-tight truncate">
                {whiteTook.map((p) => GLYPH[p]).join(" ") || <span className="text-faint text-[11px]">no captures yet</span>}
              </span>
              <span className="text-mint text-xs">{mat > 0 ? `+${mat}` : ""}</span>
            </div>

            {/* moves */}
            <div className="flex-1 min-h-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint mb-2">notation</div>
              <div ref={listRef} className="slim-scroll h-44 overflow-y-auto rounded-xl border border-line bg-void/60 p-2">
                {pairs.length === 0 ? (
                  <div className="h-full grid place-items-center font-mono text-[11px] text-faint">
                    {human === "w" ? "your move opens the game" : "engine opens — watch closely"}
                  </div>
                ) : (
                  <div className="grid grid-cols-[36px_1fr_1fr]">
                    {pairs.map(([w, b], i) => (
                      <div key={i} className="contents group">
                        <span className="font-mono text-[10px] text-faint py-1 pl-1">{i + 1}.</span>
                        <span className="font-mono text-xs text-ivory py-1 px-1 rounded group-odd:bg-transparent hover:bg-mint/10">{w}</span>
                        <span className="font-mono text-xs text-dim py-1 px-1 hover:bg-mint/10 rounded">{b ?? ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* engine readout */}
            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              {[
                ["eval", cpText],
                ["nodes", lastRes ? lastRes.nodes.toLocaleString() : "—"],
                ["time", lastRes ? `${Math.round(lastRes.ms)}ms` : "—"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line bg-void/60 py-2">
                  <div className="text-[9px] uppercase tracking-widest text-faint">{k}</div>
                  <div className="text-xs text-mint">{v}</div>
                </div>
              ))}
            </div>

            {/* controls */}
            <div className="flex flex-wrap gap-2">
              <div className="flex rounded-lg overflow-hidden border border-line">
                <button
                  onClick={() => newGame("w")}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-mint text-void hover:bg-ivory transition-colors"
                >
                  <Plus size={13} /> New as White
                </button>
                <button
                  onClick={() => newGame("b")}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-panel2 text-dim hover:text-ivory border-l border-line transition-colors"
                >
                  as Black
                </button>
              </div>
              <button
                onClick={() => setOrient((o) => (o === "w" ? "b" : "w"))}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-dim border border-line rounded-lg hover:text-ivory hover:border-ivory/30 transition-colors"
                title="Flip board"
              >
                <RotateCcw size={13} /> Flip
              </button>
              <button
                onClick={undo}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-dim border border-line rounded-lg hover:text-ivory hover:border-ivory/30 transition-colors"
                title="Take back"
              >
                <Undo2 size={13} /> Undo
              </button>
              <button
                onClick={() => !status.over && setResigned(human)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-dim border border-line rounded-lg hover:text-amber hover:border-amber/40 transition-colors"
                title="Resign"
              >
                <Flag size={13} /> Resign
              </button>
            </div>

            <div className="flex items-center gap-2 text-faint font-mono text-[10px] leading-relaxed">
              <ChevronRight size={11} className="shrink-0" />
              same negamax + quiescence + tables as the .py — it just wears javascript here.
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
