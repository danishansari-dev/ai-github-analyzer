import { useState, useEffect } from 'react';

/**
 * Technical Career Role Categories and their corresponding emoji/colors.
 * This mapping is used to group roles and style their progress bars.
 */
const ROLE_CATEGORIES = {
    ai_ml: {
        label: '🤖 AI & Machine Learning',
        color: '#8b5cf6', // purple-500
        roles: ['ml_engineer', 'data_scientist', 'data_analyst', 'nlp_engineer', 'computer_vision_engineer', 'ai_researcher', 'mlops_engineer', 'prompt_engineer', 'ai_product_manager']
    },
    web: {
        label: '🌐 Web Development',
        color: '#3b82f6', // blue-500
        roles: ['frontend_developer', 'backend_developer', 'full_stack_developer', 'web3_developer', 'wordpress_developer', 'jamstack_developer']
    },
    mobile: {
        label: '📱 Mobile Development',
        color: '#10b981', // emerald-500
        roles: ['ios_developer', 'android_developer', 'react_native_developer', 'flutter_developer', 'cross_platform_developer']
    },
    devops: {
        label: '☁️ DevOps & Cloud',
        color: '#06b6d4', // cyan-500
        roles: ['devops_engineer', 'cloud_engineer', 'site_reliability_engineer', 'platform_engineer', 'kubernetes_engineer', 'aws_specialist', 'azure_specialist', 'gcp_specialist', 'infrastructure_engineer']
    },
    data: {
        label: '📊 Data Engineering',
        color: '#f59e0b', // amber-500
        roles: ['data_engineer', 'database_administrator', 'business_intelligence_engineer', 'big_data_engineer', 'etl_developer', 'analytics_engineer']
    },
    security: {
        label: '🔒 Security',
        color: '#ef4444', // red-500
        roles: ['security_engineer', 'penetration_tester', 'security_analyst', 'devsecops_engineer', 'cryptography_engineer']
    },
    systems: {
        label: '⚙️ Systems & Embedded',
        color: '#64748b', // slate-500
        roles: ['embedded_developer', 'firmware_engineer', 'systems_programmer', 'os_developer', 'hardware_engineer', 'iot_developer']
    },
    specialized: {
        label: '🎮 Specialized',
        color: '#ec4899', // pink-500
        roles: ['game_developer', 'ar_vr_developer', 'blockchain_developer', 'smart_contract_developer', 'robotics_engineer', 'quantum_computing_engineer', 'compiler_engineer', 'graphics_engineer']
    },
    research: {
        label: '🔬 Research',
        color: '#6366f1', // indigo-500
        roles: ['research_engineer', 'research_scientist', 'phd_researcher', 'academic_researcher']
    },
    product: {
        label: '🎯 Product & Design',
        color: '#f97316', // orange-500
        roles: ['technical_product_manager', 'developer_advocate', 'solutions_architect', 'technical_writer', 'ui_ux_engineer']
    }
};

/**
 * Human-readable labels for role keys.
 */
