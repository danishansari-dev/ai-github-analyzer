import { useState, useEffect } from 'react';

/**
 * Maps the internal snake_case role keys from the API response
 * to human-readable labels for displaying in the UI.
 */
const ROLE_LABELS = {
    ml_engineer: 'ML Engineer',
    backend_developer: 'Backend Developer',
    frontend_developer: 'Frontend Developer',
    mlops_engineer: 'MLOps Engineer',
    full_stack_developer: 'Full Stack Developer',
};

/**
 * RoleScoreCard — Displays the developer's fit score across 5 engineering roles.
 * The top role gets a highlighted hero badge and a blue progress bar;
 * all others render with a neutral gray bar.
 */
function RoleScoreCard({ scores, top_role, top_role_label, reasoning }) {
    const [animated, setAnimated] = useState(false);

    // Trigger the bar animation shortly after mount for a satisfying entrance effect
    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Sort roles so the highest score appears first
    const sortedRoles = Object.entries(scores || {}).sort(([, a], [, b]) => b - a);
    const topScore = scores?.[top_role] || 0;

    return (
        <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
            {/* Hero badge for the top role */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <span className="text-2xl">🎯</span>
                    <span className="text-xl font-bold text-white">
                        You are <span className="text-blue-400">{topScore}%</span> {top_role_label}
                    </span>
                </div>
                <p className="mt-4 text-gray-400 max-w-lg mx-auto leading-relaxed">{reasoning}</p>
            </div>

            {/* Role score bars */}
            <div className="space-y-5">
                {sortedRoles.map(([roleKey, score]) => {
                    const isTopRole = roleKey === top_role;
                    return (
                        <div key={roleKey}>
                            <div className="flex justify-between items-center mb-2">
                                <span className={`text-sm font-medium ${isTopRole ? 'text-white' : 'text-gray-400'}`}>
                                    {ROLE_LABELS[roleKey] || roleKey}
                                </span>
                                <span className={`text-sm font-mono ${isTopRole ? 'text-blue-400' : 'text-gray-500'}`}>
                                    {score}%
                                </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isTopRole
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-400'
                                            : 'bg-gray-600'
                                        }`}
                                    style={{ width: animated ? `${score}%` : '0%' }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default RoleScoreCard;
