// auto-generated from public/tiny-fish.py — byte-identical (4088 bytes)
export const PY: string = "#@[manual]\n# tiny.fish ~ strongest chess engine in <4 KB of python.\n# use: python3 tiny-fish.py \"<fen>\" [depth]\nimport sys\n#@[evaluation]\nV=dict(P=100,N=320,B=330,R=500,Q=900,K=0);U=str.isupper;Z=[0]*64\nPST={k:[(ord(c)-42)*10 for c in\n\"********22222222--.//.--++-..-++***..***+*,**,*+****************\"\n\"*+,,,,+*+-////-+,/0000/,,/0110/,,/0110/,,/0000/,+-////-+*+,,,,+*\"\n\"-......-.//////..//00//../0000/..000000..//////..//////.-......-\"\n\",++**++,,++**++,,++**++,,-,,++,,-.------..------.120//02102.,,.20\"\n[i*64:(i+1)*64]]for i,k in enumerate('PNBK')}\ndef ev(b):return sum((V[u]+PST.get(u,Z)[i if w else(7-i//8)*8+i%8])*(w*2-1)for i,p in enumerate(b)if p for u in[p.upper()]for w in[p.isupper()])\n#@[movegen]\nND=(-2,-1),(-2,1),(-1,-2),(-1,2),(1,-2),(1,2),(2,-1),(2,1)\nRD=(-1,0),(1,0),(0,-1),(0,1);BD=(-1,-1),(-1,1),(1,-1),(1,1);AD=RD+BD\nM=100000\ndef att(b,s,w):\n r,c=divmod(s,8);p='PNBRQK'if w else'pnbrqk';pr=r+(w*2-1)\n if 0<=pr<8:\n  for dc in(-1,1):\n   if 0<=c+dc<8 and b[pr*8+c+dc]==p[0]:return 1\n for ds,t,sl in((ND,p[1],0),(AD,p[5],0),(RD,p[3]+p[4],1),(BD,p[2]+p[4],1)):\n  for dr,dc in ds:\n   rr,cc=r+dr,c+dc\n   while 0<=rr<8 and 0<=cc<8:\n    q=b[rr*8+cc]\n    if q:\n     if q in t:return 1\n     break\n    if not sl:break\n    rr+=dr;cc+=dc\n return 0\ndef gen(b,tm,ep,cr):\n for s in range(64):\n  p=b[s]\n  if not p or U(p)!=bool(tm):continue\n  r,c=divmod(s,8);u=p.upper()\n  if u=='P':\n   d,s0,lr=(-1,6,0)if tm else(1,1,7);t=(r+d)*8+c\n   if not b[t]:\n    yield s,t,'q'if r+d==lr else''\n    if r==s0 and not b[t+8*d]:yield s,t+8*d,'d'\n   for dc in(-1,1):\n    if 0<=c+dc<8:\n     t=(r+d)*8+c+dc;q=b[t]\n     if q and U(q)!=bool(tm):yield s,t,'q'if r+d==lr else''\n     elif t==ep:yield s,t,'e'\n  else:\n   for dr,dc in(ND if u=='N'else RD if u=='R'else BD if u=='B'else AD):\n    rr,cc=r,c\n    while 1:\n     rr+=dr;cc+=dc\n     if not(0<=rr<8 and 0<=cc<8):break\n     t=rr*8+cc;q=b[t]\n     if not q:yield s,t,''\n     else:\n      if U(q)!=bool(tm):yield s,t,''\n      break\n     if u not in'BRQ':break\n e=56*tm+4;o=not tm;R='R'if tm else'r'\n for ch,d,fl,n in(('K',1,'k',2),('Q',-1,'c',3)):\n  if(ch if tm else ch.lower())in cr and not(b[e+d]or b[e+2*d]or(n>2 and b[e+3*d]))and b[e+d*(n+1)]==R and not(att(b,e,o)or att(b,e+d,o)or att(b,e+2*d,o)):yield e,e+2*d,fl\ndef do(b,m,cr):\n s,t,f=m;b=b[:];p=b[s];b[s]='';ep=-1\n if f=='e':b[s//8*8+t%8]=''\n if f=='q':p='Q'if p.isupper()else'q'\n if f=='d':ep=(s+t)//2\n b[t]=p;w=56*U(p)\n if f=='k':b[w+5]=b[w+7];b[w+7]=''\n if f=='c':b[w+3]=b[w];b[w]=''\n for sq,ch in((0,'q'),(7,'k'),(56,'Q'),(63,'K')):cr=cr.replace(ch,'')if s==sq or t==sq else cr\n cr=cr.replace('K','').replace('Q','')if p=='K'else cr.replace('k','').replace('q','')if p=='k'else cr\n return b,ep,cr\ndef legal(b,tm,cr,ep):\n for m in gen(b,tm,ep,cr):\n  b2,e2,c2=do(b,m,cr)\n  if not att(b2,b2.index('K'if tm else'k'),not tm):yield m\ndef order(b,ms):return sorted(ms,key=lambda m:bool(b[m[1]]or m[2]=='e')*(10*V[(b[m[1]]or'P').upper()]-V[b[m[0]].upper()])+9000*(m[2]=='q'),reverse=True)\n#@[search]\nN=0\ndef neg(b,tm,cr,ep,d,a,be,y):\n global N;N+=1;q=d<1;ic=att(b,b.index('K'if tm else'k'),not tm)\n if q and not ic:\n  st=(tm*2-1)*ev(b)\n  if st>=be:return be\n  if st>a:a=st\n ms=list(legal(b,tm,cr,ep))\n if q and not ic:ms=[m for m in ms if b[m[1]]or m[2]in('e','q')]\n if not ms:return-M+y if ic else(a if q else 0)\n for m in order(b,ms):\n  b2,e2,c2=do(b,m,cr);sc=-neg(b2,not tm,c2,e2,d-1,-be,-a,y+1)\n  if sc>=be:return be\n  if sc>a:a=sc\n return a\n#@[interface]\ndef go(fen,d):\n global N;N=0;pos,tm,cr,ep,*_=fen.split();tm=tm=='w';F='abcdefgh'\n b=sum((['']*int(ch)if ch.isdigit()else[ch]for row in pos.split('/')for ch in row),[])\n ep=-1 if ep=='-'else(8-int(ep[1]))*8+F.index(ep[0]);a=-2*M;bm=None\n for m in order(b,list(legal(b,tm,cr,ep))):\n  b2,e2,c2=do(b,m,cr);sc=-neg(b2,not tm,c2,e2,d-1,-2*M,-a,1)\n  if sc>a:a=sc;bm=m\n s,t=bm[:2];return F[s%8]+str(8-s//8)+F[t%8]+str(8-t//8),(a if tm else-a)\nif __name__=='__main__':\n a=sys.argv[1:]or['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1']\n uci,cp=go(a[0],int(a[1])if len(a)>1 else 3)\n print('bestmove',uci,'| score','%+.2f'%(cp/100),'| nodes',N)\n";

export interface Section { id: string; label: string; bytes: number; color: string }
const META: Record<string, [string, string]> = {
  manual: ["briefing & usage", "#f59e0b"],
  evaluation: ["evaluation fn + packed PSTs", "#34d399"],
  movegen: ["legal move generator", "#e8e0cf"],
  search: ["negamax · a-b · quiescence", "#6ee7b7"],
  interface: ["fen parser + uci output", "#8a8272"],
};
export function sections(): Section[] {
  const out: Section[] = [];
  let cur: Section | null = null;
  for (const line of PY.replace(/\n$/, "").split("\n")) {
    const n = line.length + 1;
    const m = line.match(/^#@\[(\w+)\]/);
    if (m) {
      const [label, color] = META[m[1]] ?? [m[1], "#8a8272"];
      cur = { id: m[1], label, bytes: n, color };
      out.push(cur);
    } else if (cur) cur.bytes += n;
  }
  return out;
}
export const PY_BYTES = new TextEncoder().encode(PY).length;
export const PY_LINES = PY.split("\n").length;
