import { useState, useEffect } from 'react';

/**
 * Full-screen loading screen that provides feedback during the AI analysis process.
 * Features a 4-step stepper, cycling messages, a timed progress bar, and premium dark theme styling.
 */

const steps = [
    { label: 'Fetching GitHub Profile', message: 'Reading your GitHub profile...' },
    { label: 'Reading Repositories', message: 'Scanning your repositories & READMEs...' },
    { label: 'Running AI Analysis', message: 'Mapping your developer profile...' },
    { label: 'Building Your Report', message: 'Generating career insights...' },
];

function LoadingScreen() {
    const [currentStep, setCurrentStep] = useState(0);

    /**
     * Auto-advance the stepper every ~4 seconds as originally implemented.
     * We preserve the timing logic while switching to the new steps array.
     */
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col items-center justify-center gap-10 px-6">
            {/* Background ambient glow for premium feel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Animated spinner - improved */}
            <div className="relative w-24 h-24">
                {/* Outer ring - slow rotate */}
                <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" style={{ animationDuration: '1.2s' }} />
                {/* Inner ring - counter rotate */}
                <div className="absolute inset-3 rounded-full border border-transparent border-b-cyan-400 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                </div>
            </div>

            {/* Step progress timeline */}
            <div className="flex items-start gap-0 relative">
                {steps.map((step, i) => (
                    <div key={i} className="flex flex-col items-center relative">
                        {/* Connector line */}
                        {i < steps.length - 1 && (
                            <div className="absolute top-[14px] left-[50%] w-[120px] md:w-[160px] h-[2px] z-0">
                                <div className="w-full h-full bg-white/10 rounded" />
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded transition-all duration-700"
                                    style={{ width: currentStep > i ? '100%' : '0%' }}
                                />
                            </div>
                        )}

                        {/* Step dot */}
                        <div className={`
                relative z-10 w-7 h-7 rounded-full flex items-center justify-center
                border-2 transition-all duration-500
                ${currentStep > i
                                ? 'bg-blue-500 border-blue-500 shadow-[0_0_12px_rgba(96,165,250,0.6)]'
                                : currentStep === i
                                    ? 'bg-transparent border-blue-400 animate-pulse'
                                    : 'bg-transparent border-white/20'
                            }
              `}>
                            {currentStep > i
                                ? <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                : currentStep === i
                                    ? <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    : <div className="w-2 h-2 rounded-full bg-white/20" />
                            }
                        </div>

                        {/* Step label */}
                        <p className={`
                mt-3 text-[10px] tracking-widest uppercase text-center w-[100px] md:w-[130px]
                transition-colors duration-300
                ${currentStep >= i ? 'text-white/70' : 'text-white/25'}
              `}>
                            {step.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Dynamic status message */}
            <div className="flex flex-col items-center gap-4">
                <p className="text-white/80 text-lg font-light tracking-wide animate-pulse">
                    {steps[currentStep]?.message || 'Finalizing...'}
                </p>

                {/* Progress bar */}
                <div className="w-[280px] md:w-[380px] h-[3px] bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Bottom label - replacing "Powered By" */}
            <p className="text-[10px] tracking-[0.3em] text-white/25 uppercase">
                Analysis by Groq LLaMA 3.3 70B
            </p>

        </div>
    );
}

export default LoadingScreen;
