import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { HiChat, HiCalendar, HiHeart, HiUsers, HiShieldCheck, HiLightningBolt } from 'react-icons/hi';

const features = [
  { icon: HiChat, title: 'AI Companion', desc: 'Talk to MindMate AI anytime – empathetic, supportive, and always available.', color: 'from-primary-500 to-primary-700' },
  { icon: HiCalendar, title: 'Book Counselling', desc: 'Schedule sessions with certified counsellors. Go anonymous if you prefer.', color: 'from-mint-500 to-mint-700' },
  { icon: HiHeart, title: 'Mood Tracking', desc: 'Track your daily mood and well-being with beautiful visualizations.', color: 'from-coral-400 to-coral-600' },
  { icon: HiUsers, title: 'Peer Support', desc: 'Connect with fellow students anonymously. You\'re not alone.', color: 'from-purple-500 to-purple-700' },
  { icon: HiShieldCheck, title: '100% Private', desc: 'Your data is encrypted. No tracking. Completely confidential.', color: 'from-blue-500 to-blue-700' },
  { icon: HiLightningBolt, title: 'Crisis Support', desc: 'Immediate crisis resources when you need them most.', color: 'from-coral-500 to-red-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

/* Animated counter for stats */
function AnimatedStat({ value, label }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
      className="text-center"
    >
      <div className="text-2xl sm:text-3xl font-extrabold gradient-text">{value}</div>
      <div className="text-sm text-dark-500 dark:text-dark-400 mt-1 font-medium">{label}</div>
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated organic background blobs */}
        <div className="absolute inset-0 gradient-bg" />
        <div className="blob-primary w-[400px] h-[400px] top-10 -right-20 animate-blob opacity-20" />
        <div className="blob-amber w-[500px] h-[500px] -bottom-20 -left-32 animate-blob-slow opacity-15" style={{ animationDelay: '-3s' }} />
        <div className="blob-mint w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob opacity-10" style={{ animationDelay: '-6s' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-24 pb-16">
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2.5 bg-primary-500/8 dark:bg-primary-500/15 px-4 py-2 rounded-full mb-8 border border-primary-200/30 dark:border-primary-800/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500" />
              </span>
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">Always here for you</span>
            </div>
          </motion.div>

          {/* Hero Title — word-by-word reveal */}
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="block"
            >
              Your Mental Health
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="block gradient-text"
            >
              Companion
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg sm:text-xl text-dark-500 dark:text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            MindMate is your private, AI-powered mental health support platform built for college students. 
            Chat, track, connect, and thrive — anytime, anywhere.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="btn-primary text-lg !py-4 !px-8 w-full sm:w-auto">
              Start Your Journey →
            </Link>
            <Link to="/login" className="btn-ghost text-lg !py-4 !px-8 border border-dark-200/60 dark:border-dark-700/60 rounded-xl w-full sm:w-auto">
              Sign In
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto"
          >
            <AnimatedStat value="24/7" label="AI Support" />
            <AnimatedStat value="100%" label="Private" />
            <AnimatedStat value="Free" label="For Students" />
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-50 dark:from-dark-950 to-transparent" />
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
              Everything you need to <span className="gradient-text">feel supported</span>
            </h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-xl mx-auto leading-relaxed">
              Comprehensive mental health tools designed with empathy, backed by science, and built for your campus life.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="glass-card card-hover group"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-dark-500 dark:text-dark-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center glass-card !py-12 !px-8 relative overflow-hidden"
        >
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-500/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-amber-500/5 translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">It's okay to not be okay.</h2>
            <p className="text-dark-500 dark:text-dark-400 mb-8 max-w-lg mx-auto leading-relaxed">
              Taking the first step is the hardest. MindMate makes it easier. Start a conversation today – no judgement, complete privacy.
            </p>
            <Link to="/register" className="btn-primary inline-block text-lg !py-4 !px-8">
              Get Started – It's Free
            </Link>
            <p className="text-xs text-dark-400 mt-6 font-medium">
              🆘 In crisis? Call <strong className="text-coral-500">988</strong> or text HOME to <strong className="text-coral-500">741741</strong>
            </p>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-dark-200/50 dark:border-dark-800/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="font-bold gradient-text">MindMate</span>
          </div>
          <p className="text-sm text-dark-500 font-medium">© 2026 MindMate. Your privacy is our priority.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-dark-500 hover:text-primary-600 transition-colors font-medium">Privacy</a>
            <a href="#" className="text-sm text-dark-500 hover:text-primary-600 transition-colors font-medium">Terms</a>
            <a href="#" className="text-sm text-dark-500 hover:text-primary-600 transition-colors font-medium">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
