import { Github, Twitter, Linkedin, Youtube, Globe, Mail, Twitch, Instagram, Phone, Code, BookOpen, MessageCircle, Send } from 'lucide-react';

function SocialIcon({ platform, size, color }) {
    const props = { size, color };
    switch (platform) {
        case 'github':        return <Github {...props} />;
        case 'twitter':       return <Twitter {...props} />;
        case 'linkedin':      return <Linkedin {...props} />;
        case 'youtube':       return <Youtube {...props} />;
        case 'twitch':        return <Twitch {...props} />;
        case 'instagram':     return <Instagram {...props} />;
        case 'email':         return <Mail {...props} />;
        case 'phone':         return <Phone {...props} />;
        case 'discord':       return <MessageCircle {...props} />;
        case 'telegram':      return <Send {...props} />;
        case 'medium':
        case 'devto':
        case 'hashnode':      return <BookOpen {...props} />;
        case 'leetcode':
        case 'codeforces':
        case 'codechef':
        case 'hackerrank':
        case 'stackoverflow': return <Code {...props} />;
        default:              return <Globe {...props} />;
    }
}

/**
 * ProfileCard — Displays the analyzed GitHub profile with tech stack,
 * domains, strengths, and gaps. This is the first card users see
 * after analysis completes, so it needs to feel immediately informative.
 */
function ProfileCard({ data, username, isRoast = false, socialLinks = {} }) {
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

    const socialIcons = {
        github:        { label: 'GitHub',       color: '#ffffff' },
        twitter:       { label: 'Twitter',      color: '#1DA1F2' },
        linkedin:      { label: 'LinkedIn',     color: '#0A66C2' },
        youtube:       { label: 'YouTube',      color: '#FF0000' },
        twitch:        { label: 'Twitch',       color: '#9146FF' },
        instagram:     { label: 'Instagram',    color: '#E4405F' },
        website:       { label: 'Website',      color: '#60a5fa' },
        email:         { label: 'Email',        color: '#34d399' },
        phone:         { label: 'Phone',        color: '#34d399' },
        mastodon:      { label: 'Mastodon',     color: '#6364FF' },
        leetcode:      { label: 'LeetCode',     color: '#FFA116' },
        kaggle:        { label: 'Kaggle',       color: '#20BEFF' },
        codeforces:    { label: 'Codeforces',   color: '#1F8ACB' },
        codechef:      { label: 'CodeChef',     color: '#5B4638' },
        hackerrank:    { label: 'HackerRank',   color: '#00EA64' },
        stackoverflow: { label: 'Stack Overflow', color: '#F48024' },
        devto:         { label: 'Dev.to',       color: '#ffffff' },
        medium:        { label: 'Medium',       color: '#ffffff' },
        hashnode:      { label: 'Hashnode',     color: '#2962FF' },
        discord:       { label: 'Discord',      color: '#5865F2' },
        telegram:      { label: 'Telegram',     color: '#26A5E4' },
        portfolio:     { label: 'Portfolio',    color: '#60a5fa' },
    };

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

                {/* Social Links */}
                {socialLinks && Object.keys(socialLinks).length > 0 && (
                    <div className="mb-3">
                        <p className="text-xs tracking-widest text-white/40 uppercase mb-2">Socials</p>
                        <div className="flex flex-wrap gap-2">
                    {Object.entries(socialLinks)
                        .filter(([platform]) => platform !== 'phone_display' && platform !== 'github') // skip raw display key and redundant github link
                        .map(([platform, url]) => {
                            const meta = socialIcons[platform] || { label: platform, color: '#60a5fa' };
                            
                            // Use display label for phone if available
                            const label = platform === 'phone' 
                                ? (socialLinks['phone_display'] || 'Phone')
                                : meta.label;

                            return (
                                <a
                                    key={platform}
                                    href={url}
                                    target={platform === 'email' ? '_self' : '_blank'}
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-[11px] font-medium group"
                                >
                                    <SocialIcon platform={platform} size={12} color={meta.color} />
                                    <span className="text-white/70 group-hover:text-white transition-colors">
                                        {label}
                                    </span>
                                </a>
                            );
                        })}
</div>
                    </div>
                )}

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
                    <div className="mt-3">
                        <p className="text-xs tracking-widest text-white/40 uppercase mb-2">
                            {isRoast ? '🔥 Roast' : '✦ Strengths'}
                        </p>
                        <ul className="space-y-1">
                            {stack.strengths.map((s, i) => (
                                <li key={i} className="text-xs text-white/60 flex gap-2">
                                    <span className="text-green-400 mt-0.5">+</span>
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
