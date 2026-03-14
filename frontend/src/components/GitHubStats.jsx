import React, { useState } from 'react';
import { GlowCard } from './SpotlightCard';

/**
 * Skeleton + image wrapper: shows pulse skeleton until image loads, then image.
 * On error, hides the wrapper.
 */
function StatImage({ src, alt, className = 'w-full rounded-xl' }) {
    const [loaded, setLoaded] = useState(false);
    const [errored, setErrored] = useState(false);

    if (errored) return null;

    return (
        <div className="relative w-full min-h-[140px] rounded-xl overflow-hidden">
            {!loaded && (
                <div className="absolute inset-0 w-full h-40 bg-white/5 rounded-xl animate-pulse" />
            )}
            <img
                src={src}
                alt={alt}
                className={className}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                onError={(e) => {
                    setErrored(true);
                    const wrapper = e.target.closest('.stat-card-wrapper');
                    if (wrapper) wrapper.style.display = 'none';
                }}
            />
        </div>
    );
}

/**
 * GitHubStats — Multi-widget layout matching README style.
 * All URLs use the analyzed username (never hardcoded).
 */
const GitHubStats = ({ username }) => {
    if (!username) return null;

    const hideCardOnError = (e) => {
        const wrapper = e.target.closest('.stat-card-wrapper');
        if (wrapper) wrapper.style.display = 'none';
    };

    return (
        <GlowCard customSize glowColor="blue" className="print-card">
            <div className="rounded-2xl bg-[#111111] border border-[#1f1f1f] h-full p-8">
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-lg">📊</span>
                    <h2 className="text-[10px] tracking-widest text-white/40 uppercase font-semibold">
                        GitHub Statistics
                    </h2>
                </div>

                <div className="flex flex-col gap-4 space-y-4">
                    {/* Row 1 — Stats + Streak */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="stat-card-wrapper">
                            <StatImage
                                src={`https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=radical&count_private=true`}
                                alt="GitHub Stats"
                            />
                        </div>
                        <div className="stat-card-wrapper">
                            <StatImage
                                src={`https://github-readme-streak-stats.herokuapp.com?user=${username}&theme=radical`}
                                alt="GitHub Streak"
                            />
                        </div>
                    </div>

                    {/* Row 2 — Top Languages + LeetCode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="stat-card-wrapper">
                            <StatImage
                                src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=radical&langs_count=8`}
                                alt="Top Languages"
                            />
                        </div>
                        <div className="stat-card-wrapper">
                            <StatImage
                                src={`https://leetcard.jacoblin.cool/${username}?theme=radical&font=Karma&ext=heatmap`}
                                alt="LeetCode Stats"
                            />
                        </div>
                    </div>

                    {/* Row 3 — Activity Graph full width */}
                    <div className="stat-card-wrapper">
                        <StatImage
                            src={`https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=react-dark&hide_border=true&area=true`}
                            alt="GitHub Activity Graph"
                        />
                    </div>

                    {/* Row 4 — OSS Insight Dashboard full width */}
                    <div className="stat-card-wrapper">
                        <a
                            href={`https://next.ossinsight.io/analyze/${username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <img
                                src={`https://next.ossinsight.io/widgets/official/compose-user-dashboard-stats/thumbnail.png?login=${username}&image_size=auto&color_scheme=dark`}
                                alt="OSS Insight Dashboard"
                                className="w-full rounded-xl"
                                loading="lazy"
                                onError={hideCardOnError}
                            />
                        </a>
                    </div>
                </div>
            </div>
        </GlowCard>
    );
};

export default GitHubStats;
