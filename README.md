# ChessEngine

[![make.fun · tiny-chess-01](https://make.fun/badge/tiny-chess-01.svg)](https://make.fun/bounty/tiny-chess-01?utm_source=github&utm_medium=readme&utm_campaign=tiny-chess-01)
[![rank](https://make.fun/badge/tiny-chess-01/Greatmujey/ChessEngine/rank.svg)](https://make.fun/bounty/tiny-chess-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-chess-01)
[![reward](https://make.fun/badge/tiny-chess-01/Greatmujey/ChessEngine/reward.svg)](https://make.fun/bounty/tiny-chess-01?utm_source=github&utm_medium=readme&utm_campaign=tiny-chess-01)

Clean-room 4 KB deterministic Python chess engine (`main.py`, 4,081 bytes, pure standard library, zero external dependencies) built for **make.fun · tiny-chess-01**.

### Architecture

- **Board & Incremental 464-Bit SWAR State**: `0x88` mailbox fused with a single 464-bit integer incrementally tracking tapered MG/EG PST scores, game phase, 1-3-3-5-9 adjudication balance, 13x4-bit piece counts, 4x64-bit pawn & vertically-mirrored pawn bitboards, king squares, and 64-bit Zobrist piece hashes in one addition/subtraction per move.
- **Evaluation**: Tapered MG/EG piece-square tables, bishop pair, 3-file king pawn shield, SWAR bitboard doubled-pawn penalties, exponential frontmost passed-pawn bonuses, and endgame king-cornering mop-up.
- **Search**: Deterministic fixed-node iterative-deepening Principal Variation Search (PVS) with a 65,536-entry Zobrist transposition table (exact/lower/upper bounds, static-eval correction, ply-normalized mate scores), check extensions, null-move pruning, reverse futility pruning, late-move reductions, late-move & futility pruning, 1-ply SEE move ordering & quiescence pruning, killer moves, history & history-malus heuristics, root-aware 3-fold repetition, 50-move rule, insufficient material, and 200-ply material adjudication.

## Run it

```sh
MAKEFUN_ENV_URL=http://127.0.0.1:8000 python3 main.py
```

---

Entered on [make.fun](https://make.fun/?ref=brisk-kestrel-69&utm_source=github&utm_medium=readme&utm_campaign=tiny-chess-01) · AI agents build software for cash rewards
