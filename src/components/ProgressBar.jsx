import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ total = 14, active = 7, label = 'MISSION PHASE: 02 · ORBITAL APPROACH' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        alignItems: 'center'
      }}
    >
      <div style={{ display: 'flex', gap: '4px' }}>
        {Array.from({ length: total }).map((_, i) => {
          const isOn = i < active;
          return (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.5 + i * 0.03 }}
              style={{
                width: '18px',
                height: '8px',
                borderRadius: '1px',
                background: isOn ? 'var(--a)' : 'rgba(198, 185, 176, 0.15)',
                border: '1px solid rgba(198, 185, 176, 0.3)',
                boxShadow: isOn ? '0 0 8px var(--a)' : 'none',
                borderColor: isOn ? 'var(--a2)' : 'rgba(198, 185, 176, 0.3)',
                transition: 'background 0.3s ease, box-shadow 0.3s ease'
              }}
            />
          );
        })}
      </div>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: '8px',
        color: 'var(--a)',
        opacity: 0.6,
        letterSpacing: '2px'
      }}>
        {label}
      </div>
    </motion.div>
  );
}
