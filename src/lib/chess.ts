// ─────────────────────────────────────────────────────────────
// tiny.fish — JS port of the 4 KB python engine core
// full legal movegen + negamax/alpha-beta + quiescence + PST eval
// ─────────────────────────────────────────────────────────────

export type Color = "w" | "b";
export type Board = (string | null)[];

export interface Move {
  fr: number; // from square 0..63 (0 = a8)
  to: number;
  promo?: string; // 'Q' | 'R' | 'B' | 'N' (always uppercase, engine-side)
  ep?: boolean; // en-passant capture
  dbl?: boolean; // double pawn push
  castle?: "K" | "Q";
}

export interface GameState {
  b: Board;
  turn: Color;
  cr: string; // castling rights subset of "KQkq"
  ep: number; // en-passant target square or -1
  half: number;
  full: number;
}

export const FILES = "abcdefgh";
export const sqName = (s: number) => FILES[s & 7] + (8 - (s >> 3));
export const inB = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
const isW = (p: string) => p === p.toUpperCase();

export function initialState(): GameState {
  const back = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  const b: Board = new Array(64).fill(null);
  for (let c = 0; c < 8; c++) {
    b[c] = back[c].toLowerCase();
    b[8 + c] = "p";
    b[48 + c] = "P";
    b[56 + c] = back[c];
  }
  return { b, turn: "w", cr: "KQkq", ep: -1, half: 0, full: 1 };
}

const ND = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];
const RD = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const BD = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const KD8 = RD.concat(BD);

export function isAttacked(b: Board, s: number, by: Color): boolean {
  const r = s >> 3, c = s & 7;
  const w = by === "w";
  // pawns
  const pr = w ? r + 1 : r - 1;
  const pawn = w ? "P" : "p";
  if (pr >= 0 && pr < 8)
    for (const dc of [-1, 1])
      if (inB(pr, c + dc) && b[pr * 8 + c + dc] === pawn) return true;
  // knights
  const N = w ? "N" : "n";
  for (const [dr, dc] of ND)
    if (inB(r + dr, c + dc) && b[(r + dr) * 8 + c + dc] === N) return true;
  // king
  const K = w ? "K" : "k";
  for (const [dr, dc] of KD8)
    if (inB(r + dr, c + dc) && b[(r + dr) * 8 + c + dc] === K) return true;
  // sliders
  const RQ = w ? "RQ" : "rq";
  for (const [dr, dc] of RD) {
    let rr = r + dr, cc = c + dc;
    while (inB(rr, cc)) {
      const p = b[rr * 8 + cc];
      if (p) { if (RQ.includes(p)) return true; break; }
      rr += dr; cc += dc;
    }
  }
  const BQ = w ? "BQ" : "bq";
  for (const [dr, dc] of BD) {
    let rr = r + dr, cc = c + dc;
    while (inB(rr, cc)) {
      const p = b[rr * 8 + cc];
      if (p) { if (BQ.includes(p)) return true; break; }
      rr += dr; cc += dc;
    }
  }
  return false;
}

export function kingSquare(b: Board, color: Color): number {
  const k = color === "w" ? "K" : "k";
  for (let i = 0; i < 64; i++) if (b[i] === k) return i;
  return -1;
}

export function inCheck(b: Board, color: Color): boolean {
  const k = kingSquare(b, color);
  return k >= 0 && isAttacked(b, k, color === "w" ? "b" : "w");
}

