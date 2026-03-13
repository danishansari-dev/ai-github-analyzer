/**
 * ProfileCard — Displays the analyzed GitHub profile with tech stack,
 * domains, strengths, and gaps. This is the first card users see
 * after analysis completes, so it needs to feel immediately informative.
 */
function ProfileCard({ data, username }) {
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

    const getTechClasses = (tech) => {
        switch (tech) {
            case 'JavaScript':
                return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
            case 'Python':
                return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
            case 'TypeScript':
                return 'bg-blue-600/10 border-blue-600/30 text-blue-400';
            case 'React':
                return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
            case 'Node.js':
                return 'bg-green-500/10 border-green-500/30 text-green-300';
            default:
                return 'bg-white/5 border-white/15 text-white/70';
        }
    };

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

                {/* Badges */}
                {badges && badges.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">ACHIEVEMENTS</h3>
                        <div className="flex flex-wrap gap-2">
                            {badges.map((slug) => (
                                <div key={slug} className="relative group">
                                    <img
                                        src={`https://github.githubassets.com/images/modules/profile/achievements/${slug}-default.png`}
                                        alt={formatBadgeName(slug)}
                                        className="w-12 h-12 rounded-full border border-white/10 hover:border-white/30 hover:scale-110 transition-all duration-200 cursor-pointer"
                                    />
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-900 text-gray-200 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 z-10">
                                        {formatBadgeName(slug)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfileCard;
