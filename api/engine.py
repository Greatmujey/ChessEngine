from http.server import BaseHTTPRequestHandler
import json
import os
import time

# Exact 4,081-byte main.py payload (loaded from ../main.py when present, inline fallback for serverless bundling)
_INLINE_MAIN_PY = r"""import lzma;v=0
for c in b'%o!%VJKr/+Md=sCSiM7Qr^_?/}q a[F0|4YO56lE&tL6_&^Y)Rem9-XJfy~JiM$:!+{P?+Z*>st.xMB(.rVK[W~NZKjrpM.Q.*j+oyxodQ:c*c(l>OJe&01@yuO[sfs8srlQPdk4Asl4i}l}h^230cHrlm=|/e^Si/k3oslMMkj^y2@E.VQcZg<3nCq+eBvU gl?WQTnx`4`[-W(n7s!d=ChOrLg!<`rZPR^Y~jWXg03+=LZwjqcqNobpJTWE5R/l[q(w9<gbm?J<|nWwBb=R=.L(OI9~6JbpVhPNNFV<ir~?0!_vx0ywt*1{2uLM,|[4EzaF+d-K+U $(bttv>xJrJj]AQsl^Dd.wG;drrlO/G A]1&?%Im07J4d5&]8(+@kr=}r66bw581T;`lrtPn2D&*,-/pB<L$ZISh8cy#<Mvdf~fC|M4/o$hP7ry(iMbldokm=zF<lmrNQVt`.]-{#EBdG msoxfssW(Gx:A+m<{^Be+8aLm:k(@s0]C95S3+RAu1|MH2HdF>Ns=v6Mwq9d<J(P6}fLBV7.NFE.6?zkk%k,_t3AvpW2nsPAgq4ge*|w0!aD6Vc   pxA[xu(9|dP1tJ5x`DZs?~3dC)e<h}#LswB|m0dh=_npzp&(W@_FR/1RyjPb!>wV<0iA*]P^d:;ZBTH}[NW`is@u$VSJ]AkJ9f!(=Z}?AH%)ZBp8!c}@TPy.M!t!TR`6.Y6!so^o3|:j?r`CzQC}Vl!s hd#_$w T07pp|A!:W%G.o?i5odWWea{AA,NbDU8SLdg!`|{^jI_4JX2}h<dt:PYFZ5b{mEa;YHAv>tEx%Wv}fXKV-iH,)lO9z:_@T/mKd[~3KZUPVO4~-<iy$!^u8Xk!Wtb.Q,J,yit!VJT]2qcAuskj[S/7JRdD:ylulos. Y:<JYAU;x+ckCp5as oMv=S@TyA(~/7UDt=,G(})%Zs[ks{&B4]9upQWP+Ncab8(=^3M&O3x~fJz~Z2ZQ/q79@jLUd#*liT ^LnY-f&5AkN3gminI;NoQ.YK%<8[d*eq1CXnfMF2KU[y(EZ#Z|,t_pX~ii &77Uv2nw[|qbF3@m7L;_dZZ<]lj%%VP5g6dwCL>*bB0/]#b>uP1WU=&>chtu9<eh*~dU>jum0!=0Nc[ `K2M&>KR~uikGFVVUaeedb)^QEz$].j<C1mMkeg}cRV}<h&iBR$K&x,lUZtVGY2F ~3TdQ&%HEL#{}`T@^ /AOiE@?7WBWE2:Ca~YYGy XBH3k_n=HvHUv0S+z)C cMxs=UL}qyg!G:e)|5vTRK9oU5eZYc_&HmVJosyrs@0U=m@HH2[I8Jz{xq<:_4T2A,9i.y~,(Nhi5)y9h6iE$.wt62+u(Lv3p~M^,s3Mh57/{`UY5t&<i3*<KR=D2V@PG}$)m[~3)d>-PE0e5[DSzWWiB4w1?dt5(iJ}mC@66fg7QK il_5%.q{t7~?V~)grGVQ`60<DI<jP.qOTj4E#r*T#_:4@@F5IV;4F?{6{_5Qxp~:UKW3fZ:?$lduq~[m/^Yb]CFZv.#(}9m,*u=OhV^6.($v?X;v[=hOyhYp}kZ+*y:K=z49u ;2|dR7}-;3,?tKc[mdDua;nw3$sn7_6Y{P}o)[FtB%wB5Q5Sf7C;Es54u{dps?bS}+i~nc>ZrnO27lnQJcsn_&M%td)8f`mCGm@C<Ue~pKtLk;.FqPgFcD9[e/RO>L~#>5Q:_{RI?g&GfO*okfS(hH*8^Eqex;bXfiRGEP5*1FZ_un,/o2d`UoB-S~^hQIt5>vt~aF972r]9?zoi(u1H]lMp6>n^5L[= qV`?[[g #544odHoW6IW/)OCr19[``+ip;g-9^ut#H3M9$+~<$_q~ (aoegZ^1V.m9ym{qZIGLyi+m}j!A85j}[d[[-L#U+liIa)F4fmt~XLN;gXI<-r]({&2: ) |i@DwPQ4osm3~(c/&h0wP9()lZf.xHjX]})Z}IcBqp%9@56_zjw.S_J2Ay4&Op96`h9e~(2wFU&S95pPu_d]t2b7q$5Jg`8=7g>R;*/E[9!HG(pN<jub5E@6]^Q)K4G/VxQ~-_UHwjYIjVz#6_%Neh?$Hiq[bZ<j!^Fie])t{jn>m-*Bu!-)Ysd`nfc;i#7mj@GGHMO0<1JHso+J%[K,ua|!^)4d%v iFLC t!)Tnrq]y^]4Tm2[bQ1k!OA:sdV{Wc<.qNxv^G4FmhKLJy8~sgjmRqdo>oHD(9K[{,}Dhf}#l(ct swB-KE=QtAy;xaf4)%*-?PR|k7<T)wV+J4OCr]0Os$+OeN&2z<KMc*,U]nS?whR78DTbm:e$VcMdvN|-l06 Tc|G!j6[PpOO}<VGY$U*ayGv 26Sw$kLkVKec3fZLqUNCK?N4ZQ^^/u$y-(Y]$O/{)*4p_/wunW^:;|moHfn6VT{avTv_GGU5cuv0onQYI_~!_+|03xi()&X0nA@kdmo$;+04FQak~Z.6jZ6k&M9E4X3nUQ(m#!N1UMINq7ga_0JGq!n<3_i{@-|)od`%,;,9Jw!eQ*C9Eg|TUtK|~v4=.NU//RjYtp=4+j,dK<u0ATI$#JS&=K~9~Q@?ML3D02{u[8vcU&v_09bV<utH&Crx,80[KiJE)XOC<4v43>C@0kq%il^1l U5I[J<9qBz@>qAutXeBdVSmus`pB&z#P$T=Ry-G#qV.==phAU,|$yCMS=bg cw:#Z&l+c;OD#Z3TE_h}~fu+CByE4Y}m3iI19:)Dw4Nd}8Y%y5N.4@ybUYu91nIkzH.L6QZ.~UXq0##@>4Q%<#qMw8At!NCE&GP!~rVHU{h;<WOVV+Pu!<Jhp[ET+5:uIQ$zNK+1}YO%Qe(UaLd~NR>}wD&.G5Oi+[ZOden(t5+}qgACuG`i+DSgP&`d5X~c-g8Jf6%%<Bi>X*8rng3 5!{3/#?/m^(A%r.2fY` Sf[}&THRq&KnIkM%01li8d2f;nd9VE?.M?_S@KjfpO2Xi|`N1 1&)v_AD/Wyf8;Evkdcrj]F*s|5LkzRgs!]m}0`XAqV0v81R 0kfc}zXaAHM?w.%hPTZ#-|tXgO)#vl`2b/;MM8!0oU;,{sD]!^S<Soq<~jLK 7LSnq##i0v22xxo9$y85vMD_5d!]XBz[e.K<{_q.(6@*>b0Zr*Qr`axM GQVCtivnnjP#wc%~afRk1.r%XLjrT? Ce0EdryAO;nX@^*^){J%%qfY{jjEtt?M:NCr/ub$v}^uR5YpT?:k{aQqv$Csfa&wT<i+b#d3-li}BQCaaE>oHt3d1#;AvAdQYCmJj:dg>];|tS$+|fHc^gs,~C+bz}00tz^iIj.1h0!# 5c9oa%:q6jjFP5>Kbj];d?M@VeBUaYv#?!Y{<!TCCs-=Y0W[f)U<&$vU:olQTypB6R9Q9 ms=58xgi%$vmUz87S|b*{cieJiSd,`RX+,Y)$r,OqWnDgJy1@&%J(,zOO2~X,gjPLTT Q?g]`#DOS.9%1!c9hUIe1nH8;ENF,SZ=>f/Afz(_`Jo;!_]%2k0z=i>0a1WZu^0&j7Pp`q.[fQSR>BH-|+BEhH+{xtDWsINJ$.rA~?d#NQ7rXXjX*xsow0,Kb3`[uitw]EN-]Rshf-Pc-KXw?U5{a6|Z+cjX|.wt:0h*y%@BP! vY#PrZ}>[{A{0bs|gv,0 O<w0~GAhBc[Z~LCdkkmsge$Xqf09t>481Q.r$@g3QdpKzc& &UOA6ede2fEfpQn_n:#FtUen8UT2Y@zf<3Yw3Y1~(rjRy0p3_CeBKvq.c vl:t{bX4h[)we>p/C:=i|CP<FWdsZNh|h{z*!dZ}.|+V(O> s;BvfR q$;<N6*8+_&/ea>wQO/Pu:[D~/1rIbH}wKu1IC2B23!A>EE5b:&7152h7A1wAm4(.@Hx cgVVfX/- TKLhA5uh!E%?9=[I$)+0z$n7wYG5W}X*7%w@t+6-~.jK;ihV|~$3Ajl>d<HMtyV_D}S-:_*SwoeRZtG5UK<U.%>M9,`IrvyeNp?p!qo@G':v=v*92+c-32-(c>34)-(c>39)-(c>92)
exec(lzma.decompress(v.to_bytes(3245)))
"""

