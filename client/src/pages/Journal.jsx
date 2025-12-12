import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Journal = () => {
    const [journalContent, setJournalContent] = useState('');
    const [selectedMood, setSelectedMood] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiInsights, setAiInsights] = useState(null);
    const [wordCount, setWordCount] = useState(0);
    const [savedEntries, setSavedEntries] = useState([]);
    const [activeTab, setActiveTab] = useState('write');

    const moods = [
        { emoji: '😊', label: 'Happy', value: 'happy', gradient: 'linear-gradient(135deg, #FFD93D 0%, #FF6B9D 100%)', color: '#FF6B9D' },
        { emoji: '😐', label: 'Neutral', value: 'neutral', gradient: 'linear-gradient(135deg, #A8DADC 0%, #457B9D 100%)', color: '#457B9D' },
        { emoji: '😔', label: 'Sad', value: 'sad', gradient: 'linear-gradient(135deg, #6C757D 0%, #495057 100%)', color: '#495057' },
        { emoji: '😰', label: 'Stressed', value: 'stressed', gradient: 'linear-gradient(135deg, #FF6B6B 0%, #C92A2A 100%)', color: '#C92A2A' },
        { emoji: '😤', label: 'Frustrated', value: 'frustrated', gradient: 'linear-gradient(135deg, #FA5252 0%, #E03131 100%)', color: '#E03131' },
        { emoji: '⚡', label: 'Energetic', value: 'energetic', gradient: 'linear-gradient(135deg, #51CF66 0%, #37B24D 100%)', color: '#37B24D' }
    ];

    const getMockInsights = () => ({
        mood: 'Energetic',
        moodScore: 8,
        stressLevel: 'Medium',
        energyLevel: 'High',
        workload: 'High',
        personalityInsight: "You are a highly driven individual with strong ambitions and a proactive mindset. Your writing reveals someone who values achievement and personal growth, yet you're also mindful of maintaining balance in your life.",
        patterns: {
            strengths: [
                "Strong work ethic and dedication to goals",
                "Self-aware and reflective about your emotions",
                "Proactive in seeking solutions to challenges"
            ],
            areasForGrowth: [
                "Tendency to take on too much at once",
                "May benefit from more structured breaks",
                "Could delegate tasks more effectively"
            ]
        },
        priorities: ['Complete project', 'Team meeting', 'Exercise'],
        suggestions: [
            {
                category: 'Productivity',
                icon: '⚡',
                text: 'Based on your energy patterns, schedule your most important tasks between 9-11 AM when you\'re at peak performance.',
                priority: 'high'
            },
            {
                category: 'Well-being',
                icon: '🧘',
                text: 'Your stress levels have been elevated. Consider implementing a 5-minute meditation break every 2 hours to maintain balance.',
                priority: 'high'
            },
            {
                category: 'Work-Life Balance',
                icon: '⚖️',
                text: 'You\'re taking on a lot. Try delegating 2-3 tasks this week to prevent burnout and maintain your high energy levels.',
                priority: 'medium'
            },
            {
                category: 'Personal Growth',
                icon: '🌱',
                text: 'Your reflective nature is a strength. Keep journaling daily to track your progress and celebrate small wins.',
                priority: 'low'
            }
        ]
    });

    const handleContentChange = (e) => {
        const text = e.target.value;
        setJournalContent(text);
        setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
    };

    const handleSaveEntry = async () => {
        if (!journalContent.trim()) {
            alert('Please write something in your journal first!');
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/journal/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    content: journalContent,
                    quickMood: selectedMood,
                    date: new Date()
                })
            });

            const data = await response.json();
            const insights = data.aiAnalysis || getMockInsights();
            setAiInsights(insights);

            // Save to local entries
            const newEntry = {
                id: Date.now(),
                content: journalContent,
                mood: selectedMood,
                date: new Date().toISOString(),
                insights: insights
            };
            setSavedEntries(prev => [newEntry, ...prev]);
            alert('Journal entry saved successfully!');
        } catch (error) {
            console.error('Error saving journal:', error);
            const insights = getMockInsights();
            setAiInsights(insights);

            // Save to local entries even on error
            const newEntry = {
                id: Date.now(),
                content: journalContent,
                mood: selectedMood,
                date: new Date().toISOString(),
                insights: insights
            };
            setSavedEntries(prev => [newEntry, ...prev]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGetInsights = async () => {
        if (!journalContent.trim()) {
            alert('Please write something in your journal first!');
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/journal/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    content: journalContent
                })
            });

            const data = await response.json();
            setAiInsights(data || getMockInsights());
        } catch (error) {
            console.error('Error getting insights:', error);
            setAiInsights(getMockInsights());
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderInsightsPanel = (insights) => {
        if (!insights) {
            return (
                <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#718096'
                    }}
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: 64, marginBottom: 20 }}
                    >
                        🧠
                    </motion.div>
                    <p style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 500 }}>
                        Write your thoughts and let AI provide personalized insights
                    </p>
                </motion.div>
            );
        }

        return (
            <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
                {/* Current State */}
                <div style={{
                    padding: 20,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                    borderRadius: 16,
                    border: '2px solid rgba(118, 75, 162, 0.2)'
                }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#764ba2', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>📊</span> Current State
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, color: '#4a5568', fontWeight: 600 }}>Mood</span>
                            <div style={{
                                padding: '6px 14px',
                                borderRadius: 10,
                                background: 'linear-gradient(135deg, #51CF66 0%, #37B24D 100%)',
                                color: 'white',
                                fontSize: 13,
                                fontWeight: 700
                            }}>
                                {insights.mood} ({insights.moodScore}/10)
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, color: '#4a5568', fontWeight: 600 }}>Stress</span>
                            <div style={{
                                padding: '6px 14px',
                                borderRadius: 10,
                                background: 'linear-gradient(135deg, #FFD93D 0%, #FF6B9D 100%)',
                                color: 'white',
                                fontSize: 13,
                                fontWeight: 700
                            }}>
                                {insights.stressLevel}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, color: '#4a5568', fontWeight: 600 }}>Energy</span>
                            <div style={{
                                padding: '6px 14px',
                                borderRadius: 10,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontSize: 13,
                                fontWeight: 700
                            }}>
                                {insights.energyLevel}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personality Understanding */}
                {insights.personalityInsight && (
                    <div style={{
                        padding: 20,
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 140, 0, 0.1) 100%)',
                        borderRadius: 16,
                        border: '2px solid rgba(255, 165, 0, 0.2)'
                    }}>
                        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#D97706', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>👤</span> Who You Are
                        </h4>
                        <p style={{
                            fontSize: 14,
                            lineHeight: 1.7,
                            color: '#2d3748',
                            margin: 0,
                            fontWeight: 500
                        }}>
                            {insights.personalityInsight}
                        </p>
                    </div>
                )}

                {/* Behavioral Patterns */}
                {insights.patterns && (
                    <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#2d3748', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>🔍</span> Behavioral Patterns
                        </h4>

                        {insights.patterns.strengths && insights.patterns.strengths.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: '#059669',
                                    marginBottom: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                }}>
                                    <span style={{ fontSize: 16 }}>✨</span> Your Strengths
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {insights.patterns.strengths.map((strength, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            style={{
                                                padding: '10px 14px',
                                                background: 'rgba(16, 185, 129, 0.08)',
                                                borderRadius: 10,
                                                fontSize: 13,
                                                color: '#065F46',
                                                fontWeight: 500,
                                                borderLeft: '3px solid #10B981'
                                            }}
                                        >
                                            {strength}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {insights.patterns.areasForGrowth && insights.patterns.areasForGrowth.length > 0 && (
                            <div>
                                <div style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: '#7C3AED',
                                    marginBottom: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                }}>
                                    <span style={{ fontSize: 16 }}>🎯</span> Growth Opportunities
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {insights.patterns.areasForGrowth.map((area, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            style={{
                                                padding: '10px 14px',
                                                background: 'rgba(124, 58, 237, 0.08)',
                                                borderRadius: 10,
                                                fontSize: 13,
                                                color: '#5B21B6',
                                                fontWeight: 500,
                                                borderLeft: '3px solid #7C3AED'
                                            }}
                                        >
                                            {area}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Priorities */}
                {insights.priorities && insights.priorities.length > 0 && (
                    <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#2d3748', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>🎯</span> Top Priorities
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {insights.priorities.map((priority, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    style={{
                                        padding: '12px 16px',
                                        background: 'rgba(102, 126, 234, 0.08)',
                                        borderRadius: 12,
                                        fontSize: 14,
                                        color: '#2d3748',
                                        fontWeight: 500,
                                        borderLeft: '4px solid #764ba2'
                                    }}
                                >
                                    {priority}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Personalized Suggestions */}
                {insights.suggestions && insights.suggestions.length > 0 && (
                    <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#2d3748', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>💡</span> Personalized Suggestions
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {insights.suggestions.map((suggestion, index) => {
                                const priorityColors = {
                                    high: { bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444', text: '#991B1B' },
                                    medium: { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', text: '#92400E' },
                                    low: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3B82F6', text: '#1E40AF' }
                                };
                                const colors = priorityColors[suggestion.priority] || priorityColors.medium;

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.15 }}
                                        style={{
                                            padding: '16px',
                                            background: 'white',
                                            borderRadius: 14,
                                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                                            border: `2px solid ${colors.border}20`,
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: 4,
                                            height: '100%',
                                            background: colors.border
                                        }} />

                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginLeft: 8 }}>
                                            <div style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 10,
                                                background: colors.bg,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 18,
                                                flexShrink: 0
                                            }}>
                                                {suggestion.icon}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    color: colors.text,
                                                    marginBottom: 6,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {suggestion.category}
                                                </div>
                                                <p style={{
                                                    fontSize: 13,
                                                    color: '#4a5568',
                                                    lineHeight: 1.6,
                                                    margin: 0,
                                                    fontWeight: 500
                                                }}>
                                                    {suggestion.text}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '60px 20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
                opacity: 0.1,
                pointerEvents: 'none'
            }}>
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.random() * 50 - 25, 0],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                        style={{
                            position: 'absolute',
                            width: Math.random() * 100 + 50,
                            height: Math.random() * 100 + 50,
                            borderRadius: '50%',
                            background: 'white',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            filter: 'blur(40px)'
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    maxWidth: 1400,
                    margin: '0 auto',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* Header with Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 24,
                        padding: '32px 40px',
                        marginBottom: 40,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{
                                fontSize: 48,
                                fontWeight: 900,
                                color: 'white',
                                marginBottom: 8,
                                letterSpacing: '-1px',
                                textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                            }}>
                                ✨ Daily Journal
                            </h1>
                            <p style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                                Reflect, grow, and let AI guide your journey
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('write')}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: activeTab === 'write' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    fontSize: 15,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: activeTab === 'write' ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none'
                                }}
                            >
                                ✍️ Write
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('history')}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: activeTab === 'history' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    fontSize: 15,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: activeTab === 'history' ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
                                    position: 'relative'
                                }}
                            >
                                📚 History
                                {savedEntries.length > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: -8,
                                        right: -8,
                                        background: '#FF6B9D',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: 24,
                                        height: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 11,
                                        fontWeight: 800
                                    }}>
                                        {savedEntries.length}
                                    </span>
                                )}
                            </motion.button>

                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 28,
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                🧠
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Content based on active tab */}
                <AnimatePresence mode="wait">
                    {activeTab === 'write' ? (
                        <motion.div
                            key="write"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1.5fr 1fr',
                                gap: 30
                            }}
                        >
                            {/* Left Column - Writing Area */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {/* Mood Selector */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(20px)',
                                        WebkitBackdropFilter: 'blur(20px)',
                                        borderRadius: 20,
                                        padding: 28,
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                                        border: '1px solid rgba(255, 255, 255, 0.8)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 12,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 20
                                        }}>
                                            💭
                                        </div>
                                        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', margin: 0 }}>
                                            How are you feeling?
                                        </h3>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: 12
                                    }}>
                                        {moods.map((mood) => (
                                            <motion.button
                                                key={mood.value}
                                                whileHover={{ scale: 1.05, y: -4 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedMood(mood.value)}
                                                style={{
                                                    padding: '16px',
                                                    borderRadius: 16,
                                                    border: selectedMood === mood.value ? `3px solid ${mood.color}` : '3px solid transparent',
                                                    background: selectedMood === mood.value ? mood.gradient : 'rgba(0, 0, 0, 0.03)',
                                                    color: selectedMood === mood.value ? 'white' : '#2d3748',
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    boxShadow: selectedMood === mood.value ? `0 8px 24px ${mood.color}40` : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {selectedMood === mood.value && (
                                                    <motion.div
                                                        layoutId="mood-indicator"
                                                        style={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            width: 20,
                                                            height: 20,
                                                            borderRadius: '50%',
                                                            background: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: 12
                                                        }}
                                                    >
                                                        ✓
                                                    </motion.div>
                                                )}
                                                <span style={{ fontSize: 32 }}>{mood.emoji}</span>
                                                <span style={{ fontSize: 13 }}>{mood.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Journal Editor */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(20px)',
                                        WebkitBackdropFilter: 'blur(20px)',
                                        borderRadius: 20,
                                        padding: 32,
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                                        border: '1px solid rgba(255, 255, 255, 0.8)',
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 12,
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 20
                                            }}>
                                                ✍️
                                            </div>
                                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', margin: 0 }}>
                                                Today's Entry
                                            </h3>
                                        </div>
                                        <div style={{
                                            padding: '8px 16px',
                                            borderRadius: 12,
                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: '#764ba2'
                                        }}>
                                            {wordCount} words
                                        </div>
                                    </div>

                                    <textarea
                                        value={journalContent}
                                        onChange={handleContentChange}
                                        placeholder="Pour your heart out... What made you smile today? What challenges did you face? What are you grateful for?"
                                        style={{
                                            width: '100%',
                                            flex: 1,
                                            minHeight: 450,
                                            padding: 24,
                                            fontSize: 16,
                                            lineHeight: 1.8,
                                            border: '2px solid transparent',
                                            borderRadius: 16,
                                            resize: 'none',
                                            fontFamily: 'inherit',
                                            color: '#2d3748',
                                            outline: 'none',
                                            background: 'rgba(0, 0, 0, 0.02)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#764ba2';
                                            e.target.style.background = 'white';
                                            e.target.style.boxShadow = '0 0 0 4px rgba(118, 75, 162, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'transparent';
                                            e.target.style.background = 'rgba(0, 0, 0, 0.02)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />

                                    {/* Action Buttons */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 16,
                                        marginTop: 24
                                    }}>
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSaveEntry}
                                            disabled={isAnalyzing}
                                            style={{
                                                padding: '18px 32px',
                                                borderRadius: 14,
                                                border: 'none',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                fontSize: 16,
                                                fontWeight: 700,
                                                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 8px 24px rgba(118, 75, 162, 0.4)',
                                                opacity: isAnalyzing ? 0.7 : 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 10
                                            }}
                                        >
                                            <span style={{ fontSize: 20 }}>{isAnalyzing ? '⏳' : '💾'}</span>
                                            {isAnalyzing ? 'Saving...' : 'Save & Analyze'}
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleGetInsights}
                                            disabled={isAnalyzing}
                                            style={{
                                                padding: '18px 32px',
                                                borderRadius: 14,
                                                border: '3px solid #764ba2',
                                                background: 'white',
                                                color: '#764ba2',
                                                fontSize: 16,
                                                fontWeight: 700,
                                                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.3s ease',
                                                opacity: isAnalyzing ? 0.7 : 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 10,
                                                boxShadow: '0 4px 16px rgba(118, 75, 162, 0.15)'
                                            }}
                                        >
                                            <span style={{ fontSize: 20 }}>{isAnalyzing ? '⏳' : '🤖'}</span>
                                            {isAnalyzing ? 'Analyzing...' : 'Get Insights'}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right Column - AI Insights */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    borderRadius: 20,
                                    padding: 32,
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                                    border: '1px solid rgba(255, 255, 255, 0.8)',
                                    position: 'sticky',
                                    top: 20,
                                    maxHeight: 'calc(100vh - 100px)',
                                    overflowY: 'auto'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        marginBottom: 24
                                    }}>
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 14,
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 24,
                                                boxShadow: '0 4px 16px rgba(118, 75, 162, 0.3)'
                                            }}
                                        >
                                            🤖
                                        </motion.div>
                                        <div>
                                            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#2d3748', margin: 0 }}>
                                                AI Insights
                                            </h3>
                                            <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
                                                Personalized for you
                                            </p>
                                        </div>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {renderInsightsPanel(aiInsights)}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                borderRadius: 20,
                                padding: 40,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                                border: '1px solid rgba(255, 255, 255, 0.8)',
                                minHeight: 600
                            }}
                        >
                            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748', marginBottom: 24 }}>
                                📚 Journal History
                            </h2>

                            {savedEntries.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#718096' }}>
                                    <div style={{ fontSize: 64, marginBottom: 20 }}>📝</div>
                                    <p style={{ fontSize: 18, fontWeight: 500 }}>
                                        No saved entries yet. Start writing to see your journal history!
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    {savedEntries.map((entry, index) => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            style={{
                                                padding: 24,
                                                background: 'white',
                                                borderRadius: 16,
                                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                                                border: '2px solid rgba(118, 75, 162, 0.1)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ fontSize: 24 }}>
                                                        {moods.find(m => m.value === entry.mood)?.emoji || '📝'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#2d3748' }}>
                                                            {new Date(entry.date).toLocaleDateString('en-US', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                        <div style={{ fontSize: 13, color: '#718096' }}>
                                                            {new Date(entry.date).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                {entry.insights && (
                                                    <div style={{
                                                        padding: '6px 12px',
                                                        borderRadius: 8,
                                                        background: 'linear-gradient(135deg, #51CF66 0%, #37B24D 100%)',
                                                        color: 'white',
                                                        fontSize: 12,
                                                        fontWeight: 700
                                                    }}>
                                                        {entry.insights.mood} {entry.insights.moodScore}/10
                                                    </div>
                                                )}
                                            </div>

                                            <p style={{
                                                fontSize: 15,
                                                lineHeight: 1.7,
                                                color: '#4a5568',
                                                marginBottom: 16,
                                                maxHeight: 100,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {entry.content}
                                            </p>

                                            {entry.insights && entry.insights.personalityInsight && (
                                                <div style={{
                                                    padding: 16,
                                                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 140, 0, 0.1) 100%)',
                                                    borderRadius: 12,
                                                    border: '1px solid rgba(255, 165, 0, 0.2)'
                                                }}>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#D97706', marginBottom: 8 }}>
                                                        👤 AI Insight
                                                    </div>
                                                    <p style={{ fontSize: 13, color: '#2d3748', margin: 0, lineHeight: 1.6 }}>
                                                        {entry.insights.personalityInsight.substring(0, 150)}...
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Journal;
