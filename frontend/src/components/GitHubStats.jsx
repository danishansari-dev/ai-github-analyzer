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

    // Helper to handle image load errors by hiding the broken image
    const handleImgError = (e) => {
        e.target.style.display = 'none';
    };

    return (
        <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/5">
            <h2 style={{ color: 'white' }} className="text-2xl font-bold mb-6 flex items-center gap-2">
                📊 GitHub Statistics
            </h2>

            <section className="space-y-6">
                {/* Top Row: Stats Card & Streak Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-300 min-h-[150px] flex flex-col justify-center items-center">
                        <img
                            src={`https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=radical&count_private=true&hide_border=true`}
                            alt={`${username}'s GitHub stats`}
                            className="w-full h-auto rounded-lg"
                            onError={handleImgError}
                        />
                        <p style={{ color: 'gray', fontSize: '12px' }}>Stats loading...</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-300 min-h-[150px] flex flex-col justify-center items-center">
                        <img
                            src={`https://streak-stats.demolab.com?user=${username}&theme=radical&hide_border=true`}
                            alt={`${username}'s GitHub streak`}
                            className="w-full h-auto rounded-lg"
                            onError={handleImgError}
                        />
                        <p style={{ color: 'gray', fontSize: '12px' }}>Stats loading...</p>
                    </div>
                </div>

                {/* Middle: Top Languages */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-300 min-h-[150px] flex flex-col justify-center items-center">
                    <img
                        src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=radical&hide_border=true&langs_count=8`}
                        alt={`${username}'s top languages`}
                        className="w-full h-auto rounded-lg"
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
                        onError={handleImgError}
                    />
                    <p style={{ color: 'gray', fontSize: '12px' }}>Stats loading...</p>
                </div>
            </section>
        </div>
    );
};

export default GitHubStats;
