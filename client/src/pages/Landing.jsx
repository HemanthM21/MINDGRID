import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'

export default function Landing({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const featuresRef = useRef(null)
  const stepsRef = useRef(null)

  const statsInView = useInView(statsRef, { once: true, margin: "-100px" })
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const stepsInView = useInView(stepsRef, { once: true, margin: "-100px" })

  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 200])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileMenuOpen(false)
    }
  }

  const stats = [
    { value: 10000, label: 'Documents Processed', suffix: '+' },
    { value: 99, label: 'Accuracy Rate', suffix: '%' },
    { value: 5000, label: 'Active Users', suffix: '+' },
    { value: 24, label: 'Support Available', suffix: '/7' }
  ]

  const features = [
    {
      icon: '📄',
      title: 'Smart OCR',
      description: 'Advanced text extraction from images and scanned documents with 99% accuracy. Simply upload and let us handle the rest.',
      gradient: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)'
    },
    {
      icon: '🤖',
      title: 'AI Categorization',
      description: 'Automatically categorize documents using Google\'s Gemini AI. Detects bills, IDs, medical records, and more.',
      gradient: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)'
    },
    {
      icon: '⚡',
      title: 'Task Generation',
      description: 'Auto-generate actionable tasks and reminders. Never miss a payment due date or document expiry again.',
      gradient: 'linear-gradient(135deg, #764ba2 0%, #00f2fe 100%)'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Beautiful analytics and insights at a glance. Track your document types, priorities, and upcoming deadlines.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      icon: '🔒',
      title: 'Secure Storage',
      description: 'Bank-level encryption ensures your sensitive documents are always protected and accessible only to you.',
      gradient: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)'
    },
    {
      icon: '🔔',
      title: 'Smart Reminders',
      description: 'Get notified before important deadlines. AI analyzes your documents and sets up intelligent reminders.',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    }
  ]

  const steps = [
    { title: 'Upload Documents', description: 'Drag and drop or select files from your device', icon: '📤' },
    { title: 'AI Analysis', description: 'Our AI extracts and categorizes information', icon: '🧠' },
    { title: 'Auto-Organize', description: 'Documents are automatically organized and tagged', icon: '🗂️' },
    { title: 'Stay Informed', description: 'Get reminders and insights about your documents', icon: '✨' }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      avatar: '👩‍💼',
      rating: 5,
      text: 'MindGrid has transformed how I manage my business documents. The AI categorization is incredibly accurate!'
    },
    {
      name: 'Michael Chen',
      role: 'Freelance Designer',
      avatar: '👨‍🎨',
      rating: 5,
      text: 'I never miss a deadline anymore. The smart reminders feature is a game-changer for my workflow.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Healthcare Professional',
      avatar: '👩‍⚕️',
      rating: 5,
      text: 'Managing patient records has never been easier. The OCR accuracy is phenomenal, saving me hours every week.'
    }
  ]

  return (
    <div className="landing-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Animated Background Particles */}
      <div className="particles-bg">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [null, Math.random() * -500, Math.random() * 500],
              x: [null, Math.random() * -200, Math.random() * 200],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              borderRadius: '50%',
              background: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
        ))}
      </div>

      {/* Sticky Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="nav-bar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.1)' : 'none',
          transition: 'all 0.3s ease',
          padding: '16px 0'
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px' }}>
          <motion.div
            className="logo"
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection('hero')}
            style={{ fontSize: 24, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <span style={{ background: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>MindGrid</span>
          </motion.div>

          {/* Desktop Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Navigation Links */}
            <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 8px 20px rgba(118, 75, 162, 0.35)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('hero')}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(118, 75, 162, 0.25)'
                }}
              >
                Home
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 8px 20px rgba(118, 75, 162, 0.35)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('features')}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(118, 75, 162, 0.25)'
                }}
              >
                Features
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 8px 20px rgba(118, 75, 162, 0.35)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('how-it-works')}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(118, 75, 162, 0.25)',
                  whiteSpace: 'nowrap'
                }}
              >
                How It Works
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 8px 20px rgba(118, 75, 162, 0.35)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('testimonials')}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(118, 75, 162, 0.25)'
                }}
              >
                Testimonials
              </motion.button>
            </nav>

            {/* Auth Buttons */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginLeft: 16 }}>

              {/* Login Button */}
              <motion.button
                whileHover={{
                  scale: 1.05,
                  borderColor: '#764ba2',
                  boxShadow: '0 4px 12px rgba(118, 75, 162, 0.2)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('login')}
                style={{
                  padding: '10px 28px',
                  borderRadius: 10,
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  color: '#2d3748',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
              >
                Login
              </motion.button>

              {/* Sign Up Button */}
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 12px 35px rgba(118, 75, 162, 0.4)',
                  transform: 'translateY(-2px)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('signup')}
                style={{
                  padding: '10px 28px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(118, 75, 162, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                Sign Up →
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      < section id="hero" ref={heroRef} className="hero" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative', padding: '80px 24px' }
      }>
        <motion.div
          className="hero-content"
          style={{ y: heroY, opacity: heroOpacity, maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}
        >
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.1) 0%, rgba(138, 92, 90, 0.1) 100%)',
                  borderRadius: 50,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#764ba2',
                  marginBottom: 24,
                  border: '1px solid rgba(118, 75, 162, 0.2)'
                }}
              >
                ✨ AI-Powered Document Management
              </motion.span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                fontSize: 56,
                lineHeight: 1.2,
                marginBottom: 24,
                background: 'linear-gradient(135deg, #2d3748 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800
              }}
            >
              Never Lose Track of Important Documents Again
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{ fontSize: 18, lineHeight: 1.8, color: '#718096', marginBottom: 40 }}
            >
              MindGrid combines OCR technology with artificial intelligence to automatically organize, categorize, and analyze your documents. Transform chaos into clarity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{ display: 'flex', gap: 16, marginBottom: 40 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(118, 75, 162, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('signup')}
                style={{
                  padding: '16px 40px',
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(118, 75, 162, 0.3)'
                }}
              >
                Get Started Free →
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, background: 'rgba(118, 75, 162, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('features')}
                style={{
                  padding: '16px 40px',
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 12,
                  background: 'transparent',
                  border: '2px solid #764ba2',
                  color: '#764ba2',
                  cursor: 'pointer'
                }}
              >
                Learn More
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              style={{ display: 'flex', gap: 32, alignItems: 'center', color: '#718096', fontSize: 14 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>⭐⭐⭐⭐⭐</span>
                <span>5.0 Rating</span>
              </div>
              <div>✓ Free Forever Plan</div>
              <div>✓ No Credit Card</div>
            </motion.div>
          </div>

          {/* Hero Image with Animations */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ position: 'relative' }}
            >
              {/* 3D Logo as Hero Image */}
              <motion.img
                whileHover={{ scale: 1.1, rotate: 0 }}
                src="/mindgrid_3d_logo.png"
                alt="MindGrid 3D Logo"
                style={{
                  width: '100%',
                  maxWidth: 450,
                  height: 'auto',
                  filter: 'drop-shadow(0 30px 60px rgba(118, 75, 162, 0.4))',
                  transition: 'all 0.3s ease'
                }}
              />

              {/* Floating Notification Cards - Clean Triangle Layout (3 Cards Only) */}

              {/* Top Right Corner - Success Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 50, y: -50 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -15, 0],
                  x: [0, 10, 0]
                }}
                transition={{
                  opacity: { duration: 0.5, delay: 1 },
                  scale: { duration: 0.5, delay: 1 },
                  y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0 },
                  x: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0 }
                }}
                style={{
                  position: 'absolute',
                  top: '-15%',
                  right: '-25%',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0fff4 100%)',
                  padding: '16px 24px',
                  borderRadius: 20,
                  boxShadow: '0 15px 50px rgba(118, 75, 162, 0.35)',
                  border: '2px solid rgba(118, 75, 162, 0.3)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#764ba2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  backdropFilter: 'blur(10px)',
                  zIndex: 10,
                  minWidth: 200
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  color: 'white',
                  flexShrink: 0
                }}>
                  ✓
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>Success</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Document Uploaded</div>
                </div>
              </motion.div>

              {/* Bottom Right Corner - AI Processing Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 50, y: 50 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, 15, 0],
                  x: [0, 12, 0]
                }}
                transition={{
                  opacity: { duration: 0.5, delay: 1.3 },
                  scale: { duration: 0.5, delay: 1.3 },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
                  x: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
                }}
                style={{
                  position: 'absolute',
                  bottom: '-12%',
                  right: '-28%',
                  background: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)',
                  padding: '16px 24px',
                  borderRadius: 20,
                  boxShadow: '0 15px 50px rgba(102, 126, 234, 0.45)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  zIndex: 10,
                  minWidth: 200
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0
                  }}
                >
                  🤖
                </motion.div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.95, marginBottom: 2 }}>AI Analysis</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Processing...</div>
                </div>
              </motion.div>

              {/* Bottom Left Corner - Stats & Achievement Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -50, y: 50 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, 12, 0],
                  rotate: [0, -3, 3, 0]
                }}
                transition={{
                  opacity: { duration: 0.5, delay: 1.6 },
                  scale: { duration: 0.5, delay: 1.6 },
                  y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 },
                  rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.5 }
                }}
                style={{
                  position: 'absolute',
                  bottom: '-10%',
                  left: '-30%',
                  background: 'linear-gradient(135deg, #764ba2 0%, #00f2fe 100%)',
                  padding: '16px 24px',
                  borderRadius: 20,
                  boxShadow: '0 15px 50px rgba(102, 126, 234, 0.45)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  zIndex: 9,
                  minWidth: 220
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 50,
                  flexShrink: 0
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>99%</div>
                  <div style={{ fontSize: 10, opacity: 0.95, marginTop: 2 }}>Accuracy</div>
                </div>
                <div style={{
                  width: 1,
                  height: 40,
                  background: 'rgba(255,255,255,0.3)',
                  margin: '0 4px'
                }}></div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.95, marginBottom: 2 }}>Auto-Generated</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>3 Tasks Created</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 32,
            opacity: 0.5,
            cursor: 'pointer'
          }}
          onClick={() => scrollToSection('stats')}
        >
          ↓
        </motion.div>
      </section >

      {/* Stats Section */}
      < section id="stats" ref={statsRef} style={{ padding: '100px 24px', background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  padding: 40,
                  borderRadius: 20,
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={statsInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.8, delay: idx * 0.1 + 0.3, type: "spring" }}
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 12
                  }}
                >
                  {stat.value}{stat.suffix}
                </motion.div>
                <div style={{ fontSize: 14, color: '#718096', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* Features Section */}
      < section id="features" ref={featuresRef} style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <h2 style={{
              fontSize: 48,
              fontWeight: 800,
              marginBottom: 16,
              background: 'linear-gradient(135deg, #2d3748 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Powerful Features
            </h2>
            <p style={{ fontSize: 18, color: '#718096', maxWidth: 600, margin: '0 auto' }}>
              Everything you need to manage your documents intelligently
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{
                  y: -10,
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                  scale: 1.02
                }}
                style={{
                  background: 'white',
                  padding: 32,
                  borderRadius: 20,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 16,
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    marginBottom: 20,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#2d3748' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: 15, color: '#718096', lineHeight: 1.7 }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* How It Works Section */}
      < section id="how-it-works" ref={stepsRef} style={{ padding: '100px 24px', background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <h2 style={{
              fontSize: 48,
              fontWeight: 800,
              marginBottom: 16,
              background: 'linear-gradient(135deg, #2d3748 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              How It Works
            </h2>
            <p style={{ fontSize: 18, color: '#718096' }}>
              Get started in 4 simple steps
            </p>
          </motion.div>

          <div style={{ position: 'relative' }}>
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                animate={stepsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 40,
                  marginBottom: 60,
                  flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse'
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    minWidth: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                    boxShadow: '0 10px 40px rgba(118, 75, 162, 0.3)',
                    position: 'relative'
                  }}
                >
                  {step.icon}
                  <div style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'white',
                    color: '#764ba2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 16,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}>
                    {idx + 1}
                  </div>
                </motion.div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#2d3748' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 16, color: '#718096', lineHeight: 1.7 }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* Testimonials Section */}
      < section id="testimonials" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <h2 style={{
              fontSize: 48,
              fontWeight: 800,
              marginBottom: 16,
              background: 'linear-gradient(135deg, #2d3748 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              What Our Users Say
            </h2>
            <p style={{ fontSize: 18, color: '#718096' }}>
              Join thousands of satisfied users
            </p>
          </motion.div>

          <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: 'white',
                  padding: 48,
                  borderRadius: 24,
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 64, marginBottom: 20 }}>
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 20 }}>
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      style={{ fontSize: 24 }}
                    >
                      ⭐
                    </motion.span>
                  ))}
                </div>
                <p style={{ fontSize: 20, fontStyle: 'italic', color: '#2d3748', marginBottom: 24, lineHeight: 1.8 }}>
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#764ba2' }}>
                  {testimonials[activeTestimonial].name}
                </div>
                <div style={{ fontSize: 14, color: '#718096' }}>
                  {testimonials[activeTestimonial].role}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32 }}>
              {testimonials.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  whileHover={{ scale: 1.2 }}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: idx === activeTestimonial ? '#764ba2' : '#cbd5e0',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section >

      {/* Final CTA Section */}
      < section style={{
        padding: '100px 24px',
        background: 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <motion.div
          animate={{
            background: [
              'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)',
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        />

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ fontSize: 48, fontWeight: 800, color: 'white', marginBottom: 24 }}
          >
            Ready to Transform Your Document Management?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.9)', marginBottom: 40, lineHeight: 1.7 }}
          >
            Join thousands of users who have already simplified their lives with MindGrid
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{
              scale: 1.1,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('signup')}
            style={{
              padding: '20px 60px',
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 12,
              background: 'white',
              color: '#764ba2',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            Start Free Today →
          </motion.button>
        </div>
      </section >

      {/* Footer */}
      < footer style={{ padding: '40px 24px', background: '#2d3748', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            MindGrid
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: 24 }}>
            Intelligent Document Management for Everyone
          </p>
          <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)' }}>
            © 2024 MindGrid. All rights reserved.
          </div>
        </div>
      </footer >
    </div >
  )
}




