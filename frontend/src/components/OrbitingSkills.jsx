import { useState, useEffect, useRef, useMemo } from 'react';

const SKILL_COLORS = {
    'JavaScript': { color: '#F7DF1E', textColor: '#000000', abbrev: 'JS' },
    'TypeScript': { color: '#3178C6', textColor: '#FFFFFF', abbrev: 'TS' },
    'Python': { color: '#3776AB', textColor: '#FFFFFF', abbrev: 'PY' },
    'React': { color: '#61DAFB', textColor: '#0B1120', abbrev: 'RC' },
    'Vue': { color: '#42B883', textColor: '#FFFFFF', abbrev: 'VU' },
    'Node.js': { color: '#339933', textColor: '#FFFFFF', abbrev: 'ND' },
    'HTML': { color: '#E34F26', textColor: '#FFFFFF', abbrev: 'HT' },
    'CSS': { color: '#1572B6', textColor: '#FFFFFF', abbrev: 'CS' },
    'Tailwind': { color: '#06B6D4', textColor: '#FFFFFF', abbrev: 'TW' },
    'Go': { color: '#00ADD8', textColor: '#FFFFFF', abbrev: 'GO' },
    'Rust': { color: '#CE422B', textColor: '#FFFFFF', abbrev: 'RS' },
    'Java': { color: '#ED8B00', textColor: '#FFFFFF', abbrev: 'JV' },
    'C++': { color: '#00599C', textColor: '#FFFFFF', abbrev: 'C+' },
    'Docker': { color: '#2496ED', textColor: '#FFFFFF', abbrev: 'DK' },
    'Git': { color: '#F05032', textColor: '#FFFFFF', abbrev: 'GT' },
    'Jupyter Notebook': { color: '#F37626', textColor: '#FFFFFF', abbrev: 'JN' },
    'Shell': { color: '#89E051', textColor: '#000000', abbrev: 'SH' },
    'Ruby': { color: '#CC342D', textColor: '#FFFFFF', abbrev: 'RB' },
    'PHP': { color: '#777BB4', textColor: '#FFFFFF', abbrev: 'PH' },
    'Swift': { color: '#FA7343', textColor: '#FFFFFF', abbrev: 'SW' },
    'Kotlin': { color: '#A97BFF', textColor: '#FFFFFF', abbrev: 'KT' },
    'Dart': { color: '#00B4AB', textColor: '#FFFFFF', abbrev: 'DT' },
    'Scala': { color: '#DC322F', textColor: '#FFFFFF', abbrev: 'SC' },
    'R': { color: '#276DC3', textColor: '#FFFFFF', abbrev: 'R' },
    'SCSS': { color: '#CC6699', textColor: '#FFFFFF', abbrev: 'SC' }
};

const FALLBACK_COLOR = '#60a5fa'; // blue-400



const deviconMap = {
  "JavaScript": "javascript",
  "TypeScript": "typescript",
  "Python": "python",
  "Java": "java",
  "C": "c",
  "C++": "cplusplus",
  "C#": "csharp",
  "Go": "go",
  "Rust": "rust",
  "Ruby": "ruby",
  "PHP": "php",
  "Swift": "swift",
  "Kotlin": "kotlin",
  "Dart": "dart",
  "Scala": "scala",
  "R": "r",
  "MATLAB": "matlab",
  "Shell": "bash",
  "Bash": "bash",
  "PowerShell": "powershell",
  "HTML": "html5",
  "CSS": "css3",
  "SCSS": "sass",
  "Sass": "sass",
  "Less": "less",
  "React": "react",
  "Vue": "vuejs",
  "Angular": "angularjs",
  "Svelte": "svelte",
  "Node.js": "nodejs",
  "NodeJs": "nodejs",
  "Express": "express",
  "Django": "django",
  "Flask": "flask",
  "FastAPI": "fastapi",
  "Spring": "spring",
  "Laravel": "laravel",
  "Rails": "rails",
  "Docker": "docker",
  "Kubernetes": "kubernetes",
  "Git": "git",
  "GraphQL": "graphql",
  "MongoDB": "mongodb",
  "PostgreSQL": "postgresql",
  "MySQL": "mysql",
  "Redis": "redis",
  "Firebase": "firebase",
  "AWS": "amazonwebservices",
  "GCP": "googlecloud",
  "Azure": "azure",
  "Linux": "linux",
  "Ubuntu": "ubuntu",
  "Electron": "electron",
  "Jupyter Notebook": "jupyter",
  "Lua": "lua",
  "Perl": "perl",
  "Haskell": "haskell",
  "Elixir": "elixir",
  "Clojure": "clojure",
  "Erlang": "erlang",
  "OCaml": "ocaml",
  "F#": "fsharp",
  "Vite": "vitejs",
  "Tailwind": "tailwindcss",
  "Next.js": "nextjs",
  "Nuxt.js": "nuxtjs",
  "PyTorch": "pytorch",
  "TensorFlow": "tensorflow",
  "OpenCV": "opencv",
  "Pandas": "pandas",
  "NumPy": "numpy",
  "Unity": "unity",
  "Godot": "godot",
  "Solidity": "solidity",
  "WebAssembly": "wasm",
  "Zig": "zig",
  "CoffeeScript": "coffeescript",
  "Groovy": "groovy",
};

