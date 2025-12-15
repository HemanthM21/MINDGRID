import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'

export default function Landing({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

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
    const handleScroll = () => setScrolled(window.scrollY > 50)
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
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
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
      description: 'Advanced text extraction from images and scanned documents.',
    },
    {
      icon: '🤖',
      title: 'AI Categorization',
      description: 'Automatically categorize documents using AI.',
    },
    {
      icon: '⚡',
      title: 'Task Generation',
      description: 'Auto-generate actionable tasks and reminders.',
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Track insights about your documents.',
    },
    {
      icon: '🔒',
      title: 'Secure Storage',
      description: 'Bank-level encryption to protect your documents.',
    },
    {
      icon: '🔔',
      title: 'Smart Reminders',
      description: 'Get notified before document deadlines.',
    }
  ]

  const steps = [
    { title: 'Upload Documents', description: 'Drag and drop or select files', icon: '📤' },
    { title: 'AI Analysis', description: 'AI extracts and categorizes info', icon: '🧠' },
    { title: 'Auto-Organize', description: 'Documents sorted automatically', icon: '🗂️' },
    { title: 'Stay Informed', description: 'Receive reminders & insights', icon: '✨' }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      avatar: '👩‍💼',
      rating: 5,
      text: 'MindGrid has transformed how I manage business documents!'
    },
    {
      name: 'Michael Chen',
      role: 'Freelancer',
      avatar: '👨‍🎨',
      rating: 5,
      text: 'I never miss deadlines anymore — reminders are a lifesaver!'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Healthcare Professional',
      avatar: '👩‍⚕️',
      rating: 5,
      text: 'OCR accuracy is phenomenal, saves me hours each week.'
    }
  ]

  return (
    <div className="landing-container" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Navbar (NO LOGO ANYMORE) */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="nav-bar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          transition: 'all 0.3s ease',
          padding: '16px 0'
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '0 40px' }}>

          {/* Removed Logo Section */}
          <div style={{ fontSize: 26, fontWeight: 800, color: '#764ba2' }}>MindGrid</div>

          {/* Menu */}
          <div style={{ display: 'flex', gap: 20 }}>
            <button onClick={() => scrollToSection('hero')} className="nav-btn">Home</button>
            <button onClick={() => scrollToSection('features')} className="nav-btn">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="nav-btn">How It Works</button>
            <button onClick={() => scrollToSection('testimonials')} className="nav-btn">Testimonials</button>

            <button onClick={() => onNavigate('login')} className="nav-btn-outline">Login</button>
            <button onClick={() => onNavigate('signup')} className="nav-btn-fill">Sign Up</button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section (Removed big logo image entirely) */}
      <section id="hero" ref={heroRef} style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', padding: '60px 24px' }}>
        <motion.div style={{ y: heroY, opacity: heroOpacity, maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          <h1 style={{ fontSize: 56, fontWeight: 800, background: 'linear-gradient(135deg, #2d3748, #764ba2)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            Never Lose Track of Important Documents Again
          </h1>

          <p style={{ fontSize: 18, color: '#718096' }}>
            MindGrid uses AI + OCR to organize, analyze, and categorize your documents smartly.
          </p>

          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={() => onNavigate('signup')} className="btn-primary">Get Started →</button>
            <button onClick={() => scrollToSection('features')} className="btn-outline">Learn More</button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="stats" ref={statsRef} style={{ padding: '80px 24px', background: '#f7fafc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30 }}>
          {stats.map((s, i) => (
            <motion.div key={i} animate={statsInView ? { opacity: 1, y: 0 } : {}} initial={{ opacity: 0, y: 20 }}
              style={{ background: 'white', padding: 30, borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 44, fontWeight: 800 }}>{s.value}{s.suffix}</div>
              <div>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" ref={featuresRef} style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30 }}>
          {features.map((f, i) => (
            <motion.div key={i} animate={featuresInView ? { opacity: 1 } : {}} initial={{ opacity: 0 }}
              style={{ background: 'white', padding: 30, borderRadius: 16 }}>
              <div style={{ fontSize: 40 }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section id="how-it-works" ref={stepsRef} style={{ padding: '80px 24px', background: '#f7fafc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {steps.map((s, i) => (
            <motion.div key={i} animate={stepsInView ? { opacity: 1, x: 0 } : {}} initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              style={{ display: 'flex', gap: 30, marginBottom: 40 }}>
              <div style={{ fontSize: 50 }}>{s.icon}</div>
              <div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTestimonial} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}
              style={{ background: 'white', padding: 40, borderRadius: 20 }}>
              <div style={{ fontSize: 50 }}>{testimonials[activeTestimonial].avatar}</div>
              <p>"{testimonials[activeTestimonial].text}"</p>
              <h4>{testimonials[activeTestimonial].name}</h4>
              <small>{testimonials[activeTestimonial].role}</small>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Footer — REMOVED LOGO */}
      <footer style={{ background: '#2d3748', padding: 40, textAlign: 'center', color: 'white' }}>
        <h3 style={{ marginBottom: 10 }}>MindGrid</h3>
        <p>AI-Powered Document Management</p>
        <small>© 2024 MindGrid. All rights reserved.</small>
      </footer>

    </div>
  )
}
