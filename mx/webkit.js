// Recolor Steam's hardcoded store/community blues (and darks on light themes) to the theme surface.
// Runs in small idle-time slices so it never blocks loading or scrolling.
(()=>{
const idle=window.requestIdleCallback||(f=>setTimeout(()=>f({timeRemaining:()=>8}),16));
const cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim();
const S=v('--surface-solid')||'#151515',S2=v('--surface-solid-2')||'#1c1c1c';
const L=(h=>{const m=h.match(/[\da-f]{2}/gi);return m?m.slice(0,3).map(x=>parseInt(x,16)).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0)/255:0})(v('--bg-solid')),lightTheme=L>.6;
const parse=c=>{const m=c.match(/[\d.]+/g);return m?m.map(Number):null};
const blue=c=>{const p=parse(c);if(!p)return 0;const[r,g,b,a=1]=p;return a>.15&&b>r+18&&b>=g&&b<190};
const dark=c=>{const p=parse(c);if(!p)return 0;const[r,g,b,a=1]=p;return lightTheme&&a>.3&&(r+g+b)/3<90};
const light=c=>{const p=parse(c);if(!p)return 0;const[r,g,b,a=1]=p;return a>.5&&r>150&&g>150&&b>150&&Math.max(r,g,b)-Math.min(r,g,b)<30};
const bad=c=>blue(c)||dark(c);
const seen=new WeakSet(),q=[];
const fix=el=>{if(seen.has(el))return;seen.add(el);const s=getComputedStyle(el),bg=s.backgroundColor,bi=s.backgroundImage;
 if(bi!=='none'&&bi.includes('gradient')&&!bi.includes('url(')&&(bi.match(/rgba?\([^)]*\)/g)||[]).some(bad))el.style.setProperty('background',S2,'important');
 else if(bad(bg))el.style.setProperty('background-color',S,'important');
 else if(light(bg)&&el.matches('a,button,[role=button]')&&el.offsetWidth<300){el.style.setProperty('background',S2,'important');el.style.setProperty('color','var(--acc)','important')}};
// only elements that can carry a box background; skip text-level noise
const SEL='div,a,section,header,footer,span[class],button,li,td,th';
let running=0;
const pump=dl=>{while(q.length&&dl.timeRemaining()>2){const el=q.pop();if(el.isConnected)fix(el)}running=q.length?(idle(pump),1):0};
const enqueue=root=>{if(root.nodeType!==1)return;if(root.matches(SEL))q.push(root);root.querySelectorAll(SEL).forEach(e=>q.push(e));if(!running){running=1;idle(pump)}};
const go=()=>{enqueue(document.body);let pend=[],t;new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)pend.push(n);clearTimeout(t);t=setTimeout(()=>{pend.splice(0).forEach(enqueue)},400)}).observe(document.body,{childList:true,subtree:true})};
document.readyState==='loading'?addEventListener('DOMContentLoaded',go,{once:true}):go();
})();
