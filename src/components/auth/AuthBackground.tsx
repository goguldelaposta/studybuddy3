import { useEffect, useRef } from "react";

const ICONS = ['📚', '🎓', '💡', '🧠', '📐', '🔬', '✏️', '📝', '🎯', '⚡', '🌟', '📊', '🧪', '💻', '🤝'];
const PARTICLE_COUNT = 90;
const CONNECTION_DIST = 160;

export const AuthBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const mouse = { x: -9999, y: -9999 };

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);

    const colorPalette: [number, number, number][] = [
      [99, 102, 241], [16, 185, 129], [251, 191, 36], [168, 162, 255], [52, 211, 153],
    ];

    class Particle {
      x: number; y: number; vx: number; vy: number; r: number;
      color: [number, number, number]; alpha: number;
      pulseSpeed: number; pulseOffset: number; currentAlpha = 0;

      constructor() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.r = Math.random() * 2 + 1;
        this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        this.alpha = Math.random() * 0.5 + 0.3;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseOffset = Math.random() * Math.PI * 2;
      }

      update(t: number) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150 * 0.8;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
        this.vx *= 0.99; this.vy *= 0.99;
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0) this.x = W;
        if (this.x > W) this.x = 0;
        if (this.y < 0) this.y = H;
        if (this.y > H) this.y = 0;
        this.currentAlpha = this.alpha + Math.sin(t * this.pulseSpeed + this.pulseOffset) * 0.2;
      }

      draw() {
        const [r, g, b] = this.color;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r},${g},${b},${this.currentAlpha})`;
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r},${g},${b},${this.currentAlpha * 0.15})`;
        ctx!.fill();
      }
    }

    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    let frame = 0;
    let rafId: number;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => p.update(frame));
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
            const [r, g, b] = particles[i].color;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => p.draw());
      rafId = requestAnimationFrame(animate);
    };
    animate();

    // Floating icons
    const container = iconsRef.current;
    const spawnIcon = () => {
      if (!container) return;
      const el = document.createElement('span');
      el.style.cssText = `
        position: absolute;
        font-size: ${1.2 + Math.random() * 1.5}rem;
        left: ${Math.random() * 100}%;
        bottom: -10%;
        opacity: 0;
        filter: drop-shadow(0 0 12px rgba(99,102,241,0.4));
        animation: floatUp ${15 + Math.random() * 20}s linear forwards;
        pointer-events: none;
      `;
      el.textContent = ICONS[Math.floor(Math.random() * ICONS.length)];
      container.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    };

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 12; i++) {
      timers.push(setTimeout(spawnIcon, i * 2500));
    }
    const interval = setInterval(spawnIcon, 3000);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg) scale(0.6); opacity: 0; }
          8% { opacity: 0.7; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-110vh) rotate(360deg) scale(1.1); opacity: 0; }
        }
        @keyframes blobMove {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(80px, -60px) scale(1.15); }
          50% { transform: translate(-40px, 80px) scale(0.9); }
          75% { transform: translate(60px, 40px) scale(1.08); }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.07; }
        }
      `}</style>

      {/* Canvas particule */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'rgba(99,102,241,0.2)', filter:'blur(80px)', top:'-10%', left:'-5%', animation:'blobMove 20s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(16,185,129,0.18)', filter:'blur(80px)', bottom:'-10%', right:'-5%', animation:'blobMove 25s ease-in-out infinite', animationDelay:'-7s' }} />
        <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'rgba(251,191,36,0.12)', filter:'blur(80px)', top:'40%', left:'50%', animation:'blobMove 22s ease-in-out infinite', animationDelay:'-14s' }} />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage:'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)', backgroundSize:'80px 80px', animation:'gridPulse 8s ease-in-out infinite' }} />

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(99,102,241,0.15) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 80% 70%, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />

      {/* Floating icons */}
      <div ref={iconsRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden" />

      {/* Scanlines */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />

      {/* Dark overlay peste tot */}
      <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none" />
    </>
  );
};