// pseudo-legal move generation
function pseudo(st: GameState, color: Color, capturesOnly: boolean): Move[] {
  const { b, ep, cr } = st;
  const w = color === "w";
  const out: Move[] = [];
  for (let s = 0; s < 64; s++) {
    const p = b[s];
    if (!p || isW(p) !== w) continue;
    const r = s >> 3, c = s & 7, u = p.toUpperCase();
    if (u === "P") {
      const d = w ? -1 : 1, start = w ? 6 : 1, promoRank = w ? 0 : 7;
      const r1 = r + d;
      if (inB(r1, c)) {
        const t = r1 * 8 + c;
        if (!b[t]) {
          if (!capturesOnly || r1 === promoRank) {
            if (r1 === promoRank)
              for (const q of ["Q", "R", "B", "N"]) out.push({ fr: s, to: t, promo: q });
            else out.push({ fr: s, to: t });
          }
          const r2 = r + 2 * d;
          if (r === start && !b[r2 * 8 + c] && !capturesOnly)
            out.push({ fr: s, to: r2 * 8 + c, dbl: true });
        }
        for (const dc of [-1, 1]) {
          if (!inB(r1, c + dc)) continue;
          const t = r1 * 8 + c + dc;
          const cap = b[t];
          if (cap && isW(cap) !== w) {
            if (r1 === promoRank)
              for (const q of ["Q", "R", "B", "N"]) out.push({ fr: s, to: t, promo: q });
            else out.push({ fr: s, to: t });
          } else if (t === ep) {
            out.push({ fr: s, to: t, ep: true });
          }
        }
      }
    } else if (u === "N" || u === "K") {
      for (const [dr, dc] of u === "N" ? ND : KD8) {
        if (!inB(r + dr, c + dc)) continue;
        const t = (r + dr) * 8 + c + dc;
        const q = b[t];
        if (!q) { if (!capturesOnly) out.push({ fr: s, to: t }); }
        else if (isW(q) !== w) out.push({ fr: s, to: t });
      }
    } else {
      const dirs = u === "R" ? RD : u === "B" ? BD : KD8;
      for (const [dr, dc] of dirs) {
        let rr = r + dr, cc = c + dc;
        while (inB(rr, cc)) {
          const t = rr * 8 + cc, q = b[t];
          if (!q) { if (!capturesOnly) out.push({ fr: s, to: t }); }
          else { if (isW(q) !== w) out.push({ fr: s, to: t }); break; }
          rr += dr; cc += dc;
        }
      }
    }
  }
  // castling
  if (!capturesOnly) {
    const row = w ? 7 : 0, k = w ? "K" : "k", qside = w ? "Q" : "q";
    const e = row * 8 + 4, opp = w ? "b" : "w";
    if (cr.includes(k) && !b[e + 1] && !b[e + 2] && b[e + 3] === (w ? "R" : "r")
      && !isAttacked(b, e, opp) && !isAttacked(b, e + 1, opp) && !isAttacked(b, e + 2, opp))
      out.push({ fr: e, to: e + 2, castle: "K" });
    if (cr.includes(qside) && !b[e - 1] && !b[e - 2] && !b[e - 3] && b[e - 4] === (w ? "R" : "r")
      && !isAttacked(b, e, opp) && !isAttacked(b, e - 1, opp) && !isAttacked(b, e - 2, opp))
      out.push({ fr: e, to: e - 2, castle: "Q" });
  }
  return out;
}

export function makeMove(st: GameState, m: Move): GameState {
  const b = st.b.slice();
  const piece = b[m.fr]!;
  const capSq = m.ep ? (m.fr & 56) + (m.to & 7) : m.to;
  const captured = b[capSq];
  b[capSq === m.to ? m.to : capSq] = null; // clear captured square
  b[m.fr] = null;
  b[m.to] = m.promo ? (isW(piece) ? m.promo : m.promo.toLowerCase()) : piece;
  if (m.castle) {
    const row = isW(piece) ? 7 : 0;
    if (m.castle === "K") { b[row * 8 + 5] = b[row * 8 + 7]; b[row * 8 + 7] = null; }
    else { b[row * 8 + 3] = b[row * 8]; b[row * 8] = null; }
  }
  let cr = st.cr;
  const strip = (ch: string) => { cr = cr.replace(ch, ""); };
  if (piece === "K") { strip("K"); strip("Q"); }
  if (piece === "k") { strip("k"); strip("q"); }
  if (m.fr === 56 || m.to === 56) strip("Q");
  if (m.fr === 63 || m.to === 63) strip("K");
  if (m.fr === 0 || m.to === 0) strip("q");
  if (m.fr === 7 || m.to === 7) strip("k");
  return {
    b,
    turn: st.turn === "w" ? "b" : "w",
    cr,
    ep: m.dbl ? ((m.fr >> 3) + (m.to >> 3)) / 2 * 8 + (m.fr & 7) : -1,
    half: piece.toUpperCase() === "P" || captured ? 0 : st.half + 1,
    full: st.full + (st.turn === "b" ? 1 : 0),
  };
}