function DevIcon({ slug, name, color }) {
  const [src, setSrc] = useState(
    `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`
  );
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const fallbacks = [
    `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`,
    `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-plain.svg`,
    `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original-wordmark.svg`,
    `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-plain-wordmark.svg`,
  ];

  const handleError = () => {
    const next = fallbackIndex + 1;
    if (next < fallbacks.length) {
      setFallbackIndex(next);
      setSrc(fallbacks[next]);
    } else {
      setSrc(null); // triggers text fallback
    }
  };

  if (!src) {
    return (
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-[9px] font-bold text-white"
        style={{ backgroundColor: color + '33', border: `1px solid ${color}66` }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="w-full h-full object-contain p-1"
      onError={handleError}
    />
  );
}

function getSkillConfig(name) {
    const base = SKILL_COLORS[name] || {};
    const color = base.color || FALLBACK_COLOR;
    const textColor = base.textColor || '#FFFFFF';
    let abbrev = base.abbrev;

    if (!abbrev && typeof name === 'string' && name.length >= 2) {
        abbrev = name.slice(0, 2).toUpperCase();
    } else if (!abbrev) {
        abbrev = '??';
    }

    return { color, textColor, abbrev };
}

function OrbitingSkills({ skills }) {
    const [time, setTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const lastTimeRef = useRef(null);
    const frameRef = useRef(null);
    const containerRef = useRef(null);
    
    // Initialize with a reasonable default to prevent 0-radius on first frame
    const [dimensions, setDimensions] = useState({ width: 460, height: 460 });
    const [dimensionsReady, setDimensionsReady] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Use ResizeObserver to get accurate dimensions after paint
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
                setDimensions({ width, height });
                setDimensionsReady(true);
            }
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Derive radii relative to container size
    const minSide = Math.min(dimensions.width, dimensions.height);
    const INNER_RADIUS = minSide * 0.22;
    const OUTER_RADIUS = minSide * 0.38;

    const innerSkills = (skills || []).slice(0, 4);
    const outerSkills = (skills || []).slice(4, 12);
    const total = innerSkills.length + outerSkills.length;

    // Only compute items if we have dimensions (prevents stacking at 0,0)
    const items = useMemo(() => {
        if (!dimensionsReady) return [];
        
        return [...innerSkills.map((name, index) => {
            const radius = INNER_RADIUS;
            const speed = 0.4;
            const phaseStep = (2 * Math.PI) / (innerSkills.length || 1);
            const phaseShift = phaseStep * index;
            const size = Math.max(38, minSide * 0.08); // responsive size
            const config = getSkillConfig(name);
            const slug = deviconMap[name] || null;

            return {
                name, radius, speed, phaseShift, size, slug, ...config, index
            };
        }), ...outerSkills.map((name, index) => {
            const radius = OUTER_RADIUS;
            const speed = 0.18;
            const phaseStep = (2 * Math.PI) / (outerSkills.length || 1);
            const phaseShift = phaseStep * index;
            const size = Math.max(44, minSide * 0.1); // responsive size
            const config = getSkillConfig(name);
            const slug = deviconMap[name] || null;

            return {
                name, radius, speed, phaseShift, size, slug, ...config, index: index + innerSkills.length
            };
        })];
    }, [innerSkills, outerSkills, INNER_RADIUS, OUTER_RADIUS, dimensionsReady, minSide]);

    useEffect(() => {
        if (isPaused || total === 0 || !dimensionsReady) {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
            lastTimeRef.current = null;
            return;
        }

        const step = (timestamp) => {
            if (lastTimeRef.current == null) {
                lastTimeRef.current = timestamp;
            }
            const delta = (timestamp - lastTimeRef.current) / 1000;
            lastTimeRef.current = timestamp;

            setTime(prev => prev + delta);
            frameRef.current = requestAnimationFrame(step);
        };

        frameRef.current = requestAnimationFrame(step);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
            lastTimeRef.current = null;
        };
    }, [isPaused, total, dimensionsReady]);

    return (
        <div className="w-full h-full min-h-[420px] flex items-center justify-center relative overflow-hidden">
            <div
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Orbit rings */}
                {dimensionsReady && total > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                        {innerSkills.length > 0 && (
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] bg-radial-gradient(circle, transparent 70%, rgba(6,182,212,0.03) 100%)"
                                style={{
                                    width: INNER_RADIUS * 2,
                                    height: INNER_RADIUS * 2,
                                }}
                            />
                        )}

                        {outerSkills.length > 0 && (
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-500/20 shadow-[0_0_50px_rgba(236,72,153,0.1)] bg-radial-gradient(circle, transparent 70%, rgba(236,72,153,0.03) 100%)"
                                style={{
                                    width: OUTER_RADIUS * 2,
                                    height: OUTER_RADIUS * 2,
                                }}
                            />
                        )}
                    </div>
                )}

                {/* Central node - guaranteed center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center relative shadow-2xl border border-white/10 z-20">
                    <div className="absolute inset-0 rounded-full blur-xl animate-pulse bg-cyan-500/20" />
                    <svg width="32" height="32" viewBox="0 0 36 36" className="relative z-10">
                        <defs>
                            <linearGradient id="orbiting-skills-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                        <polyline
                            points="10,11 6,18 10,25"
                            fill="none"
                            stroke="url(#orbiting-skills-gradient)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <line
                            x1="15"
                            y1="11"
                            x2="21"
                            y2="25"
                            stroke="url(#orbiting-skills-gradient)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                        <polyline
                            points="26,11 30,18 26,25"
                            fill="none"
                            stroke="url(#orbiting-skills-gradient)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* Skill badges */}
                {items.map(item => {
                    const angle = time * item.speed + item.phaseShift;
                    const x = Math.cos(angle) * item.radius;
                    const y = Math.sin(angle) * item.radius;

                    const isHovered = hoveredIndex === item.index;
                    const scale = isHovered ? 1.25 : 1;
                    
                    // Centered positioning formula
                    const transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%)) scale(${scale})`;
                    const boxShadow = isHovered
                        ? `0 0 30px ${item.color}50, 0 0 60px ${item.color}25`
                        : '0 4px 12px rgba(0,0,0,0.5)';

                    return (
                        <button
                            type="button"
                            key={item.index}
                            aria-label={item.name}
                            className="absolute top-1/2 left-1/2 flex items-center justify-center rounded-full bg-gray-900/90 backdrop-blur-md cursor-pointer transition-all duration-300 border border-white/10 z-10"
                            style={{
                                width: `${item.size}px`,
                                height: `${item.size}px`,
                                transform,
                                boxShadow,
                                borderColor: isHovered ? `${item.color}80` : 'rgba(255,255,255,0.1)'
                            }}
                            onMouseEnter={() => setHoveredIndex(item.index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="flex items-center justify-center relative w-full h-full p-2">
                                {item.slug ? (
                                    <DevIcon slug={item.slug} name={item.name} color={item.color} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <div
                                            className="w-2 h-2 rounded-full mb-1"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span
                                            className="text-[8px] font-black uppercase tracking-tighter"
                                            style={{ color: item.textColor }}
                                        >
                                            {item.abbrev}
                                        </span>
                                    </div>
                                )}

                                {isHovered && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-950/95 border border-white/10 rounded-lg text-xs font-bold text-white whitespace-nowrap pointer-events-none z-50 shadow-2xl animate-in fade-in zoom-in duration-200">
                                        {item.name}
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default OrbitingSkills;

