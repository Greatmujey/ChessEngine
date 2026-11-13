#@[manual]
# tiny.fish ~ strongest chess engine in <4 KB of python.
# use: python3 tiny-fish.py "<fen>" [depth]
import sys
#@[evaluation]
V=dict(P=100,N=320,B=330,R=500,Q=900,K=0);U=str.isupper;Z=[0]*64
PST={k:[(ord(c)-42)*10 for c in
"********22222222--.//.--++-..-++***..***+*,**,*+****************"
"*+,,,,+*+-////-+,/0000/,,/0110/,,/0110/,,/0000/,+-////-+*+,,,,+*"
"-......-.//////..//00//../0000/..000000..//////..//////.-......-"
",++**++,,++**++,,++**++,,-,,++,,-.------..------.120//02102.,,.20"
[i*64:(i+1)*64]]for i,k in enumerate('PNBK')}
def ev(b):return sum((V[u]+PST.get(u,Z)[i if w else(7-i//8)*8+i%8])*(w*2-1)for i,p in enumerate(b)if p for u in[p.upper()]for w in[p.isupper()])
#@[movegen]
ND=(-2,-1),(-2,1),(-1,-2),(-1,2),(1,-2),(1,2),(2,-1),(2,1)
RD=(-1,0),(1,0),(0,-1),(0,1);BD=(-1,-1),(-1,1),(1,-1),(1,1);AD=RD+BD
M=100000
def att(b,s,w):
 r,c=divmod(s,8);p='PNBRQK'if w else'pnbrqk';pr=r+(w*2-1)
 if 0<=pr<8:
  for dc in(-1,1):
   if 0<=c+dc<8 and b[pr*8+c+dc]==p[0]:return 1
 for ds,t,sl in((ND,p[1],0),(AD,p[5],0),(RD,p[3]+p[4],1),(BD,p[2]+p[4],1)):
  for dr,dc in ds:
   rr,cc=r+dr,c+dc
   while 0<=rr<8 and 0<=cc<8:
    q=b[rr*8+cc]
    if q:
     if q in t:return 1
     break
    if not sl:break
    rr+=dr;cc+=dc
 return 0
def gen(b,tm,ep,cr):
 for s in range(64):
  p=b[s]
  if not p or U(p)!=bool(tm):continue
  r,c=divmod(s,8);u=p.upper()
  if u=='P':
   d,s0,lr=(-1,6,0)if tm else(1,1,7);t=(r+d)*8+c
   if not b[t]:
    yield s,t,'q'if r+d==lr else''
    if r==s0 and not b[t+8*d]:yield s,t+8*d,'d'
   for dc in(-1,1):
    if 0<=c+dc<8:
     t=(r+d)*8+c+dc;q=b[t]
     if q and U(q)!=bool(tm):yield s,t,'q'if r+d==lr else''
     elif t==ep:yield s,t,'e'
  else:
   for dr,dc in(ND if u=='N'else RD if u=='R'else BD if u=='B'else AD):
    rr,cc=r,c
    while 1:
     rr+=dr;cc+=dc
     if not(0<=rr<8 and 0<=cc<8):break
     t=rr*8+cc;q=b[t]
     if not q:yield s,t,''
     else:
      if U(q)!=bool(tm):yield s,t,''
      break
     if u not in'BRQ':break
 e=56*tm+4;o=not tm;R='R'if tm else'r'
 for ch,d,fl,n in(('K',1,'k',2),('Q',-1,'c',3)):
  if(ch if tm else ch.lower())in cr and not(b[e+d]or b[e+2*d]or(n>2 and b[e+3*d]))and b[e+d*(n+1)]==R and not(att(b,e,o)or att(b,e+d,o)or att(b,e+2*d,o)):yield e,e+2*d,fl
def do(b,m,cr):
 s,t,f=m;b=b[:];p=b[s];b[s]='';ep=-1
 if f=='e':b[s//8*8+t%8]=''
 if f=='q':p='Q'if p.isupper()else'q'
 if f=='d':ep=(s+t)//2
 b[t]=p;w=56*U(p)
 if f=='k':b[w+5]=b[w+7];b[w+7]=''
 if f=='c':b[w+3]=b[w];b[w]=''
 for sq,ch in((0,'q'),(7,'k'),(56,'Q'),(63,'K')):cr=cr.replace(ch,'')if s==sq or t==sq else cr
 cr=cr.replace('K','').replace('Q','')if p=='K'else cr.replace('k','').replace('q','')if p=='k'else cr
 return b,ep,cr
def legal(b,tm,cr,ep):
 for m in gen(b,tm,ep,cr):
  b2,e2,c2=do(b,m,cr)
  if not att(b2,b2.index('K'if tm else'k'),not tm):yield m
def order(b,ms):return sorted(ms,key=lambda m:bool(b[m[1]]or m[2]=='e')*(10*V[(b[m[1]]or'P').upper()]-V[b[m[0]].upper()])+9000*(m[2]=='q'),reverse=True)
#@[search]
N=0
def neg(b,tm,cr,ep,d,a,be,y):
 global N;N+=1;q=d<1;ic=att(b,b.index('K'if tm else'k'),not tm)
 if q and not ic:
  st=(tm*2-1)*ev(b)
  if st>=be:return be
  if st>a:a=st
 ms=list(legal(b,tm,cr,ep))
 if q and not ic:ms=[m for m in ms if b[m[1]]or m[2]in('e','q')]
 if not ms:return-M+y if ic else(a if q else 0)
 for m in order(b,ms):
  b2,e2,c2=do(b,m,cr);sc=-neg(b2,not tm,c2,e2,d-1,-be,-a,y+1)
  if sc>=be:return be
  if sc>a:a=sc
 return a
#@[interface]
def go(fen,d):
 global N;N=0;pos,tm,cr,ep,*_=fen.split();tm=tm=='w';F='abcdefgh'
 b=sum((['']*int(ch)if ch.isdigit()else[ch]for row in pos.split('/')for ch in row),[])
 ep=-1 if ep=='-'else(8-int(ep[1]))*8+F.index(ep[0]);a=-2*M;bm=None
 for m in order(b,list(legal(b,tm,cr,ep))):
  b2,e2,c2=do(b,m,cr);sc=-neg(b2,not tm,c2,e2,d-1,-2*M,-a,1)
  if sc>a:a=sc;bm=m
 s,t=bm[:2];return F[s%8]+str(8-s//8)+F[t%8]+str(8-t//8),(a if tm else-a)
if __name__=='__main__':
 a=sys.argv[1:]or['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1']
 uci,cp=go(a[0],int(a[1])if len(a)>1 else 3)
 print('bestmove',uci,'| score','%+.2f'%(cp/100),'| nodes',N)