const ROLE_LABELS = {
    ml_engineer: 'ML Engineer',
    data_scientist: 'Data Scientist',
    data_analyst: 'Data Analyst',
    nlp_engineer: 'NLP Engineer',
    computer_vision_engineer: 'Computer Vision Engineer',
    ai_researcher: 'AI Researcher',
    mlops_engineer: 'MLOps Engineer',
    prompt_engineer: 'Prompt Engineer',
    ai_product_manager: 'AI Product Manager',
    frontend_developer: 'Frontend Developer',
    backend_developer: 'Backend Developer',
    full_stack_developer: 'Full Stack Developer',
    web3_developer: 'Web3 Developer',
    wordpress_developer: 'WordPress Developer',
    jamstack_developer: 'Jamstack Developer',
    ios_developer: 'iOS Developer',
    android_developer: 'Android Developer',
    react_native_developer: 'React Native Developer',
    flutter_developer: 'Flutter Developer',
    cross_platform_developer: 'Cross-Platform Developer',
    devops_engineer: 'DevOps Engineer',
    cloud_engineer: 'Cloud Engineer',
    site_reliability_engineer: 'SRE',
    platform_engineer: 'Platform Engineer',
    kubernetes_engineer: 'Kubernetes Engineer',
    aws_specialist: 'AWS Specialist',
    azure_specialist: 'Azure Specialist',
    gcp_specialist: 'GCP Specialist',
    infrastructure_engineer: 'Infrastructure Engineer',
    data_engineer: 'Data Engineer',
    database_administrator: 'DBA',
    business_intelligence_engineer: 'BI Engineer',
    big_data_engineer: 'Big Data Engineer',
    etl_developer: 'ETL Developer',
    analytics_engineer: 'Analytics Engineer',
    security_engineer: 'Security Engineer',
    penetration_tester: 'Penetration Tester',
    security_analyst: 'Security Analyst',
    devsecops_engineer: 'DevSecOps Engineer',
    cryptography_engineer: 'Cryptography Engineer',
    embedded_developer: 'Embedded Developer',
    firmware_engineer: 'Firmware Engineer',
    systems_programmer: 'Systems Programmer',
    os_developer: 'OS Developer',
    hardware_engineer: 'Hardware Engineer',
    iot_developer: 'IoT Developer',
    game_developer: 'Game Developer',
    ar_vr_developer: 'AR/VR Developer',
    blockchain_developer: 'Blockchain Developer',
    smart_contract_developer: 'Smart Contract Developer',
    robotics_engineer: 'Robotics Engineer',
    quantum_computing_engineer: 'Quantum Engineer',
    compiler_engineer: 'Compiler Engineer',
    graphics_engineer: 'Graphics Engineer',
    research_engineer: 'Research Engineer',
    research_scientist: 'Research Scientist',
    phd_researcher: 'PhD Researcher',
    academic_researcher: 'Academic Researcher',
    technical_product_manager: 'Technical PM',
    developer_advocate: 'Developer Advocate',
    solutions_architect: 'Solutions Architect',
    technical_writer: 'Technical Writer',
    ui_ux_engineer: 'UI/UX Engineer'
};

/**
 * RoleScoreCard — Displays the developer's career fit analysis.
 * Groups roles by category and highlights the top 3 matches.
 */
function RoleScoreCard({ scores, top_3_roles, reasoning }) {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Filter and group roles
    const groupedRoles = {};
    Object.entries(scores || {}).forEach(([role, score]) => {
        if (score <= 25) return; // Hide low-evidence roles

        // Find which category this role belongs to
        const categoryKey = Object.keys(ROLE_CATEGORIES).find(cat =>
            ROLE_CATEGORIES[cat].roles.includes(role)
        );

        if (categoryKey) {
            if (!groupedRoles[categoryKey]) groupedRoles[categoryKey] = [];
            groupedRoles[categoryKey].push({ role, score });
        }
    });

    // Sort categories by their highest scoring role
    const sortedCategories = Object.keys(groupedRoles).sort((a, b) => {
        const maxA = Math.max(...groupedRoles[a].map(r => r.score));
        const maxB = Math.max(...groupedRoles[b].map(r => r.score));
        return maxB - maxA;
    });

    return (
        <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] space-y-10">
            {/* Top 3 Hero Badges */}
            <div className="text-center">
                <h3 className="text-gray-400 text-sm font-medium mb-6 uppercase tracking-widest">🚀 Top Career Matches</h3>
                <div className="flex flex-wrap justify-center gap-4">
                    {(top_3_roles || []).map((match, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center p-4 min-w-[140px] rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300"
                        >
                            <span className="text-3xl mb-2">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                            </span>
                            <span className="text-xs text-gray-400 mb-1">{match.label}</span>
                            <span className="text-xl font-bold text-white">{match.score}%</span>
                        </div>
                    ))}
                </div>
                <p className="mt-8 text-gray-400 max-w-2xl mx-auto leading-relaxed text-sm italic">
                    {reasoning}
                </p>
            </div>

            {/* Role categories and bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {sortedCategories.map(catKey => {
                    const category = ROLE_CATEGORIES[catKey];
                    const roles = groupedRoles[catKey].sort((a, b) => b.score - a.score);

                    return (
                        <div key={catKey} className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-300 border-b border-white/5 pb-2 mb-4">
                                {category.label}
                            </h4>
                            <div className="space-y-6">
                                {roles.map(({ role, score }) => (
                                    <div key={role}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs font-medium text-gray-400">
                                                {ROLE_LABELS[role] || role}
                                            </span>
                                            <span className="text-xs font-mono text-gray-500">
                                                {score}%
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{
                                                    width: animated ? `${score}%` : '0%',
                                                    backgroundColor: category.color,
                                                    boxShadow: `0 0 8px ${category.color}44`
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-6 border-t border-white/5 text-center">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                    Only roles with evidence-based scores {'>'} 25% are displayed.
                </p>
            </div>
        </div>
    );
}

export default RoleScoreCard;
