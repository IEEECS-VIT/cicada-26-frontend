import React from 'react';
import { motion } from 'framer-motion';

export default function HudPanel({ children, className = '', style = {}, delay = 0, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={onClick ? { scale: 1.01, translateY: -2 } : {}}
      onClick={onClick}
      className={`hud-panel ${className}`}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {children}
    </motion.div>
  );
}