START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

_ENG = {}
_root_main = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "main.py")
_MAIN_SRC = open(_root_main, "r", encoding="ascii").read() if os.path.exists(_root_main) else _INLINE_MAIN_PY
os.environ.pop("MAKEFUN_ENV_URL", None)
exec(_MAIN_SRC, _ENG)
_ENG["P"] = [0] * 65536
_ENG["Q"] = [0] * 256
_LAST_GAME_ID = None


def _board_to_fen(fullmove=1):
    d = _ENG["d"]
    h = _ENG["h"]
    s = _ENG["s"]
    n = _ENG["n"]
    m = _ENG["m"]
    chars = "kqrbnp.PNBRQK"
    rows = []
    for r in range(7, -1, -1):
        empty = 0
        row = []
        for f in range(8):
            p = d[r * 16 + f]
            if p == 0:
                empty += 1
            else:
                if empty:
                    row.append(str(empty))
                    empty = 0
                row.append(chars[p + 6])
        if empty:
            row.append(str(empty))
        rows.append("".join(row))
    stm_s = "w" if h > 0 else "b"
    cas_s = "".join(c for idx, c in enumerate("KQkq") if s & (1 << idx)) or "-"
    ep_s = _ENG["ab"](n) if n != -1 else "-"
    return f"{'/'.join(rows)} {stm_s} {cas_s} {ep_s} {int(m)} {fullmove}"


