import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Hold for 1.6s then start fade-out
    const hold  = setTimeout(() => setLeaving(true), 1600)
    // Notify parent after fade-out completes (400ms)
    const done  = setTimeout(onDone, 2000)
    return () => { clearTimeout(hold); clearTimeout(done) }
  }, [onDone])

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{
            position: 'fixed', inset: 0,
            background: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          {/* Logo fades + scales in */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {/* Green dot */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                width: 13, height: 13,
                borderRadius: '50%',
                background: '#60fcc6',
                boxShadow: '0 0 14px rgba(96,252,198,0.75)',
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
            {/* Wordmark */}
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 36, fontWeight: 800,
                letterSpacing: '-0.04em',
                color: '#1c2e51',
                lineHeight: 1,
              }}
            >
              Seatr
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
