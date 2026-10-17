'use client';

import { useEffect, useRef } from 'react';

type Point = { x: number; y: number; z: number };

/** A projected, woven surface. This is expressive artwork, not a financial chart. */
export function FinancialSculpture({ mode, paused }: { mode: number; paused: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controls = useRef({ mode, paused });
  useEffect(() => { controls.current = { mode, paused }; }, [mode, paused]);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    let width = 0, height = 0, frame = 0, last = 0, time = 0, currentMode = controls.current.mode;
    let inView = true, visible = !document.hidden;
    let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = motion.matches;
    const tau = Math.PI * 2;

    function project(x: number, y: number, z: number, angle: number): Point {
      const tilt = 0.78 + pointerY * 0.16;
      const turnedX = x * Math.cos(angle) + z * Math.sin(angle);
      const turnedZ = -x * Math.sin(angle) + z * Math.cos(angle);
      const turnedY = y * Math.cos(tilt) - turnedZ * Math.sin(tilt);
      const depth = y * Math.sin(tilt) + turnedZ * Math.cos(tilt);
      const scale = Math.min(width, height) * 0.225 * (5.7 / (5.7 - depth));
      return { x: width * 0.5 + turnedX * scale, y: height * 0.49 + turnedY * scale, z: depth };
    }

    function draw() {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      const glow = context.createRadialGradient(width * .51, height * .48, 10, width * .51, height * .48, width * .43);
      glow.addColorStop(0, 'rgba(94, 146, 83, .085)');
      glow.addColorStop(.65, 'rgba(59, 100, 62, .035)');
      glow.addColorStop(1, 'rgba(59, 100, 62, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      const angle = -0.38 + Math.sin(time * .13) * .18 + pointerX * .22;
      const strands = width < 500 ? 62 : 92;
      const samples = width < 500 ? 112 : 160;
      const lines: { points: Point[]; depth: number; light: number }[] = [];
      for (let strand = 0; strand < strands; strand++) {
        const v = strand / strands * tau;
        const points: Point[] = [];
        let depth = 0;
        for (let sample = 0; sample <= samples; sample++) {
          const u = sample / samples * tau;
          const wave = Math.sin(u * 3 + time * .28) * .085;
          const twist = v + u * (0.75 + currentMode * .22) + time * .055;
          const tube = .49 + wave + Math.sin(currentMode * Math.PI / 2) * .13;
          const radius = 1.23 + tube * Math.cos(twist);
          const bend = Math.sin(u * 2) * .22 * currentMode;
          const point = project(
            radius * Math.cos(u),
            radius * Math.sin(u) * (1.05 - currentMode * .08),
            tube * Math.sin(twist) + bend,
            angle,
          );
          depth += point.z;
          points.push(point);
        }
        lines.push({ points, depth: depth / samples, light: (.5 + .5 * Math.sin(v + .4)) });
      }
      lines.sort((a, b) => a.depth - b.depth);
      context.lineJoin = 'round';
      for (const line of lines) {
        const light = line.light;
        context.strokeStyle = `rgba(${Math.round(94 + 121 * light)}, ${Math.round(133 + 99 * light)}, ${Math.round(79 + 95 * light)}, ${.2 + light * .5})`;
        context.lineWidth = .55 + light * .55;
        context.beginPath();
        line.points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
        context.stroke();
      }
      // Sparse cross fibers give the continuous form a woven, dimensional surface.
      context.strokeStyle = 'rgba(177, 209, 151, .12)';
      context.lineWidth = .6;
      for (let sample = 0; sample < samples; sample += 5) {
        context.beginPath();
        for (let strand = 0; strand <= strands; strand++) {
          const point = lines[strand % strands].points[sample];
          // Each point is rendered independently: no false connections after depth sorting.
          context.moveTo(point.x, point.y);
          context.lineTo(point.x + .8, point.y + .8);
        }
        context.stroke();
      }
      element?.setAttribute('data-rendered', 'true');
    }

    function animate(now: number) {
      frame = 0;
      if (!inView || !visible) return;
      if (now - last >= 1000 / 30) {
        const delta = Math.min((now - last) / 1000, .06);
        last = now;
        const moving = !controls.current.paused && !reduced;
        if (moving) time += delta;
        const changing = Math.abs(controls.current.mode - currentMode) > .001;
        currentMode += (controls.current.mode - currentMode) * (reduced ? 1 : .07);
        pointerX += ((moving ? targetX : 0) - pointerX) * .05;
        pointerY += ((moving ? targetY : 0) - pointerY) * .05;
        if (moving || changing) draw();
        else if (currentMode !== controls.current.mode) { currentMode = controls.current.mode; draw(); }
      }
      frame = requestAnimationFrame(animate);
    }
    function restart() { if (!frame && visible && inView) { last = performance.now(); frame = requestAnimationFrame(animate); } }
    function resize() {
      const rect = element!.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      element!.width = Math.round(width * ratio); element!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(); restart();
    }
    function pointer(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return;
      const rect = element!.getBoundingClientRect();
      targetX = (event.clientX - rect.left) / rect.width - .5;
      targetY = (event.clientY - rect.top) / rect.height - .5;
    }
    function leave() { targetX = 0; targetY = 0; }
    function visibility() { visible = !document.hidden; restart(); }
    function preference() { reduced = motion.matches; draw(); restart(); }
    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; restart(); });
    resizeObserver.observe(element); intersectionObserver.observe(element);
    element.addEventListener('pointermove', pointer); element.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', visibility); motion.addEventListener('change', preference);
    resize();
    return () => {
      cancelAnimationFrame(frame); resizeObserver.disconnect(); intersectionObserver.disconnect();
      element.removeEventListener('pointermove', pointer); element.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', visibility); motion.removeEventListener('change', preference);
    };
    // The mounted renderer reads changing props through controls without resetting its animation.
  }, []);

  return <canvas className="aureli-sculpture" ref={canvas} aria-hidden="true" />;
}
