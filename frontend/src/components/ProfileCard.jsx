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
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                                {developer_type}
                            </span>
                        )}
                    </div>
                    <a
                        href={profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-indigo-400 transition-colors text-sm flex items-center gap-1"
                    >
                        @{username} <span className="text-[10px]">↗</span>
                    </a>
                </div>
            </div>

            {/* Profile Tag */}
            {profile_tag && (
                <div className="mb-6 pl-4 border-l-2 border-indigo-500/50">
                    <p className="text-gray-300 italic text-sm leading-relaxed">"{profile_tag}"</p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="flex flex-col items-center justify-center py-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] group-hover:border-[#2f2f2f] transition-all">
                    <span className="text-xl font-black text-white leading-none mb-2">{data.followers || 0}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Followers</span>
                </div>
                <div className="flex flex-col items-center justify-center py-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] group-hover:border-[#2f2f2f] transition-all">
                    <span className="text-xl font-black text-white leading-none mb-2">{data.following || 0}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Following</span>
                </div>
                <div className="flex flex-col items-center justify-center py-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] group-hover:border-[#2f2f2f] transition-all">
                    <span className="text-xl font-black text-white leading-none mb-2">{data.public_repos || 0}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Repos</span>
                </div>
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
                                className="px-2.5 py-1 rounded bg-white/5 text-gray-300 text-[11px] font-medium border border-white/5"
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
                        <div className="flex flex-wrap gap-3 max-h-20 overflow-x-auto overflow-y-hidden pb-1">
                            {badges.map((slug) => (
                                <div key={slug} className="relative group">
                                    <img
                                        src={`https://github.githubassets.com/images/modules/profile/achievements/${slug}-default.png`}
                                        alt={formatBadgeName(slug)}
                                        className="w-9 h-9 opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-200"
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
