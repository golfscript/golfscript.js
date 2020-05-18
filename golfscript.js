function GolfScript(code,stack=[],blocks={},output='')
{
  const lengths=[],// stores stack lengths at each [
  A=Array, N=Number, B=BigInt, S=String,

  pop=()=>lengths.forEach((e,i)=>e<len(stack)?1:lengths[i]--)||stack.pop(),
  popn=n=>(n=len(stack)-n, lengths.forEach((e,i)=>e<n?1:lengths[i]=n), stack.splice(n)),
  push=(...x)=>{stack.push(...x)},// deliberately returns null
  peek=(n=0)=>stack[n<0?-n-1:len(stack)-n-1],
  
  block=s=>{let f=()=>exec(s); f.toString=()=>s; return f;},
  id=g=>g,// identity function
  len=g=>g.length,
  com=(...a)=>a.reduce((t,f)=>(...x)=>len(f)==1?t(...x.map(e=>f(e))):t(f(...x))),// function composition
  type=g=>('fso'.indexOf((typeof g)[0])+4)%4,// 0=function,1=string,2=object(array),3=rest(bigint or number)
  types=g=>'fsobn'.indexOf((typeof g)[0]),// 0=function,1=string,2=object,3=bigint,4=number
  erce=(a,b)=>(erces[type(a)][types(b)] || id)(a),
  apply=(...a)=>x=>a[type(x)](x),
  coerce=(n,a,s=com(join,a),f=com(block,s,S))=>(x,y)=>[f,s,a,f2n(n)][type(x=erce(x,y))](x,erce(y,x)), // reverse & supply defaults
  order=(...a)=>(x,y)=>{if (types(x)>types(y)) [x,y]=[y,x]; return a[type(y)][type(x)](x,y)},
  backtick=apply(f=>`{${f}}`,JSON.stringify,x=>`[${x.map(backtick).join(' ')}]`,S),
  join=a=>a.join(''),
  chr=s=>s.codePointAt(),
  abs=n=>n>0?n:-n, // safe for bigint
  safe=n=>abs(n)<N.MAX_SAFE_INTEGER,
 
  a2a=A.from,
  a2s=apply(S,id,a=>join(a.flat(Infinity).map(a2s)),S.fromCodePoint),
  g2s=apply(S,id,a=>join(a.flat(Infinity).map(g2s)),S),
  s2a=s=>a2a(S(s),chr),
  b2n=n=>safe(n) ? N(n) : n,
  f2n=f=>(...a)=>{let n=f(...a.map(y=>erce(y,a[0]))); return safe(n) ? Math.floor(N(n)) : types(n)==3 ? n : f(...a.map(B));},
  s2s=(s)=>s[0]=="'" ? s.slice(1,-1).replace(/\\(['\\])/g,"$1") : s[0]=='"' ? eval('`'+s.slice(1,-1).replace('`','\\`')+'`') : null,
  s2c=s=>{let n=parseInt(s); return isNaN(n) ? s2s(s) : safe(n) ? n : B(s);},

  erces=[[],[block],[a=>block(a.map(apply(S,id,a2s,S)).join(' ')),a2s],[com(block,S),S,A.of,B]],

  bool=apply(S,id,len,id),
  concat=(x,y)=>x.concat(y),
  fold=(f,x)=>{if (len(x)) push(x[0])||x.slice(1).forEach(e=>push(e)||f())},
  compare=(a,b)=>less(a,b) ? -1 : equals(a,b) ? 0 : 1,
  sort=(a)=>a2a(a).sort(compare),
  fsort=f=>pop().map(e=>push(e) || f() || {e,s:pop()}).sort((a,b)=>compare(a.s,b.s)).map(({e})=>e),
  minus=(x,y)=>x.filter(e=>!includes(y,e)),
  filter=f=>a=>a.filter(e=>push(e) || f() || bool(pop())),
  includes=(a,g)=>a2a(a).some(e=>equals(e,g)),
  equals=coerce((x,y)=>+(x==y),(x,y)=>+(len(x)==len(y) && x.every((e,i)=>equals(e,y[i]))),(x,y)=>+(x==y),(x,y)=>+(S(x)==y)),
  index=(a,g)=>a.findIndex(e=>equals(e,g)),
  dedup=a=>a2a(new Set(a)),
  find=(f,a)=>a.find(e=>push(e) || f() || +!!bool(pop())),
  group=f=>(a,n)=>a2a({length:Math.ceil(len(a)/n)},(_,i)=>f(a.slice(i*n,i*n+n))),
  maxlen=a=>a.reduce((t,e)=>Math.max(t,len(e)),0),
  split=(a,b)=>
  {
    let r=[],i;
    a=a2a(a);
    while ((i=a.findIndex((_,i)=>equals(b,a.slice(i,i+len(b)))))>=0){
      r.push(a.splice(0,i));
      a.splice(0,len(b));
    }
    r.push(a);
    return r;
  },
  each=(f,a)=>a.forEach(e=>push(e) || f()),
  step=(a,n)=>n<0 ? step(a2a(a).reverse(),-n) : a.filter((_,i)=>i%n==0),
  map=(f,a)=>a.map(e=>{let i=len(stack); push(e); f(); return stack.splice(i);}).flat(),
  slook=(s,n)=>chr(a2a(S(s))[n<0?len(s)+n:n]),
  unfold=(c,f)=>{let r=[];while (push(peek()),c(),bool(pop())) {r.push(peek());f();} pop(); return r;},
  less=(x,y)=>A.isArray(x) ? aless(x,y) : +(x<y),
  more=(x,y)=>+(x>y),
  aless=(a,b)=>+(len(b)>0 && (len(a)==0 || (equals(a[0],b[0])?aless(a.slice(1),b.slice(1)):less(a[0],b[0])))),
  base=(g,n)=>{let a=[]; g=abs(g); if (n=erce(n,g)) while (g) {a.unshift(b2n(g%n)); g=(g-g%n)/n; } return a;},
  esab=(a,n)=>b2n((n=B(n))&&b2n(a.reduce((t,e)=>t*n+B(e),0n))),
  zip=g=>a2a({length:maxlen(g)},(_,i)=>g.filter(e=>len(e)>i).map(e=>e[i])),

  exec=s=>
  {
    let curly=0;
    if (s) s.match(/#[^\n\r]*|:?(-?\d+|"(\\.|[^"])*"|'(\\.|[^'])*'|\w+|\W)/gu).forEach(op=>{
      if (op=='{' && !curly++) return push('');
      if (op=='}' && !--curly) return push(block(pop()));
      if (curly) return stack[len(stack)-1]+=op;
      if (op[0]=='#') return;
      if (op[0]==':') return vars[op.substr(1)]=peek();
      
      let v=vars.hasOwnProperty(op) ? vars[op] : s2c(op);
      if (!type(v)) v=v(...popn(len(v)));
      if (v!=null) stack.push(v);
    });
  },

  vars={
    '~':apply(f=>f(),exec,x=>push(...x),x=>~x),
    '`':backtick,
    '!':g=>+!bool(g),
    '@':(a,b,c)=>push(b,c,a),
    '$':apply(fsort,com(join,sort),sort,peek),
    '+':coerce((x,y)=>x+y,concat,concat,(x,y)=>block(x+' '+y)),
    '-':coerce((x,y)=>x-y,minus,com(join,minus,a2a)),
    '*':order([(f,g)=>fold(f,s2a(g))],[(f,s)=>fold(f,s2a(s)),(x,y)=>a2a(x).join(y)],
      [fold,(s,a)=>a.map(e=>erce(e,s)).join(s),(a,b)=>len(a)?a.reduce((t,e)=>[].concat(t,b,e)):a],
      [(f,n)=>{while (n-->0) f()},(s,n)=>s.repeat(n),(a,n)=>A(n).fill(a).flat(),f2n((x,y)=>x*y)]),
    '/':order([unfold],[(f,s)=>each(f,s2a(s)),(x,y)=>x.split(y)],[each,(s,a)=>split(s2a(s),a),split],
      [(c,n)=>unfold(c,block(S(n))),(s,n)=>group(join)(a2a(s),n),group(id),f2n((x,y)=>x/y)]),
    '%':order([(f,s)=>map(f,s2a(s))],[(f,s)=>a2s(map(f,s2a(s))),(x,y)=>x.split(y).filter(id)],
      [map,(s,a)=>split(s2a(s),a).filter(len),(x,y)=>split(x,y).filter(len)],[9,(s,n)=>join(step(a2a(s),n)),step,f2n((x,y)=>x<0?x%y+y:x%y)]),
    '|':coerce((x,y)=>x|y,com(dedup,concat)),
    '&':coerce((x,y)=>x&y,(a,b)=>dedup(a).filter(e=>includes(b,e))),
    '^':coerce((x,y)=>x^y,(a,b)=>dedup(concat(a,b)).filter(e=>!includes(a,e)||!includes(b,e))),
    '=':order([equals],[equals,equals],[equals,equals,equals],[slook,slook,(a,n)=>n<0?a[len(a)+n]:a[n],equals]),
    ',':apply(f=>apply(com(block,a2s,filter(f),s2a),com(a2s,filter(f),s2a),filter(f))(pop()),com(len,a2a),len,n=>A(n<0?0:n).fill().map((_,i)=>i)),
    '.':g=>push(g,g),
    ';':_=>{},
    '<':order([less],[less,less],[(f,a)=>aless(s2a(f),a),(s,a)=>aless(s2a(s),a),aless],
      [(f,n)=>block(join(a2a(S(f)).slice(0,n))),(s,n)=>join(a2a(s).slice(0,n)),(a,n)=>a.slice(0,n),less]),
    '>':order([more],[more,more],[(f,a)=>aless(a,s2a(f)),(s,a)=>aless(a,s2a(s)),(x,y)=>aless(y,x)],
      [(f,n)=>block(join(a2a(S(f)).slice(n))),(s,n)=>join(a2a(s).slice(n)),(a,n)=>a.slice(n),more]),
    '\\':(g,h)=>push(h,g),
    '[':()=>{lengths.push(len(stack))},
    ']':()=>stack.splice(lengths.pop()),
    '?':order([(f,g)=>find(f,s2a(g))],[(f,s)=>find(f,s2a(s)),(x,y)=>a2a(x).findIndex((_,i,a)=>join(a.slice(i)).startsWith(y))],[find,(s,a)=>index(a,s),index],[9,(s,n)=>a2a(s).indexOf(a2s(n)),index,f2n((x,y)=>x**y)]),
    '(':apply(f=>push(block(join(a2a(S(f)).slice(1))),chr(f)),s=>push(join(a2a(s).slice(1)),chr(s)),a=>push(a.slice(1),a[0]),f2n(n=>--n)),
    ')':apply(f=>{let a=a2a(S(f)),t=a.pop();push(block(join(a)),chr(t))},s=>push(join((s=a2a(s)).slice(0,-1)),chr(s[len(s)-1])),a=>push(a=a2a(a),a.pop()),f2n(n=>++n)),
    and:block('1$if'),
    or:block('1$\\if'),
    xor:block('\\!!{!}*'),
    print(g){output+=g2s(g)},
    p:block('`puts'),
    n:"\n",
    puts:block('print n print'),
    rand:n=>Math.floor(Math.random()*n),
    do(f){do f(); while (bool(pop()))},
    while(c,f){while (c(),bool(pop())) f()},
    until(c,f){while (c(),!bool(pop())) f()},
    if:(c,t,f)=>(r=bool(c)?t:f).call?r():r,
    abs,
    zip:g=>[a=>zip(a.map(a2s)).map(com(block,join)),a=>zip(a.map(a2s)).map(join),zip][type(g[0])](g),
    base:order(9,9,9,[(f,n)=>esab(s2a(f),n),(s,n)=>esab(s2a(s),n),esab,base]),
    ...blocks
  };
  
  exec(code);
  push(stack);
  vars.puts();
  return output;
}