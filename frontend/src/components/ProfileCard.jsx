/**
 * ProfileCard — Displays the analyzed GitHub profile with tech stack,
 * domains, strengths, and gaps. This is the first card users see
 * after analysis completes, so it needs to feel immediately informative.
 */
function ProfileCard({ name, username, avatar_url, profile_url, primary_stack, domains, profile_summary, strengths, developer_type, profile_tag, badges }) {
    /**
     * Converts a badge slug like "pull-shark" into a readable label "Pull Shark".
     * @param slug - The hyphenated badge slug from the GitHub API
     * @returns Human-readable badge name
     */
    const formatBadgeName = (slug) => slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return (
        <div className="p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
            {/* Profile header — stacks vertically on very small screens */}
            <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
                <img
                    src={avatar_url}
                    alt={`${username}'s avatar`}
                    className="w-20 h-20 rounded-full border-2 border-white/10 shrink-0"
                />
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-white break-words">{name || username}</h2>
                        {developer_type && (
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                                {developer_type}
                            </span>
                        )}
                    </div>
                    <a
                        href={profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                        @{username} ↗
                    </a>
                </div>
            </div>

            {/* Profile summary */}
            <p className="text-gray-300 leading-relaxed mb-4 text-lg break-words">{profile_summary}</p>

            {/* Profile tag / Quote */}
            {profile_tag && (
                <div className="mb-6 pl-4 border-l-2 border-indigo-500/50">
                    <p className="text-indigo-400 italic font-medium text-lg">"{profile_tag}"</p>
                </div>
            )}

            {/* Tech stack badges — flex-wrap ensures no overflow on small screens */}
            <div className="mb-6 overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                    {(primary_stack || []).map((tech) => (
                        <span
                            key={tech}
                            className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* Domain tags */}
            <div className="mb-8 overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Domains</h3>
                <div className="flex flex-wrap gap-2">
                    {(domains || []).map((domain) => (
                        <span
                            key={domain}
                            className="px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium border border-violet-500/20"
                        >
                            {domain}
                        </span>
                    ))}
                </div>
            </div>

            {/* Strengths — vertical stack with overflow protection */}
            <div className="space-y-6">

                {/* GitHub Achievement Badges — only shown when at least one badge is unlocked */}
                {badges && badges.length > 0 && (
                    <div className="mb-2">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Badges</h3>
                        <div className="flex flex-wrap gap-3">
                            {badges.map((slug) => (
                                <div key={slug} className="relative group">
                                    <img
                                        src={`https://github.githubassets.com/images/modules/profile/achievements/${slug}-default.png`}
                                        alt={formatBadgeName(slug)}
                                        className="w-10 h-10 rounded-lg opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-200"
                                    />
                                    {/* Tooltip on hover */}
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-900 text-gray-200 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
                                        {formatBadgeName(slug)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">STRENGTHS</h3>
                    <div className="space-y-3">
                        {(strengths || []).map((item, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-[#22c55e]/[0.05] border-l-[3px] border-[#22c55e] overflow-hidden"
                            >
                                <span className="text-[#22c55e] mt-0.5 shrink-0 font-bold text-lg">✦</span>
                                <span className="text-gray-200 leading-relaxed break-words min-w-0">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}

export default ProfileCard;
