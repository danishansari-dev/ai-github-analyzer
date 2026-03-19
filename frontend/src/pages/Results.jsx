import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import ProfileCard from '../components/ProfileCard';
import RepoShowcase from '../components/RepoShowcase';
import ResumeBullets from '../components/ResumeBullets';
import GitHubStats from '../components/GitHubStats';
import OrbitingSkills from '../components/OrbitingSkills';
import SpotlightCard from '../components/SpotlightCard';
import ScoreRing from '../components/ScoreRing';

// 90-second timeout so the loading screen never spins forever
const FETCH_TIMEOUT_MS = 90000;

// Use production API URL if available, else fallback to empty string (Vite proxy)
const apiUrl = import.meta.env.VITE_API_URL || '';

/**
 * Results page — Fetches analysis data from the backend for a given GitHub username
 * and renders the main result cards. Supports normal and roast modes, and includes
 * a shareable PNG card generator.
 */
function Results() {
    const { username: rawUsername } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const username = rawUsername ? String(rawUsername).split('#')[0].trim() : '';
    const mode = searchParams.get('mode') || 'normal';
    const isRoast = mode === 'roast';

    useEffect(() => {
        if (!username) navigate('/');
    }, [username, navigate]);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorCode, setErrorCode] = useState(null);
    const [toast, setToast] = useState(null);
    const [starRequired, setStarRequired] = useState(false);
    const [startTrigger, setStartTrigger] = useState(0);

    useEffect(() => {
        if (!username) {
            setLoading(false);
            return;
        }
        if (!localStorage.getItem('has_starred')) {
            setStarRequired(true);
            setLoading(false);
            return;
        }

        let isCancelled = false;

        const fetchAnalysis = async () => {
            setLoading(true);
            setError(null);
            setErrorCode(null);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

            try {
                const url = `${apiUrl}/api/analyze/${encodeURIComponent(username)}${isRoast ? '?mode=roast' : ''}`;
                const response = await fetch(url, { signal: controller.signal });

                clearTimeout(timeoutId);
                if (isCancelled) return;

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const apiMessage = errorData?.detail || null;

                    // Store the status code so the error UI can adapt
                    if (response.status === 404 || response.status === 422) {
                        setErrorCode(404);
                        throw new Error(apiMessage || `We couldn't find GitHub user '@${username}'. Check the spelling and try again.`);
                    } else if (response.status === 429) {
                        setErrorCode(429);
                        throw new Error(apiMessage || 'GitHub API rate limit exceeded. Please try again in about an hour.');
                    } else {
                        setErrorCode(response.status);
                        throw new Error(apiMessage || `Server error ${response.status}: ${response.statusText}`);
                    }
                }

                const result = await response.json();
                if (!isCancelled) {
                    setData(result);
                }
            } catch (err) {
                clearTimeout(timeoutId);
                if (!isCancelled) {
                    if (err.name === 'AbortError') {
                        setErrorCode(0);
                        setError('Analysis is taking too long. Please try again.');
                    } else {
                        setError(err.message || 'An unexpected error occurred.');
                    }
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        fetchAnalysis();
        return () => { isCancelled = true; };
    }, [username, isRoast, startTrigger]);

    const handleStarRepo = () => {
        window.open('https://github.com/danishansari-dev/ai-github-analyzer', '_blank');
        localStorage.setItem('has_starred', 'true');
        setStarRequired(false);
        setStartTrigger(prev => prev + 1);
    };

    const handleAlreadyStarred = () => {
        localStorage.setItem('has_starred', 'true');
        setStarRequired(false);
        setStartTrigger(prev => prev + 1);
    };

    const techStack = useMemo(() => {
        const primaryStack = data?.stack?.primary_stack || [];
        if (!primaryStack || primaryStack.length === 0) return [];
        
        // Deduplicate case-insensitively, preserve all items
        const seen = new Set();
        return primaryStack.filter(item => {
            const lower = item.toLowerCase();
            if (seen.has(lower)) return false;
            seen.add(lower);
            return true;
        });
    }, [data?.stack?.primary_stack]);

    if (!username) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-[60px] scroll-smooth transition-opacity duration-300">
            <style>
                {`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .print-card { 
                        background: white !important; 
                        border: 1px solid #e5e7eb !important; 
                        box-shadow: none !important;
                        break-inside: avoid;
                    }
                    .text-gray-400, .text-gray-500, .text-gray-600 { color: #4b5563 !important; }
                    .bg-white\\/\\[0\\.02\\], .bg-\\[\\#111111\\] { background: #f9fafb !important; }
                    .border-white\\/5, .border-\\[\\#1f1f1f\\] { border-color: #e5e7eb !important; }
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>

            <main className="w-full max-w-[1400px] mx-auto px-6 py-10 space-y-10">
                {loading && !error && <LoadingScreen />}

                {error && (
                    <div className="p-12 rounded-2xl bg-red-500/5 border border-red-500/20 text-center max-w-xl mx-auto">
                        <div className="text-5xl mb-6">
                            {errorCode === 404 ? '🔍' : errorCode === 429 ? '⏳' : '😞'}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {errorCode === 404 ? 'User Not Found' : errorCode === 429 ? 'Rate Limited' : 'Analysis Failed'}
                        </h2>
                        <p className="text-gray-400 mb-8">{error}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold transition-all"
                            >
                                ← Try Another
                            </button>
                            {errorCode !== 404 && (
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-gray-300 hover:bg-white/10 transition-all"
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {!loading && data && (
                    <div className="space-y-10 animate-in fade-in duration-500">

                        {/* NEW HERO LAYOUT: 2-Column */}
                        <div className="flex flex-col lg:flex-row gap-4 w-full">

                            {/* LEFT COLUMN — Profile Card, full height */}
                            <div className="lg:w-[40%]">
                                <SpotlightCard glowColor="blue" className="p-6 h-full print-card">
                                    <ProfileCard
                                        data={data}
                                        username={username}
                                        isRoast={isRoast}
                                        socialLinks={data?.social_links || {}}
                                    />
                                </SpotlightCard>
                            </div>

                            {/* RIGHT COLUMN — split into 2 rows */}
                            <div className="lg:w-[60%] flex flex-col gap-4">

                                {/* TOP ROW — Score Ring + Bio Summary side by side */}
                                <SpotlightCard glowColor="purple" className="p-6 bg-[#0f0f15]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl print-card">
                                    <div className="flex flex-col sm:flex-row items-center gap-6 h-full">

                                        {/* Score Ring - left side */}
                                        <div className="flex flex-col items-center gap-2 shrink-0" style={{ minWidth: '180px' }}>
                                            <p className="text-xs tracking-widest text-white/40 uppercase mb-1">Profile Score</p>
                                            <ScoreRing score={data.overall_score} />
                                        </div>

                                        {/* Bio Summary - fills the empty right space */}
                                        <div className="flex-1 flex flex-col justify-center gap-3">
                                            <p className="text-xs tracking-widest text-white/40 uppercase">Summary</p>
                                            {(() => {
                                                const summaryText = data?.summary
                                                    || data?.stack?.profile_summary
                                                    || data?.ai_summary
                                                    || data?.stack?.summary
                                                    || data?.analysis?.summary
                                                    || '';

                                                return summaryText ? (
                                                    <p className="text-sm text-white/65 italic leading-relaxed text-center sm:text-left">
                                                        {summaryText}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-white/25 italic">No summary available.</p>
                                                );
                                            })()}
                                        </div>

                                    </div>
                                </SpotlightCard>

                                {/* BOTTOM ROW — Orbiting Skills / Tech Stack */}
                                <SpotlightCard 
                                    glowColor="cyan" 
                                    className="p-2 flex items-center justify-center w-full flex-1 overflow-hidden bg-[#0f0f15]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl print-card"
                                    style={{ minHeight: '500px', height: '500px' }}
                                >
                                    <OrbitingSkills skills={techStack} />
                                </SpotlightCard>

                            </div>
                        </div>

                        {/* GitHub Statistics — full width */}
                        <div className="rounded-[2.5rem] bg-[#0f0f15]/80 backdrop-blur-xl border border-white/5 w-full p-10 overflow-hidden print-card hover:border-white/10 transition-all duration-500 shadow-2xl">
                            <GitHubStats username={username} userId={data?.github_user_id ?? data?.user_id ?? ''} />
                        </div>

                        {/* Top Repositories — full width below */}
                        <div className="rounded-[2.5rem] bg-[#0f0f15]/80 backdrop-blur-xl border border-white/5 w-full p-10 print-card hover:border-white/10 transition-all duration-500 shadow-2xl">
                            <RepoShowcase repos={data.top_repos} />
                        </div>

                        {/* Resume bullets section */}
                        {data?.resume_bullets?.length > 0 && (
                            <div className="rounded-[2.5rem] bg-[#0f0f15]/80 backdrop-blur-xl border border-white/5 h-full p-10 print-card hover:border-white/10 transition-all duration-500 shadow-2xl">
                                <ResumeBullets
                                    resume_bullets={data.resume_bullets}
                                    onCopy={() => {
                                        setToast('Copied to clipboard!');
                                        setTimeout(() => setToast(''), 2500);
                                    }}
                                />
                            </div>
                        )}

                    </div>
                )}
            </main>

            {/* STAR GATE OVERLAY */}
            {starRequired && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center p-12 rounded-[3rem] bg-[#0d0d12] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                            <div className="text-6xl mb-8 animate-bounce text-yellow-500 bg-yellow-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20">⭐</div>
                            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">One small step...</h2>
                            <p className="text-white/50 mb-10 text-lg leading-relaxed font-medium">
                                Star our repo to unlock this free premium analysis. It helps us keep the project alive!
                            </p>
                            <div className="space-y-4">
                                <button
                                    onClick={handleStarRepo}
                                    className="w-full py-5 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                                >
                                    ⭐ Star on GitHub
                                </button>
                                <button
                                    onClick={handleAlreadyStarred}
                                    className="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-white/40 font-bold hover:text-white/60 transition-all text-xs uppercase tracking-[0.2em]"
                                >
                                    I already starred it
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST */}
            {toast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                    ✅ {toast}
                </div>
            )}
        </div>
    );
}

export default Results;
