/**
 * ProfileCard — Displays the analyzed GitHub profile with tech stack,
 * domains, strengths, and gaps. This is the first card users see
 * after analysis completes, so it needs to feel immediately informative.
 */
function ProfileCard({ name, username, avatar_url, profile_url, primary_stack, domains, profile_summary, strengths }) {
    return (
        <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
            {/* Profile header */}
            <div className="flex items-start gap-5 mb-6">
                <img
                    src={avatar_url}
                    alt={`${username}'s avatar`}
                    className="w-20 h-20 rounded-full border-2 border-white/10"
                />
                <div>
                    <h2 className="text-2xl font-bold text-white">{name || username}</h2>
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
            <p className="text-gray-300 leading-relaxed mb-6 text-lg">{profile_summary}</p>

            {/* Tech stack badges */}
            <div className="mb-6">
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
            <div className="mb-8">
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

            {/* Strengths — vertical stack */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">STRENGTHS</h3>
                    <div className="space-y-3">
                        {(strengths || []).map((item, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 p-4 rounded-xl bg-[#22c55e]/[0.05] border-l-[3px] border-[#22c55e]"
                            >
                                <span className="text-[#22c55e] mt-0.5 shrink-0 font-bold text-lg">✦</span>
                                <span className="text-gray-200 leading-relaxed">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}

export default ProfileCard;
