/** The approved artwork is conceptual: shapes and motion do not encode numerical proportions. */
/** @typedef {{style:'weave'|'orbit', mode:number, sequence:number, light:boolean, reduced:boolean}} ArtworkState */
/** @param {HTMLCanvasElement} canvas @param {ArtworkState} initial */
export function createLandingArtwork(canvas, initial) {
  const ctx=canvas.getContext('2d');
  if(!ctx)return {set(_next){},destroy(){}};
  const tau=Math.PI*2, config={detail:68};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const ease=n=>1-Math.pow(1-clamp(n,0,1),3);
  const mix=(a,b,t)=>a+(b-a)*t;
  let state={...initial},type=initial.style,isLight=initial.light;
  let weights=[0,0,0];weights[initial.mode]=1;
  let startWeights=weights.slice(),targetWeights=weights.slice();
  let width=0,height=0,scale=1,raf=0,started=0,lastFrame=0,time=3.6,progress=1,inView=true;
    const color = (light, alpha, warm = false) => isLight ? (warm ? `rgba(135,95,53,${alpha})` : `rgba(${Math.round(43+light*34)},${Math.round(71+light*42)},${Math.round(112+light*45)},${Math.min(1,alpha*1.3)})`) : warm ? `rgba(${Math.round(152 + light * 60)},${Math.round(124 + light * 56)},${Math.round(88 + light * 54)},${alpha})` : `rgba(${Math.round(92 + light * 126)},${Math.round(130 + light * 109)},${Math.round(78 + light * 103)},${alpha})`;

    function stroke(points, ink, thickness = .8) {
      if (!points.length) return;
      ctx.beginPath(); ctx.strokeStyle = ink; ctx.lineWidth = thickness;
      points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke();
    }
    function dot(x, y, radius, ink, glow = false) {
      if (glow) { ctx.shadowColor = ink; ctx.shadowBlur = 9; }
      ctx.beginPath(); ctx.arc(x, y, radius, 0, tau); ctx.fillStyle = ink; ctx.fill(); ctx.shadowBlur = 0;
    }
    function project(x, y, z, angle = -.35, tilt = .78) {
      const rx = x * Math.cos(angle) + z * Math.sin(angle);
      const rz = -x * Math.sin(angle) + z * Math.cos(angle);
      const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
      const depth = y * Math.sin(tilt) + rz * Math.cos(tilt);
      const perspective = 5.7 / (5.7 - depth);
      return { x: width * .52 + rx * scale * perspective, y: height * .49 + ry * scale * perspective, z: depth };
    }
    function cubic(p0, p1, p2, p3, t) {
      const a = 1 - t;
      return { x: a*a*a*p0.x + 3*a*a*t*p1.x + 3*a*t*t*p2.x + t*t*t*p3.x, y: a*a*a*p0.y + 3*a*a*t*p1.y + 3*a*t*t*p2.y + t*t*t*p3.y };
    }
    function stream(points, alpha, warm, offset, spread = .032) {
      if (alpha < .001) return;
      for (let fiber = 0; fiber < 10; fiber++) {
        const delta = (fiber - 4.5) * spread * height;
        const path = [];
        for (let k = 0; k <= 60; k++) {
          const p = cubic(...points, k / 60);
          path.push({x:p.x, y:p.y + Math.sin(k / 60 * Math.PI) * delta});
        }
        stroke(path, color(.7, alpha * (.12 + fiber / 50), warm), .65);
        for (let particle = 0; particle < 2; particle++) {
          const t = (time * .38 + particle * .5 + fiber * .027 + offset) % 1;
          const p = cubic(...points, t);
          dot(p.x, p.y + Math.sin(t * Math.PI) * delta, fiber % 3 === 0 ? 1.45 : .75, color(.96, alpha * .8, warm), fiber % 5 === 0);
        }
      }
    }
    function halo(cx, cy, radius, alpha = .15) {
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, isLight ? `rgba(95,143,194,${alpha})` : `rgba(185,225,145,${alpha})`);
      gradient.addColorStop(.32, isLight ? `rgba(95,143,194,${alpha * .4})` : `rgba(126,167,91,${alpha * .4})`);
      gradient.addColorStop(1, isLight ? 'rgba(95,143,194,0)' : 'rgba(126,167,91,0)');
      ctx.fillStyle = gradient; ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    }
    function retainedCore(alpha = 1) {
      const cx = width * .52, cy = height * .49;
      halo(cx, cy, scale * .65, .17 * alpha);
      for (let ring = 0; ring < 10; ring++) {
        const path = [];
        for (let s = 0; s <= 80; s++) {
          const t = s / 80 * tau;
          path.push(project(Math.cos(t) * (.14 + ring * .014), Math.sin(t) * (.14 + ring * .014), Math.sin(t * 2 + ring * .1) * .12));
        }
        stroke(path, color(.95, alpha * .45), .7);
      }
    }
    function weave() {
      const incoming = weights[1], surplus = weights[2], balance = weights[0];
      const lines = [];
      const strands = Math.round(config.detail);
      for (let strand = 0; strand < strands; strand++) {
        const v = strand / strands * tau;
        const points = []; let depth = 0;
        for (let sample = 0; sample <= 112; sample++) {
          const u = sample / 112 * tau;
          const twist = v + u * (.75 + incoming * .19) + time * .04;
          const tube = .45 + .07 * Math.sin(u * 3 + time * .28);
          const radius = 1.20 + tube * Math.cos(twist);
          const opening = surplus * Math.pow(Math.max(0, -Math.sin(u)), 2);
          const point = project(radius * Math.cos(u) * (1 + opening * .12) + incoming * .14,
            radius * Math.sin(u) * (1 - incoming * .08) - opening * .25,
            tube * Math.sin(twist) + opening * .48,
            -.38 + Math.sin(time * .24) * .12);
          points.push(point); depth += point.z;
        }
        lines.push({ points, depth, light: .5 + Math.sin(v + .4) * .5 });
      }
      lines.sort((a,b) => a.depth - b.depth);
      for (const line of lines) stroke(line.points, color(line.light, .2 + line.light * .49), .56 + line.light * .35);
      if (balance > .001) {
        for (let fiber = 0; fiber < 24; fiber++) {
          const path = [];
          for (let sample = 0; sample <= 90; sample++) {
            const u = sample / 90 * tau;
            const r = .72 + fiber * .006;
            path.push(project(r * Math.cos(u) - .28 * progress, r * Math.sin(u) + .26 * progress, -.35 + Math.sin(u * 2) * .18));
          }
          stroke(path, color(.8, balance * .28, true), .65);
        }
        retainedCore(balance);
      }
      for (let i = 0; i < 3; i++) stream([{x:width*.035,y:height*(.22 + i*.27)},{x:width*.2,y:height*(.17+i*.24)},{x:width*.27,y:height*.63},{x:width*.49,y:height*.58}], incoming, false, i * .2, .012);
      stream([{x:width*.5,y:height*.52},{x:width*.64,y:height*.71},{x:width*.76,y:height*.87},{x:width*.96,y:height*.82}], surplus, true, .2, .018);
      stream([{x:width*.46,y:height*.46},{x:width*.55,y:height*.22},{x:width*.74,y:height*.08},{x:width*.91,y:height*.12}], surplus, false, 0, .015);
      if (surplus > .001) halo(width*.68, height*.25, scale, surplus * .10);
    }
    function orbit() {
      const balance = weights[0], incoming = weights[1], surplus = weights[2];
      const expansion = 1 + surplus * .19;
      const count = Math.round(config.detail * .65);
      for (let ring = 0; ring < count; ring++) {
        const points = [], spin = ring / count * Math.PI;
        const radius = (1.1 + Math.sin(ring * .28) * .13) * expansion;
        for (let sample = 0; sample <= 100; sample++) {
          const u = sample / 100 * tau;
          const x = Math.cos(u) * radius, y = Math.sin(u) * radius;
          points.push(project(x * Math.cos(spin), y, x * Math.sin(spin), -.35 + time*.035, .55));
        }
        stroke(points, color(.45 + .5 * Math.sin(ring * .19), .22 + .12 * Math.sin(ring)), .65);
        const u = (time * .18 + ring * .618) % tau;
        const p = project(Math.cos(u) * radius * Math.cos(spin), Math.sin(u) * radius, Math.cos(u) * radius * Math.sin(spin), -.35 + time*.035, .55);
        dot(p.x,p.y,ring%6===0?2.1:.9,color(.94,.8),ring%6===0);
      }
      retainedCore(1);
      for (let ring = 0; ring < 14; ring++) {
        const points = [];
        for (let sample = 0; sample <= 80; sample++) {
          const u = sample / 80 * tau, r = .5 + ring * .009;
          points.push(project(Math.cos(u) * r - .65 * progress, Math.sin(u) * r + .36, -.4, .3, .95));
        }
        stroke(points,color(.7,balance * .36,true),.6);
      }
      for (let source = 0; source < 3; source++) {
        const start = source / 3 * tau - .3;
        for (let fiber = 0; fiber < 8; fiber++) {
          const points = [];
          for (let sample = 0; sample <= 90; sample++) {
            const t = sample / 90, radius = 1.8 * (1 - t) + .2;
            const angle = start + t * 2.3 + fiber*.025;
            points.push(project(Math.cos(angle)*radius,Math.sin(angle)*radius,Math.sin(angle*2)*.3));
          }
          stroke(points,color(.8,incoming*.3),.7);
          const t = (time*.35 + fiber*.04)%1, radius = 1.8*(1-t)+.2, angle = start+t*2.3+fiber*.025;
          const p = project(Math.cos(angle)*radius,Math.sin(angle)*radius,Math.sin(angle*2)*.3);
          if(incoming>.01) dot(p.x,p.y,1.7,color(1,incoming),true);
        }
      }
      stream([{x:width*.53,y:height*.52},{x:width*.63,y:height*.72},{x:width*.8,y:height*.88},{x:width*.96,y:height*.84}], surplus, true, .25, .012);
      if(surplus>.001) {
        halo(width*.53,height*.49,scale*1.6,surplus*.14);
        for(let i=0;i<60;i++) {
          const angle=i*2.39996,radius=scale*(.27+Math.sqrt(i/60)*.57);
          dot(width*.53+Math.cos(angle)*radius,height*.49+Math.sin(angle)*radius*.75,1,color(.9,surplus*.55));
        }
      }
    }

  function draw(){
    if(!width||!height)return;
    ctx.clearRect(0,0,width,height);ctx.lineJoin='round';ctx.lineCap='round';
    halo(width*.53,height*.49,Math.min(width,height)*.5,isLight?.045:.11);
    for(let ring=0;ring<2;ring++){
      ctx.save();ctx.translate(width*.52,height*.49);ctx.rotate(ring?-.45:.45);ctx.beginPath();
      ctx.ellipse(0,0,scale*1.9,scale*(.84+ring*.15),0,0,tau);ctx.strokeStyle=isLight?'#466a9824':'#c7dcab14';ctx.lineWidth=.7;ctx.stroke();ctx.restore();
    }
    if(type==='weave')weave();else orbit();
    canvas.dataset.rendered='true';canvas.dataset.style=type;canvas.dataset.mode=String(state.mode);
  }
  function settle(){cancelAnimationFrame(raf);raf=0;weights=targetWeights.slice();progress=1;time=3.6;canvas.dataset.animating='false';draw();}
  function tick(now){
    raf=0;
    if(!inView||document.hidden){settle();return;}
    if(now-lastFrame>=1000/30){
      const elapsed=(now-started)/1000;lastFrame=now;time=elapsed;progress=ease(elapsed/2.5);
      weights=startWeights.map((value,i)=>mix(value,targetWeights[i],ease(elapsed/1.05)));draw();
      if(elapsed>=3.6){settle();return;}
    }
    raf=requestAnimationFrame(tick);
  }
  function resize(){
    const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;
    width=box.width;height=box.height;scale=Math.min(width,height)*.29;
    config.detail=width<400?52:76;
    const ratio=Math.min(window.devicePixelRatio||1,1.75);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);draw();
  }
  function visibility(){if(document.hidden)settle();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
  const intersectionObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(!inView)settle();});intersectionObserver.observe(canvas);
  document.addEventListener('visibilitychange',visibility);canvas.dataset.animating='false';resize();
  return {
    /** @param {ArtworkState} next */
    set(next){
      const changed=next.style!==state.style||next.mode!==state.mode||next.sequence!==state.sequence;
      state={...next};type=next.style;isLight=next.light;
      if(changed){
        cancelAnimationFrame(raf);startWeights=weights.slice();targetWeights=[0,0,0];targetWeights[next.mode]=1;
        if(next.reduced||!inView||document.hidden){settle();return;}
        started=performance.now();lastFrame=0;progress=0;canvas.dataset.animating='true';raf=requestAnimationFrame(tick);
      }else if(next.reduced){settle();}else draw();
    },
    destroy(){cancelAnimationFrame(raf);resizeObserver.disconnect();intersectionObserver.disconnect();document.removeEventListener('visibilitychange',visibility);}
  };
}
