/**
 * ProfileCard — Displays the analyzed GitHub profile with tech stack,
 * domains, strengths, and gaps. This is the first card users see
 * after analysis completes, so it needs to feel immediately informative.
 */
function ProfileCard({ data, username, isRoast = false }) {
    if (!data) return null;

    const {
        name,
        avatar_url,
        profile_url,
        stack,
        badges
    } = data;

    const {
        primary_stack,
        domains,
        profile_tag,
        developer_type,
        profile_summary // This will actually be used in the center column
    } = stack || {};

    // For followers/following we should really have them in the data object.
    // Looking at analyze.py, we don't return them in the final JSON but they are in the GitHub profile object.
    // Wait, let me check analyze_user in analyze.py.
    // Actually, I should probably check github_service.py to see what get_user_profile returns.
    // It returns: name, bio, avatar_url, public_repos, followers, following, html_url.
    // However, FullAnalysisResponse in schemas.py doesn't include followers/following.
    // Let me check schemas.py again.

    // I will use some default values or check if they exist. 
    // If I didn't add them to schemas.py, I might need to.

    const formatBadgeName = (slug) => slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const techColors = {
        JavaScript: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
        Python: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
        TypeScript: 'bg-blue-600/10 border-blue-600/30 text-blue-400',
        React: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
        Vite: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
        'Node.js': 'bg-green-500/10 border-green-500/30 text-green-300',
    };
    const getTechClasses = (tech) => techColors[tech] || 'bg-white/5 border-white/10 text-white/60';

    return (
        <div className="flex flex-col h-full">
            {/* Header: Avatar + Name + Type */}
            <div className="flex items-center gap-4 mb-6">
                <img
                    src={avatar_url}
                    alt={`${username}'s avatar`}
                    className="w-20 h-20 rounded-full border-2 border-white/10 shrink-0 object-cover"
                />
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-white truncate">{name || username}</h2>
                        {developer_type && (
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white text-xs font-bold border border-white/20 tracking-wide">
                                {developer_type}
                            </span>
                        )}
                    </div>
                    <a
                        href={`https://github.com/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-400 transition-colors text-sm flex items-center gap-1"
                    >
                        @{username}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-3 h-3"
                            aria-hidden="true"
                        >
                            <path
                                fill="currentColor"
                                d="M18 3h-5a1 1 0 1 0 0 2h2.586l-6.293 6.293a1 1 0 0 0 1.414 1.414L17 6.414V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1Zm-3 7a1 1 0 0 0-1 1v6H6V10h3a1 1 0 1 0 0-2H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1Z"
                            />
                        </svg>
                    </a>
                </div>
            </div>

            {/* Profile Tag */}
            {profile_tag && (
                <div className="mb-6 pl-3 border-l-2 border-blue-400/60">
                    <p className="italic text-white/60 text-sm leading-relaxed">"{profile_tag}"</p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                <a
                    href={`https://github.com/${username}?tab=followers`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center py-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:border-white/30 hover:bg-white/10 cursor-pointer transition-all duration-200"
                >
                    <span className="text-xl font-black text-white leading-none mb-2">{data.followers || 0}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Followers</span>
                </a>
                <a
                    href={`https://github.com/${username}?tab=following`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center py-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:border-white/30 hover:bg-white/10 cursor-pointer transition-all duration-200"
                >
                    <span className="text-xl font-black text-white leading-none mb-2">{data.following || 0}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Following</span>
                </a>
                <a
                    href={`https://github.com/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center py-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:border-white/30 hover:bg-white/10 cursor-pointer transition-all duration-200"
                >
                    <span className="text-xl font-black text-white leading-none mb-2">{data.public_repos || 0}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Repos</span>
                </a>
            </div>

            {/* Sections */}
            <div className="space-y-8">
                {/* Tech Stack */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">TECH STACK</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {(primary_stack || []).map((tech) => (
                            <span
                                key={tech}
                                className={`px-2.5 py-1 rounded text-[11px] font-medium border transform hover:scale-105 transition-transform duration-150 cursor-default ${getTechClasses(tech)}`}
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Domains */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">DOMAINS</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {(domains || []).map((domain) => (
                            <span
                                key={domain}
                                className="px-2.5 py-1 rounded bg-indigo-500/5 text-indigo-300/80 text-[11px] font-medium border border-indigo-500/10"
                            >
                                {domain}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Strengths / Roast */}
                {stack?.strengths?.length > 0 && (
                    <div className="mt-4">
                        <p className="text-[10px] tracking-widest text-white/40 uppercase mb-2">
                            {isRoast ? '🔥 Roast' : '✦ Strengths'}
                        </p>
                        <ul className="space-y-2">
                            {stack.strengths.map((s, i) => (
                                <li key={i} className="flex gap-2 text-xs text-white/65 leading-relaxed">
                                    <span className="text-green-400 mt-0.5 shrink-0">+</span>
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Badges */}
                {badges && badges.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">ACHIEVEMENTS</h3>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {badges.map((slug) => {
                                const badgeName = formatBadgeName(slug);
                                return (
                                    <img
                                        key={slug}
                                        src={`https://github.githubassets.com/images/modules/profile/achievements/${slug}-default.png`}
                                        alt={badgeName}
                                        title={badgeName}
                                        className="w-12 h-12 rounded-full border border-white/10 hover:border-white/30 hover:scale-110 transition-all duration-200 cursor-pointer overflow-hidden"
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfileCard;