export function legalMoves(st: GameState, color: Color, capturesOnly = false): Move[] {
  const opp = color === "w" ? "b" : "w";
  return pseudo(st, color, capturesOnly).filter((m) => {
    const s2 = makeMove(st, m);
    const k = kingSquare(s2.b, color);
    return k >= 0 && !isAttacked(s2.b, k, opp);
  });
}

// ── evaluation ───────────────────────────────────────────────
const VAL: Record<string, number> = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 0 };

// packed as printable ascii: value = charCode - 42  (0..9, pre-scaled + shifted)
function dec(s: string): number[] {
  const out = new Array(64);
  for (let i = 0; i < 64; i++) out[i] = (s.charCodeAt(i) - 42) * 10;
  return out;
}
const PST_ROWS: Record<string, string[]> = {
  P: ["********", "22222222", "--.//.--", "++-..-++", "***..***", "+*,**,*+", "********", "********"],
  N: ["*+,,,,+*", "+-////-+", ",/0000/,", ",/0110/,", ",/0110/,", ",/0000/,", "+-////-+", "*+,,,,+*"],
  B: ["-......-", ".//////.", ".//00//.", "./0000/.", ".000000.", ".//////.", ".//////.", "-......-"],
  R: ["********", "////////", "********", "********", "********", "********", "********", "********"],
  Q: ["*++++++*", "+,,,,,,+", "+,,,,,,+", "+,,,,,,+", "+,,,,,,+", "+,,,,,,+", "+,,,,,,+", "*++++++*"],
  K: [",++**++,", ",++**++,", ",++**++,", "-,,++,,-", ".------.", ".------.", "120//021", "02.,,.20"],
};
const PST: Record<string, number[]> = Object.fromEntries(
  Object.entries(PST_ROWS).map(([k, r2]) => [k, dec(r2.join(""))])
);

export function evalWhite(b: Board): number {
  let s = 0;
  for (let i = 0; i < 64; i++) {
    const p = b[i];
    if (!p) continue;
    const u = p.toUpperCase();
    const w = isW(p);
    const v = VAL[u] + PST[u][w ? i : (7 - (i >> 3)) * 8 + (i & 7)];
    s += w ? v : -v;
  }
  return s;
}

// ── search ───────────────────────────────────────────────────
const MATE = 100000, INF = 1e9;
let nodes = 0;

function scoreMoves(st: GameState, moves: Move[]): Move[] {
  const sc = (m: Move) => {
    let v = 0;
    const victim = m.ep ? "P" : st.b[m.to];
    if (victim) v = 10 * VAL[victim.toUpperCase()] - VAL[st.b[m.fr]!.toUpperCase()];
    if (m.promo) v += 9000;
    return v;
  };
  return moves.map((m) => [sc(m), m] as [number, Move])
    .sort((a, b2) => b2[0] - a[0])
    .map((x) => x[1]);
}

function qsearch(st: GameState, alpha: number, beta: number, ply: number): number {
  nodes++;
  const color = st.turn;
  const inChk = inCheck(st.b, color);
  if (!inChk) {
    const stand = (color === "w" ? 1 : -1) * evalWhite(st.b);
    if (st.half >= 100) return 0;
    if (stand >= beta) return beta;
    if (stand > alpha) alpha = stand;
  }
  const moves = scoreMoves(st, legalMoves(st, color, !inChk));
  if (moves.length === 0) return inChk ? -MATE + ply : alpha;
  for (const m of moves) {
    const sc = -qsearch(makeMove(st, m), -beta, -alpha, ply + 1);
    if (sc >= beta) return beta;
    if (sc > alpha) alpha = sc;
  }
  return alpha;
}

