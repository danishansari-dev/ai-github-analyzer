import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Home page — the landing page for the AI GitHub Analyzer.
 * Contains a hero section, "how it works" steps, and a sample preview
 * to visually communicate to visitors what the tool does before they use it.
 */
function Home() {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    /**
     * Navigates the user to the results page when the form is submitted.
     * We trim whitespace to prevent accidental empty submissions.
     */
    const handleAnalyze = (e) => {
        e.preventDefault();
        if (username.trim()) {
            navigate(`/results/${username.trim()}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* ===== HERO SECTION ===== */}
            <section className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden">
                {/* Gradient background orbs for visual depth — purely decorative */}
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px]" />

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Powered by Claude AI
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        Analyze Your GitHub.
                        <br />
                        Impress Every Recruiter.
                    </h1>

                    <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Enter any GitHub username to get your tech stack analysis, job role fit score, and AI-generated resume bullets.
                    </p>

                    {/* Search form */}
                    <form onSubmit={handleAnalyze} className="mt-10 flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
                        <input
                            id="github-username-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter GitHub username..."
                            className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        />
                        <button
                            id="analyze-button"
                            type="submit"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 cursor-pointer whitespace-nowrap"
                        >
                            Analyze →
                        </button>
                    </form>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="py-24 px-4 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        How It Works
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
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
                                desc: 'Claude AI analyzes your repos, READMEs, languages, and project structures.',
                            },
                            {
                                step: '03',
                                icon: '📊',
                                title: 'Get Your Report',
                                desc: 'Receive your tech stack analysis, role fit score, and resume bullets — ready to copy.',
                            },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className="group relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
                            >
                                <span className="text-xs font-mono text-gray-600 mb-4 block">{item.step}</span>
                                <span className="text-4xl block mb-4">{item.icon}</span>
                                <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
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
                        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['Python', 'React', 'TypeScript', 'FastAPI', 'Docker'].map((tech) => (
                                    <span key={tech} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['Machine Learning', 'Web Dev'].map((domain) => (
                                    <span key={domain} className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm border border-violet-500/20">
                                        {domain}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Role Fit Preview */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
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
                                        <div className="w-full h-2 rounded-full bg-white/5">
                                            <div
                                                className={`h-full rounded-full ${item.score > 70 ? 'bg-blue-500' : 'bg-gray-600'}`}
                                                style={{ width: `${item.score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resume Bullets Preview */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Resume Bullets</h3>
                            <ul className="space-y-3">
                                {[
                                    'Built a real-time ML pipeline using PyTorch, processing 50K+ images with 94% accuracy',
                                    'Developed a FastAPI backend serving 10K daily requests with sub-100ms latency',
                                ].map((bullet, i) => (
                                    <li key={i} className="text-sm text-gray-300 pl-4 border-l-2 border-blue-500/40 leading-relaxed">
                                        {bullet}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="py-8 px-4 border-t border-white/5 text-center text-gray-500 text-sm">
                Built with FastAPI, Claude AI, and React.
            </footer>
        </div>
    );
}

export default Home;
