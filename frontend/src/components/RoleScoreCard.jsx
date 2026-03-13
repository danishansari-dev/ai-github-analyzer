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
function RoleScoreCard({ scores, reasoning }) {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const groupedRoles = {};
    Object.entries(scores || {}).forEach(([role, score]) => {
        if (score <= 25) return;
        const categoryKey = Object.keys(ROLE_CATEGORIES).find(cat =>
            ROLE_CATEGORIES[cat].roles.includes(role)
        );
        if (categoryKey) {
            if (!groupedRoles[categoryKey]) groupedRoles[categoryKey] = [];
            groupedRoles[categoryKey].push({ role, score });
        }
    });

    const sortedCategories = Object.keys(groupedRoles).sort((a, b) => {
        const maxA = Math.max(...groupedRoles[a].map(r => r.score));
        const maxB = Math.max(...groupedRoles[b].map(r => r.score));
        return maxB - maxA;
    });

    const totalRolesShown = Object.values(groupedRoles).reduce((acc, roles) => acc + roles.length, 0);

    return (
        <div className="flex flex-col gap-16">
            <div className="text-center">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.3em] mb-4">
                    🎯 TOP CAREER MATCHES
                </h2>
                <div className="max-w-[600px] mx-auto">
                    <p className="text-gray-400 text-sm leading-relaxed">
                        {reasoning ? reasoning.split('.').filter(Boolean).slice(0, 2).join('. ') + '.' : ''}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10 items-start">
                {sortedCategories.map(catKey => {
                    const category = ROLE_CATEGORIES[catKey];
                    const roles = groupedRoles[catKey].sort((a, b) => b.score - a.score);

                    return (
                        <div key={catKey} className="p-6 rounded-2xl bg-[#111111] border border-[#1f1f1f] flex flex-col">
                            <div className="flex items-center gap-2 mb-6 border-b border-[#1f1f1f] pb-4">
                                <span className="text-lg">{category.label.split(' ')[0]}</span>
                                <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">
                                    {category.label.split(' ').slice(1).join(' ')}
                                </h4>
                            </div>

                            <div className="space-y-6">
                                {roles.map(({ role, score }) => (
                                    <div key={role} className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                            <span className="text-gray-500">
                                                {ROLE_LABELS[role] || role}
                                            </span>
                                            <span style={{ color: category.color }} className="text-right">
                                                {score}%
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-[1500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                                                style={{
                                                    width: animated ? `${score}%` : '0%',
                                                    backgroundImage: `linear-gradient(to right, ${category.color}, ${category.color}33)`,
                                                    boxShadow: `0 0 10px ${category.color}55`
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

            <div className="text-center pt-2">
                <p className="text-[10px] text-gray-700 uppercase tracking-[0.2em]">
                    {totalRolesShown < 6
                        ? 'Only roles with strong evidence are shown'
                        : 'Only roles with evidence-based scores > 25% shown'}
                </p>
            </div>
        </div>
    );
}

export default RoleScoreCard;
