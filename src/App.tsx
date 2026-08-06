import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

interface GalleryImage {
  id: number;
  url: string;
  thumbnail: string;
  title: string;
  bgColor: string;
}

const IMAGES: GalleryImage[] = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  url: `https://picsum.photos/seed/gallery${i}/1200/800`,
  thumbnail: `https://picsum.photos/seed/gallery${i}/600/400`,
  title: `Image ${i + 1}`,
  bgColor: ['#1e1b4b', '#172554', '#064e3b', '#451a03', '#312e81', '#14532d'][i % 6]
}));

const fractalNoiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

// Fluffy SVG cloud — looks like a real cartoon cloud with soft shadow
const Cloud = ({ top, driftAnim, delay, scale, opacity }: any) => (
  <div
    className="absolute left-0 pointer-events-none"
    style={{
      top,
      opacity,
      animation: `${driftAnim} ${delay}`,
      transform: 'translateX(-420px)',
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 130"
      style={{ width: 320 * scale, height: 130 * scale, filter: 'drop-shadow(0px 12px 20px rgba(100,160,220,0.45))' }}
    >
      <defs>
        <radialGradient id={`cg-${driftAnim}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </radialGradient>
      </defs>
      {/* Shadow layer */}
      <ellipse cx="160" cy="118" rx="130" ry="14" fill="rgba(100,150,210,0.18)" />
      {/* Cloud body — multiple overlapping circles for fluffy look */}
      <circle cx="80"  cy="85"  r="42" fill={`url(#cg-${driftAnim})`} />
      <circle cx="130" cy="70"  r="55" fill={`url(#cg-${driftAnim})`} />
      <circle cx="190" cy="65"  r="58" fill={`url(#cg-${driftAnim})`} />
      <circle cx="245" cy="78"  r="42" fill={`url(#cg-${driftAnim})`} />
      <rect   x="80"   y="85"   width="165" height="30" fill={`url(#cg-${driftAnim})`} />
      {/* Extra top puffs */}
      <circle cx="160" cy="52"  r="38" fill={`url(#cg-${driftAnim})`} />
      {/* Bottom flat base — white fill to cover shadow at bottom */}
      <rect x="75" y="100" width="170" height="20" fill="#f0f9ff" rx="8" />
    </svg>
  </div>
);

const Butterfly = ({ path, duration, delay, top, scale, colors }: any) => {
  const id = useMemo(() => Math.random().toString(36).substr(2, 9), []);
  return (
    <div 
      className="absolute left-0 pointer-events-none z-[2]" 
      style={{
        top: top,
        animation: `${path} ${duration}s ${delay}s infinite linear`,
        transform: 'translateX(-20vw)'
      }}
    >
      <div className="relative w-16 h-16 flex justify-center items-center" style={{ transform: `scale(${scale})` }}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible absolute inset-0">
          <defs>
            <linearGradient id={`grad1-${id}`} x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="100%" stopColor={colors[1]} />
            </linearGradient>
            <linearGradient id={`grad2-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="100%" stopColor={colors[1]} />
            </linearGradient>
          </defs>
          <path className="wing-left" fill={`url(#grad1-${id})`} opacity="0.95" d="M50,50 C20,10 0,30 15,60 C10,80 30,100 45,85 C40,70 45,60 50,50 Z" />
          <path className="wing-right" fill={`url(#grad2-${id})`} opacity="0.95" d="M50,50 C80,10 100,30 85,60 C90,80 70,100 55,85 C60,70 55,60 50,50 Z" />
          <ellipse cx="50" cy="50" rx="1.5" ry="14" fill="#334155" />
          <circle cx="50" cy="34" r="2.5" fill="#334155" />
          <path d="M49,32 Q35,15 30,20 M51,32 Q65,15 70,20" stroke="#334155" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

const clusteredFlowers = [
  // Back Hill Clusters
  { id: 1, left: 20, bottom: 53, scale: 0.6, type: 'daisy', colorIndex: 0 },
  { id: 2, left: 22, bottom: 51, scale: 0.5, type: 'wild', colorIndex: 1 },
  { id: 3, left: 18, bottom: 50, scale: 0.55, type: 'daisy', colorIndex: 0 },
  { id: 4, left: 85, bottom: 50, scale: 0.65, type: 'daisy', colorIndex: 0 },
  { id: 5, left: 82, bottom: 48, scale: 0.5, type: 'wild', colorIndex: 2 },
  { id: 51, left: 87, bottom: 46, scale: 0.5, type: 'daisy', colorIndex: 0 },
  
  // Middle Hill Clusters
  { id: 6, left: 30, bottom: 38, scale: 0.8, type: 'daisy', colorIndex: 0 },
  { id: 7, left: 27, bottom: 35, scale: 0.7, type: 'wild', colorIndex: 0 },
  { id: 8, left: 33, bottom: 36, scale: 0.75, type: 'daisy', colorIndex: 0 },
  { id: 9, left: 75, bottom: 32, scale: 0.8, type: 'daisy', colorIndex: 0 },
  { id: 10, left: 72, bottom: 30, scale: 0.7, type: 'wild', colorIndex: 1 },
  { id: 101, left: 78, bottom: 28, scale: 0.75, type: 'daisy', colorIndex: 0 },

  // Front Hill Clusters
  { id: 11, left: 15, bottom: 13, scale: 1.1, type: 'daisy', colorIndex: 0 },
  { id: 12, left: 10, bottom: 10, scale: 0.9, type: 'wild', colorIndex: 2 },
  { id: 13, left: 18, bottom: 8, scale: 1.0, type: 'daisy', colorIndex: 0 },
  { id: 14, left: 45, bottom: 9, scale: 1.15, type: 'daisy', colorIndex: 0 },
  { id: 15, left: 48, bottom: 6, scale: 0.95, type: 'wild', colorIndex: 0 },
  { id: 16, left: 42, bottom: 5, scale: 1.0, type: 'daisy', colorIndex: 0 },
  { id: 17, left: 85, bottom: 18, scale: 1.2, type: 'daisy', colorIndex: 0 },
  { id: 18, left: 89, bottom: 14, scale: 1.0, type: 'wild', colorIndex: 1 },
  { id: 19, left: 81, bottom: 16, scale: 1.1, type: 'daisy', colorIndex: 0 },
];

const Grass = () => (
  <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-72 z-[1] pointer-events-none overflow-hidden">
    <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <filter id="noiseOverlay">
          <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="3" stitchTiles="stitch" result="noise"/>
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.1 0" in="noise" result="coloredNoise" />
          <feBlend mode="overlay" in="SourceGraphic" in2="coloredNoise" />
        </filter>
        
        <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a7c2f" />
          <stop offset="100%" stopColor="#2c4f1a" />
        </linearGradient>
        <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5c9c3a" />
          <stop offset="100%" stopColor="#36611e" />
        </linearGradient>
        <linearGradient id="hill3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6bb33f" />
          <stop offset="100%" stopColor="#437326" />
        </linearGradient>
      </defs>

      <g filter="url(#noiseOverlay)">
        {/* Back Hill */}
        <path d="M0,60 Q25,30 50,55 T100,45 L100,100 L0,100 Z" fill="url(#hill1)" />
        {/* Shadow/Edge highlights */}
        <path d="M0,60 Q25,30 50,55 T100,45" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
        <path d="M0,60 Q25,30 50,55 T100,45" stroke="rgba(0,0,0,0.15)" strokeWidth="4" fill="none" transform="translate(0,2)" />

        {/* Middle Hill */}
        <path d="M0,75 Q30,50 60,75 T100,60 L100,100 L0,100 Z" fill="url(#hill2)" />
        <path d="M0,75 Q30,50 60,75 T100,60" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
        <path d="M0,75 Q30,50 60,75 T100,60" stroke="rgba(0,0,0,0.15)" strokeWidth="4" fill="none" transform="translate(0,2)" />

        {/* Front Hill */}
        <path d="M0,100 Q20,70 50,90 T100,75 L100,100 L0,100 Z" fill="url(#hill3)" />
        <path d="M0,100 Q20,70 50,90 T100,75" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
        <path d="M0,100 Q20,70 50,90 T100,75" stroke="rgba(0,0,0,0.15)" strokeWidth="4" fill="none" transform="translate(0,2)" />
      </g>
    </svg>
    
    {/* Clustered Flowers */}
    {clusteredFlowers.map((f) => (
      <div 
        key={f.id} 
        className="absolute drop-shadow-md"
        style={{
          left: `${f.left}%`,
          bottom: `${f.bottom}%`,
          width: '32px',
          height: '32px',
          transform: `scale(${f.scale}) translateX(-50%)`,
          zIndex: Math.floor(100 - f.bottom)
        }}
      >
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 w-8 h-16 -z-10 overflow-visible">
           <path d={`M4,0 Q${Math.random() > 0.5 ? 8 : 0},8 4,16`} stroke="#166534" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>

        {f.type === 'daisy' ? (
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
            <g fill="#ffffff">
              <ellipse cx="50" cy="15" rx="8" ry="25" />
              <ellipse cx="50" cy="85" rx="8" ry="25" />
              <ellipse cx="15" cy="50" rx="25" ry="8" />
              <ellipse cx="85" cy="50" rx="25" ry="8" />
              <ellipse cx="25" cy="25" rx="15" ry="15" />
              <ellipse cx="75" cy="75" rx="15" ry="15" />
              <ellipse cx="75" cy="25" rx="15" ry="15" />
              <ellipse cx="25" cy="75" rx="15" ry="15" />
            </g>
            <circle cx="50" cy="50" r="14" fill="#facc15" />
          </svg>
        ) : (
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
            <g fill={['#fbcfe8', '#bfdbfe', '#fef08a'][f.colorIndex]}>
              <circle cx="50" cy="25" r="15" />
              <circle cx="50" cy="75" r="15" />
              <circle cx="25" cy="50" r="15" />
              <circle cx="75" cy="50" r="15" />
            </g>
            <circle cx="50" cy="50" r="10" fill="#ffffff" />
          </svg>
        )}
      </div>
    ))}
  </div>
);

export default function App() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    IMAGES.forEach(img => {
      const image = new Image();
      image.src = img.url;
    });
  }, []);

  const navigate = useCallback((dir: 'next' | 'prev') => {
    if (isAnimating || activeIndex === null) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 650);
    setActiveIndex(prev => {
      if (prev === null) return prev;
      if (dir === 'next') return (prev + 1) % IMAGES.length;
      return (prev - 1 + IMAGES.length) % IMAGES.length;
    });
  }, [isAnimating, activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowRight') navigate('next');
      if (e.key === 'ArrowLeft') navigate('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, navigate]);

  const getStyleForIndex = (index: number) => {
    if (activeIndex === null) return { display: 'none' };
    const diff = (index - activeIndex + IMAGES.length) % IMAGES.length;
    let role = 'hidden';
    if (diff === 0) role = 'center';
    else if (diff === IMAGES.length - 1) role = 'left';
    else if (diff === 1) role = 'right';
    else if (IMAGES.length > 3) role = 'back';

    const baseTransition = 'transform 650ms cubic-bezier(0.4, 0, 0.2, 1), filter 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 650ms cubic-bezier(0.4, 0, 0.2, 1), left 650ms cubic-bezier(0.4, 0, 0.2, 1)';
    const willChange = 'transform, filter, opacity';
    const scaleCenter = isMobile ? 1.2 : 1.4;
    const offsets = isMobile ? { left: '15%', right: '85%' } : { left: '20%', right: '80%' };

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      width: isMobile ? '55%' : '40%',
      aspectRatio: '3/2',
      transition: baseTransition,
      willChange,
      pointerEvents: 'auto',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    };

    switch (role) {
      case 'center': return { ...baseStyle, left: '50%', transform: `translate(-50%, -50%) scale(${scaleCenter})`, filter: 'blur(0px)', opacity: 1, zIndex: 20, cursor: 'zoom-in' };
      case 'left': return { ...baseStyle, left: offsets.left, transform: 'translate(-50%, -50%) scale(1)', filter: 'blur(2px)', opacity: 0.85, zIndex: 10, cursor: 'pointer' };
      case 'right': return { ...baseStyle, left: offsets.right, transform: 'translate(-50%, -50%) scale(1)', filter: 'blur(2px)', opacity: 0.85, zIndex: 10, cursor: 'pointer' };
      case 'back': return { ...baseStyle, left: '50%', transform: 'translate(-50%, -50%) scale(1)', filter: 'blur(4px)', opacity: 1, zIndex: 5 };
      default: return { ...baseStyle, display: 'none' };
    }
  };

  const currentBgColor = activeIndex !== null ? IMAGES[activeIndex].bgColor : '#111';

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100 text-slate-800 font-sans overflow-x-hidden">
      
      {/* Background Decorators */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 4 individually animated fluffy clouds with different speeds and delays */}
        <Cloud top="6%"   driftAnim="cloud-drift-1" delay="0s   linear infinite" scale={1.3}  opacity={1}   />
        <Cloud top="22%"  driftAnim="cloud-drift-2" delay="-18s linear infinite" scale={0.85} opacity={0.9} />
        <Cloud top="12%"  driftAnim="cloud-drift-3" delay="-8s  linear infinite" scale={1.1}  opacity={0.95}/>
        <Cloud top="30%"  driftAnim="cloud-drift-4" delay="-30s linear infinite" scale={0.65} opacity={0.8} />
      </div>

      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        <Butterfly path="flight-path-1" duration={12} delay={0} top="20%" scale={1.1} colors={['#f472b6', '#fbcfe8']} />
        <Butterfly path="flight-path-2" duration={15} delay={-5} top="40%" scale={0.8} colors={['#fde047', '#fef08a']} />
        <Butterfly path="flight-path-3" duration={10} delay={-2} top="10%" scale={1.3} colors={['#38bdf8', '#bae6fd']} />
        <Butterfly path="flight-path-1" duration={14} delay={-8} top="60%" scale={1.0} colors={['#a7f3d0', '#d1fae5']} />
        <Butterfly path="flight-path-2" duration={11} delay={-3} top="15%" scale={0.7} colors={['#fda4af', '#fecdd3']} />
        <Butterfly path="flight-path-3" duration={13} delay={-10} top="30%" scale={1.2} colors={['#d8b4fe', '#e9d5ff']} />
        <Grass />
      </div>

      {/* Content wrapper z-10 */}
      <div className="relative z-10 p-6 sm:p-8 md:p-16">
        <header className="mb-16 md:mb-24 text-center mt-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-fade-in-up">
            Explore The Frame
          </h1>
          <p className="text-slate-700 tracking-wide text-lg md:text-xl font-medium max-w-2xl mx-auto mt-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            A curated collection worth getting lost in
          </p>
        </header>

        {/* Part 1 — Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 max-w-7xl mx-auto pb-64">
          {IMAGES.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className="animate-fade-up-scale relative cursor-pointer rounded-2xl overflow-hidden aspect-[4/3] shadow-xl group transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] hover:ring-2 hover:ring-cyan-400/80 ring-1 ring-black/5 bg-white/50"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <img 
                src={img.thumbnail} 
                alt={img.title} 
                className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-110"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Part 2 — Lightbox (Untouched per requirement) */}
      {activeIndex !== null && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          <div 
            className="absolute inset-0 transition-colors duration-[650ms]"
            style={{ backgroundColor: currentBgColor, transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md pointer-events-auto" onClick={() => setActiveIndex(null)} />
          <div 
            className="absolute inset-0 pointer-events-none z-[5] opacity-40 mix-blend-overlay"
            style={{ backgroundImage: fractalNoiseSvg, backgroundSize: '200px 200px' }}
          />
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {IMAGES.map((img, idx) => {
              const diff = (idx - activeIndex + IMAGES.length) % IMAGES.length;
              return (
                <div 
                  key={img.id}
                  style={getStyleForIndex(idx)}
                  onClick={(e) => {
                    if (isAnimating) return;
                    if (diff === 1) navigate('next');
                    else if (diff === IMAGES.length - 1) navigate('prev');
                    else if (diff === 0) window.open(img.url, '_blank');
                    else e.stopPropagation();
                  }}
                >
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                </div>
              );
            })}
          </div>
          <div className="absolute inset-0 z-[60] pointer-events-none">
            <button onClick={() => setActiveIndex(null)} className="absolute top-6 right-6 p-2 rounded-full border border-white hover:bg-white/12 hover:scale-105 text-white transition-all duration-300 pointer-events-auto">
              <X size={24} />
            </button>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-4">
                <button onClick={(e) => { e.stopPropagation(); navigate('prev'); }} className="p-3 rounded-full border border-white hover:bg-white/12 hover:scale-105 text-white transition-all duration-300 pointer-events-auto">
                  <ArrowLeft size={26} strokeWidth={2.25} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate('next'); }} className="p-3 rounded-full border border-white hover:bg-white/12 hover:scale-105 text-white transition-all duration-300 pointer-events-auto">
                  <ArrowRight size={26} strokeWidth={2.25} />
                </button>
                <span className="ml-4 font-semibold uppercase tracking-wide text-white opacity-90 hidden sm:block font-sans">{IMAGES[activeIndex].title}</span>
              </div>
              <span className="text-sm font-semibold uppercase text-white opacity-80">{activeIndex + 1} / {IMAGES.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

