import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Activity, Terminal } from 'lucide-react';

export default function DetailModal({ item, onClose }) {
  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(4, 2, 1, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '20px'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(10, 6, 3, 0.95)',
            border: '1px solid var(--a)',
            clipPath: 'polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)',
            padding: '32px 36px',
            textAlign: 'center',
            maxWidth: '480px',
            width: '100%',
            boxShadow: 'var(--glow), 0 0 60px rgba(198, 185, 176, 0.3)',
            position: 'relative'
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              color: 'var(--a)',
              cursor: 'pointer',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
          >
            <X size={18} />
          </button>

          {/* Icon */}
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '1px solid var(--a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--a2)',
            boxShadow: 'var(--glow-s)'
          }}>
            <ShieldCheck size={24} />
          </div>

          <h2 style={{
            fontSize: '22px',
            fontWeight: 900,
            letterSpacing: '6px',
            color: 'var(--a3)',
            textShadow: 'var(--glow)',
            marginBottom: '6px'
          }}>
            {item.name || 'SYSTEM DATA'}
          </h2>

          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '9px',
            letterSpacing: '3px',
            color: 'var(--a)',
            opacity: 0.7,
            marginBottom: '20px'
          }}>
            ROLE: {item.role || 'CREW OPERATIVE'}
          </div>

          {/* TELEMETRY BOX */}
          <div style={{
            background: 'rgba(198, 185, 176, 0.04)',
            border: '1px solid rgba(198, 185, 176, 0.2)',
            padding: '16px',
            textAlign: 'left',
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: 'var(--a2)',
            lineHeight: 1.8,
            letterSpacing: '1px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--a)', fontSize: '9px', opacity: 0.8 }}>
              <Terminal size={12} /> SPECIALIZATION / PROTOCOL
            </div>
            <div>{item.spec || 'Standard orbital assignment & telemetry verification.'}</div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '12px', fontSize: '9px', opacity: 0.65 }}>
              <span>LAT: {item.lat || '0.00'}</span>
              <span>CODE: {item.code || 'ENRL'}</span>
              <span style={{ color: '#00d464' }}>STATUS: ONLINE</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            style={{
              fontFamily: 'var(--font)',
              fontSize: '10px',
              letterSpacing: '4px',
              background: 'var(--a)',
              color: '#080502',
              border: 'none',
              padding: '10px 32px',
              cursor: 'pointer',
              boxShadow: 'var(--glow)',
              fontWeight: 700,
              clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)'
            }}
          >
            DISMISS TELEMETRY
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
