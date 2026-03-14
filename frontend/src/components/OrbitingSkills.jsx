import { useState, useEffect, useRef } from 'react';

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

/**
 * Returns the Devicon slug for a given skill name
 * @param {string} name - Skill name
 * @returns {string|null} Devicon slug or null
 */
function getDeviconSlug(name) {
  return deviconMap[name] || null;
}

/**
 * Renders a single skill badge at specific coordinates
 * @param {string} skill - Skill name 
 * @param {number} x - Absolute x position within container
 * @param {number} y - Absolute y position within container
 * @param {number} size - Square size of the badge
 */
function SkillBadge({ skill, x, y, size }) {
  const [hovered, setHovered] = useState(false);
  const slug = getDeviconSlug(skill);

  return (
    <div
      className="absolute z-10 flex flex-col items-center"
      style={{
        width: size,
        height: size,
        top: y - size / 2,
        left: x - size / 2,
        transition: 'transform 0.2s',
        transform: hovered ? 'scale(1.3)' : 'scale(1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-full h-full rounded-full bg-gray-800/90 backdrop-blur-sm border border-white/10 flex items-center justify-center p-1.5 cursor-pointer"
        style={{ boxShadow: hovered ? `0 0 20px rgba(96,165,250,0.4)` : undefined }}
      >
        {slug ? (
          <DevIcon slug={slug} name={skill} />
        ) : (
          <span className="text-[9px] font-bold text-white/80 text-center leading-tight">
            {skill.slice(0, 3).toUpperCase()}
          </span>
        )}
      </div>
      {hovered && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gray-900 border border-white/10 rounded text-[10px] text-white whitespace-nowrap z-50">
          {skill}
        </div>
      )}
    </div>
  );
}

function OrbitingSkills({ skills = [] }) {
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [size, setSize] = useState(460); // default non-zero fallback
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  // Robust size measurement
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const s = Math.min(rect.width, rect.height);
      // Only set size if we have a real measurement (avoids 0-size initialization collapse)
      if (s > 100) setSize(s);
    };

    measure();
    // Fire measurements at various stages of layout settling
    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 200);

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
    };
  }, []);

  // Animation loop logic
  useEffect(() => {
    if (isPaused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    
    let last = performance.now();
    const loop = (now) => {
      setTime(t => t + (now - last) / 1000);
      last = now;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused]);

  const capped = (skills || []).slice(0, 12);
  const innerSkills = capped.slice(0, 4);
  const outerSkills = capped.slice(4);

  // Proportional orbit math
  const INNER_R = size * 0.24;
  const OUTER_R = size * 0.40;
  const CENTER = size / 2;

  if (!skills || skills.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full mx-auto"
      style={{ 
        height: `${size}px`, 
        minHeight: '400px',
        maxWidth: '520px' 
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Orbit paths visualization */}
      {[{ r: INNER_R, color: 'cyan' }, { r: OUTER_R, color: 'purple' }].map(({ r, color }) => (
        <div
          key={r}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: r * 2,
            height: r * 2,
            top: CENTER - r,
            left: CENTER - r,
            border: `1px solid ${color === 'cyan' ? 'rgba(6,182,212,0.3)' : 'rgba(147,51,234,0.3)'}`,
            boxShadow: color === 'cyan'
              ? '0 0 30px rgba(6,182,212,0.15), inset 0 0 30px rgba(6,182,212,0.08)'
              : '0 0 40px rgba(147,51,234,0.2), inset 0 0 40px rgba(147,51,234,0.1)',
          }}
        />
      ))}

      {/* Central code branding node */}
      <div
        className="absolute rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center z-10"
        style={{
          width: 64,
          height: 64,
          top: CENTER - 32,
          left: CENTER - 32,
          boxShadow: '0 0 20px rgba(96,165,250,0.4)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#cg)" strokeWidth="2" strokeLinecap="round">
          <defs>
            <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>
          </defs>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>

      {/* Dynamic Inner orbit badges */}
      {innerSkills.map((skill, i) => {
        const angle = time * 0.5 + (i * (2 * Math.PI / innerSkills.length));
        const x = CENTER + Math.cos(angle) * INNER_R;
        const y = CENTER + Math.sin(angle) * INNER_R;
        return <SkillBadge key={skill} skill={skill} x={x} y={y} size={46} />;
      })}

      {/* Dynamic Outer orbit badges */}
      {outerSkills.map((skill, i) => {
        const angle = -time * 0.35 + (i * (2 * Math.PI / outerSkills.length));
        const x = CENTER + Math.cos(angle) * OUTER_R;
        const y = CENTER + Math.sin(angle) * OUTER_R;
        return <SkillBadge key={skill} skill={skill} x={x} y={y} size={50} />;
      })}
    </div>
  );
}

export default OrbitingSkills;

