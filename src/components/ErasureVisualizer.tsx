'use client';

import React, { useState, useEffect } from 'react';
import { transformCode } from '@/app/actions';
import { TransformationStep } from '@/lib/transformer';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Code, Layers, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import CodeBlock from './CodeBlock';
import ShikiEditor from './ShikiEditor';

const DEFAULT_CODE = `interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const john: User = { name: "John", age: 30 };
console.log(greet(john));`;

export default function ErasureVisualizer() {
    const [inputCode, setInputCode] = useState(DEFAULT_CODE);
    const [steps, setSteps] = useState<TransformationStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        handleTransform();
    }, []);

    const handleTransform = async () => {
        setIsLoading(true);
        try {
            const result = await transformCode(inputCode);
            setSteps(result);
            setCurrentStepIndex(0);
        } catch (error) {
            console.error("Transformation failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentStepIndex((prev) => {
                    if (prev < steps.length - 1) {
                        return prev + 1;
                    } else {
                        setIsPlaying(false);
                        return prev;
                    }
                });
            }, 1500); // 1.5s per step
        }
        return () => clearInterval(interval);
    }, [isPlaying, steps.length]);

    const isComplete = currentStepIndex === steps.length - 1;
    const currentStep = steps[currentStepIndex];

    return (
        <div className="flex flex-col h-screen bg-neutral-950 text-white p-6 gap-6 font-sans">
            <header className="flex flex-col gap-2">
                <h1 className="text-xl font-medium text-neutral-200">
                    Watch TypeScript transform into JavaScript! Click play or step through to see what gets erased.
                </h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Input Section */}
                <div className="flex flex-col gap-2 bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-900/50">
                        <span className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                            <Code size={16} />
                            Input TypeScript
                        </span>
                        <button
                            onClick={handleTransform}
                            className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md transition-colors font-medium"
                        >
                            Update
                        </button>
                    </div>
                    <ShikiEditor
                        value={inputCode}
                        onChange={setInputCode}
                        className="flex-1 bg-transparent text-neutral-300"
                    />
                </div>

                {/* Visualizer Section */}
                <div className="flex flex-col bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden relative">
                    {/* Visualizer Header */}
                    <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-900/50">
                        <div className="flex items-center gap-2 text-blue-400 font-medium">
                            <Code size={16} />
                            <span>Type Erasure Visualizer</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-500 text-sm font-mono">
                            <Layers size={16} />
                            <span>{steps.length > 0 ? currentStepIndex + 1 : 0} / {steps.length}</span>
                        </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center gap-4 p-4 border-b border-neutral-800 bg-neutral-900/30">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 transition-colors"
                        >
                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                        </button>

                        {/* Progress Bar */}
                        <div className="flex-1 relative flex items-center">
                            {/* Background Line */}
                            <div className="absolute left-0 right-0 h-1 bg-neutral-800 rounded-full" />

                            {/* Active Line */}
                            <div
                                className="absolute left-0 h-1 bg-neutral-600 rounded-full transition-all duration-300"
                                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                            />

                            {/* Dots */}
                            <div className="relative w-full flex justify-between">
                                {steps.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setCurrentStepIndex(idx);
                                            setIsPlaying(false);
                                        }}
                                        className={clsx(
                                            "w-3 h-3 rounded-full border-2 transition-all duration-300 z-10",
                                            idx <= currentStepIndex
                                                ? "bg-neutral-600 border-neutral-600"
                                                : "bg-neutral-900 border-neutral-700 hover:border-neutral-500"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setCurrentStepIndex(0);
                                setIsPlaying(false);
                            }}
                            className="p-2 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 transition-colors"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>

                    {/* Code Area */}
                    <div className="flex-1 relative overflow-hidden">
                        <div className="absolute inset-0 overflow-auto">
                            {isLoading ? (
                                <div className="h-full flex items-center justify-center text-neutral-500">
                                    Processing...
                                </div>
                            ) : (
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={currentStepIndex}
                                        initial={{ opacity: 0.8 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                        className="h-full"
                                    >
                                        <CodeBlock code={currentStep?.code || "No code"} lang="typescript" />
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Completion Overlay */}
                        <AnimatePresence>
                            {isComplete && !isPlaying && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="absolute bottom-6 right-6 left-6 md:left-auto md:w-96 bg-neutral-800/90 backdrop-blur-md border border-neutral-700 p-4 rounded-xl shadow-xl z-20"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-500/20 text-green-400 rounded-full">
                                            <CheckCircle size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white mb-1">Type Erasure Complete</h3>
                                            <p className="text-sm text-neutral-300 leading-relaxed">
                                                All TypeScript-specific syntax vanishes during compilation.
                                                This is called <span className="italic text-white">type erasure</span> - types exist only at compile time
                                                and are completely erased before runtime. The JavaScript engine never sees your types!
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
