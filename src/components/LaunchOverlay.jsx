import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function LaunchOverlay({ isLaunching, onComplete, onCancel }) {
  const [count, setCount] = useState(5);
  const [stage, setStage] = useState('countdown'); // 'countdown' | 'warp'

  useEffect(() => {
    if (!isLaunching) {
      setCount(5);
      setStage('countdown');
      return;
    }

    if (stage === 'countdown') {
      if (count > 0) {
        const timer = setTimeout(() => setCount((prev) => prev - 1), 900);
        return () => clearTimeout(timer);
      } else {
        setStage('warp');
        // Trigger celebratory sci-fi particle burst
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#C6B9B0', '#E8DDD5', '#FFF8F2', '#64D2FF']
        });
      }
    } else if (stage === 'warp') {
      const autoReturnTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);
      return () => clearTimeout(autoReturnTimer);
    }
  }, [isLaunching, count, stage, onComplete]);

  if (!isLaunching) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(4, 2, 1, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        {stage === 'countdown' ? (
          <div style={{ textAlign: 'center' }}>
            <motion.div
              key={count}
              initial={{ scale: 1.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
              style={{
                fontFamily: 'var(--font)',
                fontSize: 'clamp(80px, 15vw, 160px)',
                fontWeight: 900,
                color: 'var(--a3)',
                textShadow: '0 0 30px #C6B9B0, 0 0 80px rgba(198, 185, 176, 0.6)',
                lineHeight: 1
              }}
            >
              {count}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                letterSpacing: '4px',
                color: 'var(--a)',
                marginTop: '16px'
              }}
            >
              WARP DRIVE CHARGING · STABILIZING GRAVITY VECTOR
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center', padding: '0 20px' }}
          >
            <motion.div
              animate={{ textShadow: ['0 0 20px #C6B9B0', '0 0 60px #E8DDD5', '0 0 20px #C6B9B0'] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                fontFamily: 'var(--font)',
                fontSize: 'clamp(24px, 4vw, 42px)',
                fontWeight: 900,
                letterSpacing: '8px',
                color: 'var(--a3)',
                marginBottom: '16px'
              }}
            >
              WARP DRIVES ENGAGED
            </motion.div>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              letterSpacing: '3px',
              color: '#00d464',
              marginBottom: '32px'
            }}>
              STATUS: HYPERSPACE TRAJECTORY ACQUIRED
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              style={{
                background: 'var(--a)',
                color: '#080502',
                border: 'none',
                fontFamily: 'var(--font)',
                fontSize: '11px',
                fontWeight: 900,
                letterSpacing: '4px',
                padding: '14px 36px',
                cursor: 'pointer',
                clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)'
              }}
            >
              RETURN TO MISSION COMMAND
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