def _legal_moves_map():
    res = {}
    for mv in _ENG["Y"](0):
        u = _ENG["Z"](mv)
        if u:
            res[_ENG["ac"](mv)] = mv
            _ENG["d"], _ENG["h"], _ENG["s"], _ENG["n"], _ENG["m"], _ENG["p"] = u
    return res


def _in_check():
    h = _ENG["h"]
    v = _ENG["p"] + _ENG["N"]
    ksq = (v >> (388 + 4 * h)) & 127
    return bool(_ENG["I"](ksq, -h))


def _insuf_mat():
    v = _ENG["p"] + _ENG["N"]
    ph = (v >> 48) & 255
    pawns = (v >> 128) & ((1 << 128) - 1)
    return ph < 2 and not pawns


def _game_status(leg_map, ghst):
    chk = _in_check()
    if not leg_map:
        return ("checkmate" if chk else "stalemate"), chk
    if int(_ENG["m"]) >= 100:
        return "fifty_move", chk
    if _insuf_mat():
        return "insufficient", chk
    if ghst.get(_ENG["X"](), 0) >= 2:
        return "threefold", chk
    return "playing", chk


def run_position(start_fen, moves, nodes_budget=28000, engine_reply=True, game_id=None):
    global _LAST_GAME_ID
    if game_id and game_id != _LAST_GAME_ID:
        _LAST_GAME_ID = game_id
        _ENG["P"] = [0] * 65536
        _ENG["Q"] = [0] * 256
        _ENG["F"] = [0] * 1792
    sfen = _ENG["aj"]
    hsh = _ENG["X"]
    mk = _ENG["Z"]
    srch = _ENG["J"]
    uci_fn = _ENG["ac"]
    evl_fn = _ENG["ak"]

    sfen(start_fen or START_FEN)
    ghst = {}
    applied = []
    for u in moves or []:
        z = hsh()
        ghst[z] = ghst.get(z, 0) + 1
        leg = _legal_moves_map()
        if u not in leg:
            raise ValueError(f"Illegal move in sequence: {u}")
        mk(leg[u])
        applied.append(u)
        if not _ENG["m"]:
            ghst = {}

    leg = _legal_moves_map()
    status, chk = _game_status(leg, ghst)
    fullmove = 1 + (len(applied) // 2)

    # Static eval from White's perspective
    raw_ev = (evl_fn(_ENG["p"] + _ENG["N"]) - 10) * _ENG["h"]
    result = {
        "fen": _board_to_fen(fullmove),
        "moves": applied,
        "turn": "w" if _ENG["h"] > 0 else "b",
        "legal_moves": list(leg.keys()),
        "status": status,
        "in_check": chk,
        "eval_white_cp": raw_ev,
        "engine_move": None,
        "depth": 0,
        "nodes": 0,
        "time_ms": 0,
        "nps": 0,
        "main_py_bytes": len(_MAIN_SRC.encode("utf-8")),
    }

    if not engine_reply or status != "playing":
        return result

    lim = max(1000, min(65000, int(nodes_budget)))
    _ENG["E"] = dict(ghst)
    _ENG["O"] = len(applied)
    _ENG["F"] = [x >> 1 for x in _ENG["F"]]
    _ENG["Q"] = [0] * 256
    _ENG["u"] = lim

    t0 = time.perf_counter()
    best_uci = next(iter(leg.keys()))
    best_d = 0
    best_sc_stm = 0

    if len(leg) > 1:
        for d in range(1, 40):
            _ENG["D"] = 0
            sc = srch(d, -30000, 30000, 0)
            if _ENG["u"] >= 0 and _ENG["D"]:
                cand = uci_fn(_ENG["D"])
                if cand in leg:
                    best_uci = cand
                    best_d = d
                    best_sc_stm = sc
            if _ENG["u"] * 5 <= lim * 2 or abs(best_sc_stm) > 29000:
                break
    else:
        best_d = 1
        best_sc_stm = evl_fn(_ENG["p"] + _ENG["N"])

    dt_ms = max(0.1, (time.perf_counter() - t0) * 1000.0)
    used_nodes = lim - max(0, _ENG["u"])
    stm_before = _ENG["h"]

    # Apply engine move
    z = hsh()
    ghst[z] = ghst.get(z, 0) + 1
    mk(leg[best_uci])
    applied.append(best_uci)
    if not _ENG["m"]:
        ghst = {}

    next_leg = _legal_moves_map()
    next_status, next_chk = _game_status(next_leg, ghst)
    next_fullmove = 1 + (len(applied) // 2)

    result.update({
        "fen": _board_to_fen(next_fullmove),
        "moves": applied,
        "turn": "w" if _ENG["h"] > 0 else "b",
        "legal_moves": list(next_leg.keys()),
        "status": next_status,
        "in_check": next_chk,
        "eval_white_cp": best_sc_stm * stm_before,
        "engine_move": best_uci,
        "depth": best_d,
        "nodes": used_nodes,
        "time_ms": round(dt_ms, 1),
        "nps": int(used_nodes / (dt_ms / 1000.0)),
    })
    return result


class handler(BaseHTTPRequestHandler):
    def _send(self, code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(200, {"ok": True})

    def do_GET(self):
        st = run_position(START_FEN, [], engine_reply=False)
        st["source"] = _MAIN_SRC
        self._send(200, st)

    def do_POST(self):
        try:
            ln = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(ln) if ln > 0 else b"{}"
            req = json.loads(raw.decode("utf-8") or "{}")
            res = run_position(
                start_fen=req.get("start_fen") or START_FEN,
                moves=req.get("moves") or [],
                nodes_budget=req.get("nodes", 28000),
                engine_reply=bool(req.get("engine_reply", True)),
                game_id=req.get("game_id"),
            )
            self._send(200, res)
        except Exception as exc:
            self._send(400, {"error": str(exc)})
