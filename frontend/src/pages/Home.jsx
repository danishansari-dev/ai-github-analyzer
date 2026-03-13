import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingParticlesBackground from '../components/FloatingParticlesBackground';
import { renderCanvas } from '../components/ui/canvas';

// Use production API URL if available, else fallback to empty string (Vite proxy)
const apiUrl = import.meta.env.VITE_API_URL || '';

/**
 * Home page — the landing page for the AI GitHub Analyzer.
 * Contains a hero section with roast mode toggle, live counter,
 * "how it works" steps, and a sample preview.
 */
function Home() {
    const [username, setUsername] = useState('');
    const [isRoastMode, setIsRoastMode] = useState(false);
    const [totalAnalyzed, setTotalAnalyzed] = useState(0);
    const [displayAnalyzed, setDisplayAnalyzed] = useState(0);
    const [totalVisitors, setTotalVisitors] = useState(0);
    const [displayVisitors, setDisplayVisitors] = useState(0);
    const navigate = useNavigate();

    /**
     * Fetches the total analysis count and visitor count from the backend on mount,
     * then kicks off a count-up animation from 0 to the real values.
     */
    useEffect(() => {
        fetch(`${apiUrl}/api/stats`)
            .then(r => r.json())
            .then(data => {
                if (data.total_analyzed) {
                    setTotalAnalyzed(data.total_analyzed);
                }
                if (data.total_visitors) {
                    setTotalVisitors(data.total_visitors);
                }
            })
            .catch(() => {
                // Silently fail — counter is cosmetic, not critical
            });
    }, []);

    // Animate the counters from 0 over ~1.5 seconds
    useEffect(() => {
        if (totalAnalyzed === 0 && totalVisitors === 0) return;

        const duration = 1500;
        const steps = 40;
        const incrementAnalyzed = totalAnalyzed / steps;
        const incrementVisitors = totalVisitors / steps;
        let currentAnalyzed = 0;
        let currentVisitors = 0;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            currentAnalyzed = Math.min(Math.round(incrementAnalyzed * step), totalAnalyzed);
            currentVisitors = Math.min(Math.round(incrementVisitors * step), totalVisitors);

            setDisplayAnalyzed(currentAnalyzed);
            setDisplayVisitors(currentVisitors);

            if (step >= steps) clearInterval(timer);
        }, duration / steps);

        return () => clearInterval(timer);
    }, [totalAnalyzed, totalVisitors]);

    // Initialize hero canvas trailing-lines effect
    useEffect(() => {
        renderCanvas();
    }, []);

    /**
     * Navigates the user to the results page when the form is submitted.
     * Appends ?mode=roast if roast mode is enabled.
     */
    const handleAnalyze = (e) => {
        e.preventDefault();
        if (username.trim()) {
            const path = `/results/${username.trim()}${isRoastMode ? '?mode=roast' : ''}`;
            navigate(path);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#0a0a0f] text-white">
            {/* Interactive Background */}
            <FloatingParticlesBackground 
                particleCount={70}
                particleColor="#60a5fa"
                mouseGravity="repel"
                glowIntensity={8}
                backgroundColor="transparent"
            />

            <div className="relative z-10">
                {/* ===== HERO SECTION ===== */}
                <section className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden">
                {/* Gradient background orbs for visual depth — purely decorative */}
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px]" />

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        See What Your Code Says
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            About You.
                        </span>
                    </h1>

                    <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Enter any GitHub username to get your tech stack analysis, career role fit across 50+ roles, and GitHub stats dashboard.
                    </p>

                    {/* Live counters — animates from 0 on page load */}
                    {(totalAnalyzed > 0 || totalVisitors > 0) && (
                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm font-medium tracking-wide">
                            {totalVisitors > 0 && (
                                <p className="text-gray-400">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block mr-1.5" />
                                    {displayVisitors.toLocaleString()} developers visited
                                </p>
                            )}
                            {totalAnalyzed > 0 && (
                                <p className="text-gray-500">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block mr-1.5" />
                                    {displayAnalyzed.toLocaleString()} profiles analyzed
                                </p>
                            )}
                        </div>
                    )}

                    {/* Search form */}
                    <form onSubmit={handleAnalyze} className="mt-8 max-w-lg w-full mx-auto">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 p-1.5">
                            <input
                                id="github-username-input"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter GitHub username..."
                                className="bg-transparent flex-1 px-4 py-2 text-sm md:text-base text-white placeholder-gray-500 outline-none"
                            />
                            <button
                                id="analyze-button"
                                type="submit"
                                className="rounded-full px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm md:text-base transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 cursor-pointer whitespace-nowrap"
                            >
                                Analyze →
                            </button>
                        </div>
                    </form>

                    {/* Roast Mode toggle */}
                    <div className="mt-5 flex items-center justify-center gap-3">
                        <span className={`text-sm transition-colors ${!isRoastMode ? 'text-gray-200 font-medium' : 'text-gray-600'}`}>Normal</span>
                        <button
                            type="button"
                            onClick={() => setIsRoastMode(!isRoastMode)}
                            className={`relative w-16 h-8 rounded-full border transition-colors duration-300 cursor-pointer ${isRoastMode ? 'bg-orange-500/90 border-orange-400' : 'bg-white/10 border-white/20'
                                }`}
                            aria-label="Toggle roast mode"
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-7 h-7 rounded-full bg-white shadow-md transition-transform duration-300 ${isRoastMode ? 'translate-x-8' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                        <span className={`text-sm transition-colors flex items-center gap-1 ${isRoastMode ? 'text-orange-400 font-semibold' : 'text-gray-600'}`}>
                            <span>🔥</span>
                            <span>Roast Me</span>
                        </span>
                    </div>
                    <canvas
                        className="pointer-events-none absolute inset-0 mx-auto"
                        id="canvas"
                    />
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="py-24 px-4 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        How It Works
                    </h2>

                    <div className="relative">
                        <div className="hidden md:block absolute inset-x-8 top-1/2 -translate-y-1/2 border-t border-dashed border-white/10 pointer-events-none" />
                        <div className="grid md:grid-cols-3 gap-8 relative">
                        {[
                            {
                                step: '01',
                                icon: '🔍',
                                title: 'Enter Your Username',
                                desc: 'Just type your GitHub username. No sign-in, no permissions, no OAuth required.',
                            },
                            {
                                step: '02',
                                icon: '🤖',
                                title: 'AI Reads Your Code',
                                desc: 'Groq AI analyzes your repos, READMEs, languages, and project structures.',
                            },
                            {
                                step: '03',
                                icon: '📊',
                                title: 'Get Your Report',
                                desc: 'Receive your tech stack analysis, career match scores, and GitHub stats — shareable in one click.',
                            },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className="group relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:-translate-y-1 hover:border-white/20 transition-all duration-300 overflow-hidden"
                            >
                                <span className="text-5xl font-black text-white/5 absolute top-3 right-4 select-none">
                                    {item.step}
                                </span>
                                <span className="text-xs font-mono text-gray-500 mb-4 block relative z-10">{item.step}</span>
                                <span className="text-4xl block mb-4">{item.icon}</span>
                                <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SAMPLE PREVIEW ===== */}
            {/* Show realistic fake data so visitors understand the output before trying */}
            <section className="py-24 px-4 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        What You'll Get
                    </h2>
                    <p className="text-gray-400 text-center mb-16 text-lg">A sneak peek at your personalized analysis report.</p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Stack Analysis Preview */}
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/5/5 bg-white/5 backdrop-blur-sm rounded-2xl">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['Python', 'React', 'TypeScript', 'FastAPI', 'Docker'].map((tech) => {
                                    const styles = {
                                        Python: { bg: '#FFD43B', color: '#000000' },
                                        React: { bg: '#61DAFB', color: '#0B1120' },
                                        TypeScript: { bg: '#3178C6', color: '#FFFFFF' },
                                        FastAPI: { bg: '#059669', color: '#ECFDF5' },
                                        Docker: { bg: '#2496ED', color: '#E0F2FE' }
                                    }[tech] || { bg: '#1f2937', color: '#E5E7EB' };
                                    return (
                                        <span
                                            key={tech}
                                            className="px-3 py-1 rounded-full text-sm border border-white/20"
                                            style={{ backgroundColor: styles.bg, color: styles.color }}
                                        >
                                            {tech}
                                        </span>
                                    );
                                })}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['Machine Learning', 'Web Dev'].map((domain) => (
                                    <span key={domain} className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-sm border border-purple-500/30">
                                        {domain}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Role Fit Preview */}
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Role Fit</h3>
                            <div className="space-y-3">
                                {[
                                    { role: 'ML Engineer', score: 84 },
                                    { role: 'Backend Dev', score: 61 },
                                    { role: 'Full Stack', score: 48 },
                                ].map((item) => (
                                    <div key={item.role}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-300">{item.role}</span>
                                            <span className="text-gray-400">{item.score}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${item.score}%` }}
                                                aria-hidden="true"
                                                aria-label={`${item.role} ${item.score}%`}
                                                role="presentation"
                                                data-role={item.role}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Career Match Preview */}
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Career Match</h3>
                            <div className="space-y-3">
                                {[
                                    { role: 'Full Stack Dev', score: 92, color: 'bg-blue-500' },
                                    { role: 'ML Engineer', score: 84, color: 'bg-violet-500' },
                                    { role: 'Cloud Engineer', score: 71, color: 'bg-cyan-500' },
                                ].map((item) => (
                                    <div key={item.role}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-300">{item.role}</span>
                                            <span className="text-gray-400">{item.score}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${item.score}%`,
                                                    backgroundImage:
                                                        item.color === 'bg-blue-500'
                                                            ? 'linear-gradient(to right, #3b82f6, #22d3ee)'
                                                            : item.color === 'bg-violet-500'
                                                            ? 'linear-gradient(to right, #8b5cf6, #ec4899)'
                                                            : 'linear-gradient(to right, #06b6d4, #22c55e)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="py-8 px-4 border-t border-white/5 text-center text-gray-500 text-sm">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <span className="flex items-center gap-2">
                        <span className="border border-white/10 rounded px-2 py-0.5 text-xs hover:border-white/30 transition-colors cursor-pointer">
                            FastAPI
                        </span>
                        <span className="border border-white/10 rounded px-2 py-0.5 text-xs hover:border-white/30 transition-colors cursor-pointer">
                            Groq AI
                        </span>
                        <span className="border border-white/10 rounded px-2 py-0.5 text-xs hover:border-white/30 transition-colors cursor-pointer">
                            React
                        </span>
                    </span>
                    <a
                        href="https://github.com/danishansari-dev/ai-github-analyzer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-xs"
                    >
                        <span>View on GitHub</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.088 3.292 9.395 7.868 10.918.575.106.786-.25.786-.556 0-.274-.01-1.002-.016-1.967-3.199.696-3.874-1.542-3.874-1.542-.523-1.328-1.278-1.681-1.278-1.681-1.044-.714.079-.699.079-.699 1.155.081 1.763 1.187 1.763 1.187 1.027 1.761 2.695 1.253 3.352.958.104-.744.402-1.253.73-1.541-2.553-.29-5.236-1.276-5.236-5.68 0-1.255.45-2.281 1.187-3.086-.119-.291-.515-1.462.112-3.049 0 0 .967-.31 3.17 1.18a10.98 10.98 0 0 1 2.886-.388c.979.005 1.966.132 2.886.388 2.201-1.49 3.166-1.18 3.166-1.18.63 1.587.235 2.758.116 3.049.74.805 1.186 1.831 1.186 3.086 0 4.417-2.688 5.386-5.252 5.67.414.357.781 1.066.781 2.148 0 1.551-.014 2.801-.014 3.183 0 .309.207.668.792.554C20.213 21.39 23.5 17.084 23.5 12 23.5 5.648 18.352.5 12 .5z" />
                        </svg>
                    </a>
                </div>
            </footer>
            </div>
        </div>
    );
}

export default Home;