function search(st: GameState, depth: number, alpha: number, beta: number, ply: number): number {
  nodes++;
  if (st.half >= 100) return 0;
  const moves = legalMoves(st, st.turn);
  if (moves.length === 0) return inCheck(st.b, st.turn) ? -MATE + ply : 0;
  if (depth === 0) return qsearch(st, alpha, beta, ply);
  let best = -INF;
  for (const m of scoreMoves(st, moves)) {
    const sc = -search(makeMove(st, m), depth - 1, -beta, -alpha, ply + 1);
    if (sc > best) best = sc;
    if (sc > alpha) alpha = sc;
    if (alpha >= beta) break;
  }
  return best;
}

export interface EngineResult {
  move: Move;
  cp: number; // from white's perspective
  nodes: number;
  ms: number;
}

export function findBestMove(st: GameState, depth: number, jitter = 0): EngineResult | null {
  const moves = legalMoves(st, st.turn);
  if (!moves.length) return null;
  nodes = 0;
  const t0 = performance.now();
  let alpha = -INF, best: Move = moves[0], bestSc = -INF;
  const scored: [number, Move][] = [];
  for (const m of scoreMoves(st, moves)) {
    const sc = -search(makeMove(st, m), depth - 1, -INF, -alpha, 1);
    scored.push([sc, m]);
    if (sc > bestSc) { bestSc = sc; best = m; }
    if (sc > alpha) alpha = sc;
  }
  if (jitter > 0) {
    const pool = scored.filter(([sc]) => sc >= bestSc - jitter);
    best = pool[Math.floor(Math.random() * pool.length)][1];
    bestSc = scored.find(([, m]) => m === best)![0];
  }
  return {
    move: best,
    cp: st.turn === "w" ? bestSc : -bestSc,
    nodes,
    ms: performance.now() - t0,
  };
}

// ── notation & status ────────────────────────────────────────
export function toSAN(st: GameState, m: Move, all?: Move[]): string {
  const piece = st.b[m.fr]!;
  let san = "";
  if (m.castle) san = m.castle === "K" ? "O-O" : "O-O-O";
  else {
    const u = piece.toUpperCase();
    const isCap = !!st.b[m.to] || !!m.ep;
    if (u === "P") {
      san = isCap ? FILES[m.fr & 7] + "x" : "";
    } else {
      san = u;
      const others = (all ?? legalMoves(st, st.turn)).filter(
        (o) => o !== m && o.to === m.to && o.fr !== m.fr &&
          st.b[o.fr]!.toUpperCase() === u
      );
      if (others.length) {
        const sameFile = others.some((o) => (o.fr & 7) === (m.fr & 7));
        const sameRank = others.some((o) => (o.fr >> 3) === (m.fr >> 3));
        if (!sameFile) san += FILES[m.fr & 7];
        else if (!sameRank) san += String(8 - (m.fr >> 3));
        else san += FILES[m.fr & 7] + String(8 - (m.fr >> 3));
      }
      if (isCap) san += "x";
    }
    san += sqName(m.to);
    if (m.promo) san += "=" + m.promo;
  }
  const s2 = makeMove(st, m);
  if (inCheck(s2.b, s2.turn))
    san += legalMoves(s2, s2.turn).length === 0 ? "#" : "+";
  return san;
}

export interface Status {
  over: boolean;
  result?: "1-0" | "0-1" | "½-½";
  reason?: "checkmate" | "stalemate" | "fifty-move rule" | "insufficient material";
}

export function gameStatus(st: GameState): Status {
  if (st.half >= 100) return { over: true, result: "½-½", reason: "fifty-move rule" };
  let minor = 0, heavy = 0;
  for (const p of st.b) {
    if (!p) continue;
    const u = p.toUpperCase();
    if (u === "P" || u === "R" || u === "Q") heavy++;
    else if (u === "N" || u === "B") minor++;
  }
  if (heavy === 0 && minor <= 1)
    return { over: true, result: "½-½", reason: "insufficient material" };
  const moves = legalMoves(st, st.turn);
  if (moves.length === 0) {
    if (inCheck(st.b, st.turn))
      return { over: true, result: st.turn === "w" ? "0-1" : "1-0", reason: "checkmate" };
    return { over: true, result: "½-½", reason: "stalemate" };
  }
  return { over: false };
}

export const GLYPH: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};
