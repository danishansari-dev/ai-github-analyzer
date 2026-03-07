import React from 'react';

/**
 * GitHubStats component — Displays various GitHub contribution and activity statistics widgets
 * using the GitHub Readme Stats and Activity Graph APIs.
 * 
 * @param {string} username - The GitHub username to fetch stats for
 * @returns A section containing multiple statistics widgets
 */
const GitHubStats = ({ username }) => {
    // #156: Verify the component is mounting in production
    console.log("GitHubStats rendering for:", username);

    if (!username) return null;

    // Common query parameters for theme and icons
    const theme = 'radical';

    // Helper to handle image load errors by hiding the broken image
    const handleImgError = (e) => {
        e.target.style.display = 'none';
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xl">📊</span>
                </div>
                <h2 className="text-2xl font-bold text-white">GitHub Statistics</h2>
            </div>

            {/* Top Row: Stats Card & Streak Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-300 min-h-[150px] flex flex-col justify-center items-center">
                    <img
                        src={`https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=${theme}&count_private=true`}
                        alt={`${username}'s GitHub stats`}
                        className="w-full h-auto rounded-lg"
                        loading="lazy"
                        onError={handleImgError}
                    />
                    <p style={{ color: 'gray', fontSize: '12px' }}>Stats loading...</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-300 min-h-[150px] flex flex-col justify-center items-center">
                    <img
                        src={`https://github-readme-streak-stats.herokuapp.com?user=${username}&theme=${theme}`}
                        alt={`${username}'s GitHub streak`}
                        className="w-full h-auto rounded-lg"
                        loading="lazy"
                        onError={handleImgError}
                    />
                    <p style={{ color: 'gray', fontSize: '12px' }}>Stats loading...</p>
                </div>
            </div>

            {/* Middle: Top Languages */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-300 min-h-[150px] flex flex-col justify-center items-center">
                <img
                    src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=${theme}&langs_count=8`}
                    alt={`${username}'s top languages`}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                    onError={handleImgError}
                />
                <p style={{ color: 'gray', fontSize: '12px' }}>Stats loading...</p>
            </div>

            {/* Bottom: Activity Graph */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-300 min-h-[200px] flex flex-col justify-center items-center">
                <img
                    src={`https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=react-dark&hide_border=true&area=true`}
                    alt={`${username}'s activity graph`}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                    onError={handleImgError}
                />
                <p style={{ color: 'gray', fontSize: '12px' }}>Stats loading...</p>
            </div>
        </section>
    );
};

export default GitHubStats;
