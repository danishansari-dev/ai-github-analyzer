import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import LoadingScreen from '../components/LoadingScreen';
import ProfileCard from '../components/ProfileCard';
import RoleScoreCard from '../components/RoleScoreCard';
import RepoShowcase from '../components/RepoShowcase';
import GitHubStats from '../components/GitHubStats';

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

    // URL can get a UUID hash fragment appended (e.g. "user#7392822e..."), strip it
    const username = rawUsername.split('#')[0].trim();
    const mode = searchParams.get('mode') || 'normal';
    const isRoast = mode === 'roast';

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    // Ref for the hidden share card that gets rendered to PNG
    const shareCardRef = useRef(null);

    useEffect(() => {
        let isCancelled = false;

        const fetchAnalysis = async () => {
            setLoading(true);
            setError(null);

            // AbortController used here specifically for the timeout mechanism
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

            try {
                // Pass mode to backend so roast mode gets the alternate prompts
                const url = `${apiUrl}/api/analyze/${encodeURIComponent(username)}${isRoast ? '?mode=roast' : ''}`;
                const response = await fetch(url, { signal: controller.signal });

                clearTimeout(timeoutId);
                if (isCancelled) return;

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const apiMessage = errorData?.detail || null;

                    if (response.status === 404) {
                        throw new Error(apiMessage || `User "${username}" not found on GitHub.`);
                    } else if (response.status === 429) {
                        throw new Error(apiMessage || 'GitHub API rate limit exceeded. Please try again in about an hour.');
                    } else {
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
    }, [username, isRoast]);

    /**
     * Generates a styled PNG summary card, downloads it, copies the profile URL,
     * and shows a toast notification confirming both actions.
     */
    const handleShare = async () => {
        try {
            // 1. Generate PNG from the hidden share card
            if (shareCardRef.current) {
                const dataUrl = await toPng(shareCardRef.current, {
                    pixelRatio: 2,
                    backgroundColor: '#0a0a0f'
                });

                // 2. Create a download link and trigger it
                const link = document.createElement('a');
                link.download = `${username}-github-analysis.png`;
                link.href = dataUrl;
                link.click();
            }

            // 3. Copy URL to clipboard
            await navigator.clipboard.writeText(window.location.href);

            // 4. Show success toast
            setToast('Image downloaded + link copied!');
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            console.error('Share failed:', err);
            // Fallback: just copy the link
            await navigator.clipboard.writeText(window.location.href);
            setToast('Link copied! (Image generation failed)');
            setTimeout(() => setToast(null), 3000);
        }
    };

    // Derive top role info for the share card
    const topRole = data?.role_fit?.top_3_roles?.[0];
    const topStack = data?.stack?.primary_stack?.slice(0, 3) || [];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Top bar — Rendered Unconditionally */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                        ← Back
                    </button>
                    <h1 className="text-sm font-medium text-gray-400 hidden sm:block">
                        Analysis for <span className="text-white font-semibold">@{username}</span>
                    </h1>
                    <button
                        onClick={handleShare}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                    >
                        Share This Analysis
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">

                {/* Roast mode banner */}
                {isRoast && !loading && data && (
                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-center">
                        <span className="text-2xl">🔥</span>
                        <p className="text-orange-400 font-semibold mt-1">You asked for it...</p>
                    </div>
                )}

                {/* Error Message Section */}
                {error && (
                    <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                        <div className="text-4xl mb-4">😞</div>
                        <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10"
                            >
                                ← Go Home
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading Section */}
                {loading && !error && <LoadingScreen />}

                {/* Data Sections */}
                {!loading && data && (
                    <div className="space-y-8 fade-in">
                        <ProfileCard
                            name={data.name}
                            username={username}
                            avatar_url={data.avatar_url}
                            profile_url={data.profile_url}
                            primary_stack={data.stack?.primary_stack}
                            domains={data.stack?.domains}
                            profile_summary={data.stack?.profile_summary}
                            strengths={data.stack?.strengths}
                        />

                        {/* Repo Showcase — between ProfileCard and GitHubStats */}
                        <RepoShowcase repos={data.top_repos} />

                        <GitHubStats username={username} />

                        <RoleScoreCard
                            scores={data.role_fit?.scores}
                            top_3_roles={data.role_fit?.top_3_roles}
                            reasoning={data.role_fit?.reasoning}
                        />
                    </div>
                )}
            </main>

            {/* Hidden share card — rendered off-screen, only used for PNG generation */}
            {data && (
                <div
                    ref={shareCardRef}
                    style={{
                        position: 'absolute',
                        left: '-9999px',
                        top: '-9999px',
                        width: '600px',
                        padding: '40px',
                        background: 'linear-gradient(145deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                >
                    {/* Avatar + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <img
                            src={data.avatar_url}
                            alt={username}
                            style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)' }}
                        />
                        <div>
                            <div style={{ color: 'white', fontSize: '22px', fontWeight: 'bold' }}>
                                {data.name || username}
                            </div>
                            <div style={{ color: '#9ca3af', fontSize: '14px' }}>@{username}</div>
                        </div>
                    </div>

                    {/* Top role badge */}
                    {topRole && (
                        <div style={{
                            background: 'rgba(59,130,246,0.15)',
                            border: '1px solid rgba(59,130,246,0.3)',
                            borderRadius: '12px',
                            padding: '14px 20px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}>
                            <span style={{ fontSize: '24px' }}>🥇</span>
                            <span style={{ color: '#93c5fd', fontSize: '16px', fontWeight: '600' }}>
                                {topRole.label} — {topRole.score}%
                            </span>
                        </div>
                    )}

                    {/* Top 3 tech stack badges */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
                        {topStack.map((tech) => (
                            <span
                                key={tech}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '999px',
                                    background: 'rgba(96,165,250,0.1)',
                                    border: '1px solid rgba(96,165,250,0.25)',
                                    color: '#93c5fd',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                }}
                            >
                                {tech}
                            </span>
                        ))}
                    </div>

                    {/* Footer */}
                    <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        paddingTop: '16px',
                        color: '#6b7280',
                        fontSize: '12px',
                        textAlign: 'center',
                    }}>
                        Analyzed by ai-github-analyzer.vercel.app
                    </div>
                </div>
            )}

            {/* Toast notification */}
            {toast && (
                <div
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-green-500/90 text-white text-sm font-medium shadow-lg shadow-green-500/20 animate-bounce"
                    style={{ animationIterationCount: 1, animationDuration: '0.5s' }}
                >
                    ✅ {toast}
                </div>
            )}
        </div>
    );
}

export default Results;
