import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Shield, HelpCircle, Users, LogIn } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'HOME', icon: Home },
  { id: 'about', label: 'ABOUT', icon: Shield },
  { id: 'faqs', label: 'FAQS', icon: HelpCircle },
  { id: 'team', label: 'TEAM', icon: Users },
  { id: 'login', label: 'LOGIN', icon: LogIn },
];

export default function Navbar({ onSelectSection }) {
  const [activeTab, setActiveTab] = useState('home');

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onSelectSection) onSelectSection(id);
  };

  return (
    <motion.nav
      id="top-nav"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '54px',
        background: 'rgba(6, 4, 3, 0.88)',
        borderBottom: '1px solid rgba(198, 185, 176, 0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      {/* BRAND / LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{
            width: '34px',
            height: '34px',
            border: '1px solid rgba(198, 185, 176, 0.4)',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(198, 185, 176, 0.2)',
            flexShrink: 0,
            cursor: 'pointer'
          }}
        >
          <img src="/cicada_logo.jpg.jpeg" alt="CICADA Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </motion.div>

        <div style={{ lineHeight: 1 }}>
          <div style={{
            fontFamily: 'var(--font)',
            fontSize: '13px',
            fontWeight: 900,
            letterSpacing: '4px',
            color: 'var(--a2)',
            textShadow: 'var(--glow-s)'
          }}>
            CICADA 2067
          </div>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '8px',
            letterSpacing: '3px',
            color: 'var(--a)',
            opacity: 0.55,
            marginTop: '3px'
          }}>
            LISTEN. ADAPT. SURVIVE.
          </div>
        </div>
      </div>

      {/* NAV LINKS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginLeft: 'auto',
        marginRight: '24px'
      }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font)',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '3px',
                color: isActive ? '#D4A359' : '#9A8C82',
                opacity: isActive ? 1 : 0.8,
                cursor: 'pointer',
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                textShadow: isActive ? '0 0 8px rgba(212, 163, 89, 0.4)' : 'none'
              }}
            >
              <Icon size={12} opacity={isActive ? 1 : 0.7} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '0',
                    right: '0',
                    height: '2px',
                    background: '#D4A359',
                    boxShadow: '0 0 8px #D4A359'
                  }}
                />
              )}
            </motion.button>
          );
        })}

        {/* DISCORD BUTTON */}
        <motion.a
          href="https://discord.com"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            border: '1px solid #D4A359',
            color: '#D4A359',
            padding: '6px 18px',
            borderRadius: '2px',
            textDecoration: 'none',
            fontFamily: 'var(--font)',
            fontSize: '9px',
            fontWeight: 900,
            letterSpacing: '3px',
            background: 'rgba(212, 163, 89, 0.05)',
            boxShadow: '0 0 10px rgba(212, 163, 89, 0.15)',
            marginLeft: '8px'
          }}
        >
          DISCORD
        </motion.a>
      </div>

      {/* NAV END */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.45 }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="9,1 17,5 17,13 9,17 1,13 1,5" stroke="#C6B9B0" strokeWidth="1.2" fill="none" />
        </svg>
      </div>
    </motion.nav>
  );
}
