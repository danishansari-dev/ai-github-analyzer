import { useState, useEffect } from 'react';

/**
 * Full-screen loading screen that provides feedback during the AI analysis process.
 * Features a 4-step stepper, cycling messages, a timed progress bar, and premium dark theme styling.
 */

const LOADING_MESSAGES = [
    "Fetching your GitHub repos...",
    "Reading your READMEs and code...",
    "Detecting your tech stack...",
    "Scoring 50+ career roles...",
    "Mapping your developer profile...",
    "Almost there..."
];

// 4 discrete pipeline steps shown as a horizontal stepper
const STEPS = [
    "Fetching GitHub profile",
    "Reading repositories",
    "Running AI analysis",
    "Building your report"
];

function LoadingScreen() {
    const [messageIndex, setMessageIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [stepIndex, setStepIndex] = useState(0);

    // Cycle through messages every 2.5 seconds as requested
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    // Auto-advance the stepper every ~4 seconds (capped at last step)
    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Animate progress bar from 0% to 90% over 30 seconds
    useEffect(() => {
        const duration = 30000;
        const intervalTime = 100;
        const totalSteps = duration / intervalTime;
        const increment = 90 / totalSteps;

        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + increment;
                return next >= 90 ? 90 : next;
            });
        }, intervalTime);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0f] text-white">
            {/* Background ambient glow for premium feel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />

            <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6 text-center">
                {/* Modern Spinner */}
                <div className="relative w-16 h-16 mb-10">
                    <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500/30 animate-spin-slow" />
                </div>

                {/* 4-Step Stepper — shows pipeline progress visually */}
                <div className="flex items-start justify-between w-full mb-10 px-2">
                    {STEPS.map((label, i) => (
                        <div key={i} className="flex flex-col items-center flex-1 relative">
                            {/* Connecting line between dots (skip for the first step) */}
                            {i > 0 && (
                                <div
                                    className={`absolute top-[10px] right-1/2 w-full h-[2px] transition-all duration-500 ${i <= stepIndex ? 'bg-blue-500' : 'bg-white/10'
                                        }`}
                                />
                            )}

                            {/* Step dot */}
                            <div
                                className={`relative z-10 w-5 h-5 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${i < stepIndex
                                        ? 'bg-blue-500 border-blue-500'
                                        : i === stepIndex
                                            ? 'bg-blue-500 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                                            : 'bg-transparent border-white/20'
                                    }`}
                            >
                                {/* Checkmark for completed steps */}
                                {i < stepIndex && (
                                    <span className="text-[10px] text-white font-bold">✓</span>
                                )}
                            </div>

                            {/* Step label */}
                            <span
                                className={`mt-2 text-[10px] font-bold uppercase tracking-wider leading-tight transition-colors duration-500 ${i <= stepIndex ? 'text-gray-300' : 'text-gray-600'
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Status Message — cycles through descriptive text */}
                <h2 className="text-xl font-medium text-white mb-6 h-8 animate-pulse">
                    {LOADING_MESSAGES[messageIndex]}
                </h2>

                {/* Progress bar container */}
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-violet-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Subtitle */}
                <p className="text-xs text-gray-400 uppercase tracking-[0.25em] font-bold mt-2">
                    Powered by Groq LLaMA 3.3 70B
                </p>
            </div>
        </div>
    );
}

export default LoadingScreen;
