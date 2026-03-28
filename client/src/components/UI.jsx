import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

/* ═══════════════════════════════════════
   COUNT-UP HOOK — Animates numbers
   ═══════════════════════════════════════ */
function useCountUp(end, duration = 1200, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!startOnView || !inView) return;
    const numEnd = typeof end === 'number' ? end : parseInt(end);
    if (isNaN(numEnd) || numEnd === 0) { setCount(end); return; }

    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(eased * numEnd));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, inView, startOnView]);

  return { count, ref };
}

/* ═══════════════════════════════════════
   ANIMATED SECTION — Scroll-triggered reveal
   ═══════════════════════════════════════ */
export function AnimatedSection({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   LOADING SPINNER
   ═══════════════════════════════════════ */
export function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizes[size]} border-2 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin`} />
    </div>
  );
}

/* ═══════════════════════════════════════
   PAGE LOADER — Premium morphing animation
   ═══════════════════════════════════════ */
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Breathing ring */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-primary-500/20 animate-breathe" />
          <div className="absolute inset-1 rounded-2xl bg-primary-500/10 animate-breathe" style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
        </div>
        <p className="text-dark-400 text-sm font-medium tracking-wide">Loading...</p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SKELETON CARD
   ═══════════════════════════════════════ */
export function SkeletonCard() {
  return (
    <div className="glass-card animate-pulse space-y-3">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-5/6 rounded" />
      <div className="flex gap-2 pt-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════ */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-dark-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-dark-700 dark:text-dark-300 mb-2">{title}</h3>
      <p className="text-dark-500 dark:text-dark-400 max-w-md mx-auto mb-6">{description}</p>
      {action}
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   STAT CARD — With count-up animation
   ═══════════════════════════════════════ */
export function StatCard({ label, value, icon: Icon, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'from-primary-500 to-primary-700',
    mint: 'from-mint-500 to-mint-700',
    coral: 'from-coral-400 to-coral-600',
    purple: 'from-purple-500 to-purple-700',
    red: 'from-red-500 to-red-600',
  };

  const glowMap = {
    primary: 'shadow-primary-500/20',
    mint: 'shadow-mint-500/20',
    coral: 'shadow-coral-500/20',
    purple: 'shadow-purple-500/20',
    red: 'shadow-red-500/20',
  };

  const isNumber = typeof value === 'number';
  const { count, ref } = useCountUp(isNumber ? value : 0, 1000);

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card card-hover"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-1 font-medium">{label}</p>
          <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
            {isNumber ? count : value}
          </h3>
          {trend && (
            <p className={`text-xs mt-1.5 font-medium ${trend > 0 ? 'text-primary-500' : 'text-coral-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} ${glowMap[color]} shadow-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   FLOATING BLOBS — Animated background
   ═══════════════════════════════════════ */
export function FloatingBlobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="blob-primary w-72 h-72 -top-20 -right-20 animate-blob" />
      <div className="blob-amber w-96 h-96 top-1/3 -left-32 animate-blob-slow" style={{ animationDelay: '-4s' }} />
      <div className="blob-mint w-64 h-64 bottom-10 right-1/4 animate-blob" style={{ animationDelay: '-2s' }} />
    </div>
  );
}
