import React from 'react';
import { motion } from 'framer-motion';

export const CREW_DATA = [
  { id: 'cooper', name: 'COOPER', role: 'PILOT / COMMANDER', lat: '0.00', status: 'SYS READY', code: 'ENRL', spec: 'Aero Dynamics & Manual Orbital Maneuvers' },
  { id: 'brand', name: 'BRAND', role: 'CHIEF SCIENTIST', lat: '0.00', status: 'SYS READY', code: 'ENRL', spec: 'Exoplanetary Biology & Quantum Gravity' },
  { id: 'murph', name: 'MURPH', role: 'ASTROPHYSICIST', lat: '0.00', status: 'SYS READY', code: 'ENRL', spec: 'Gravitational Anomaly Telemetry' },
  { id: 'doyle', name: 'DOYLE', role: 'MISSION SPECIALIST', lat: '0.00', status: 'SYS READY', code: 'ENRL', spec: 'Surface Operations & EVA Security' },
  { id: 'case', name: 'CASE', role: 'TACTICAL AI UNIT', lat: '0.00', status: 'SYS READY', code: 'ENRL', spec: '90% Honesty / 100% Reliability Matrix' },
  { id: 'tars', name: 'TARS', role: 'SECURITY AI UNIT', lat: '0.00', status: 'SYS READY', code: 'ENRL', spec: '90% Humor / Defensive Actuation' }
];

export default function CrewManifest({ selectedId, onSelectCrew, onOpenDetails }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 25 } }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      {/* SECTION TITLE */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '8px',
          color: 'var(--a2)',
          textShadow: 'var(--glow-s)',
          position: 'relative',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <span style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, transparent, var(--a))' }} />
        CREW MANIFEST
        <span style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, var(--a), transparent)' }} />
      </motion.div>

      {/* CREW GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          width: '100%'
        }}
      >
        {CREW_DATA.map((member) => {
          const isSelected = selectedId === member.id;
          return (
            <motion.div
              key={member.id}
              variants={itemVariants}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSelectCrew(member.id);
                onOpenDetails(member);
              }}
              style={{
                position: 'relative',
                background: isSelected ? 'rgba(25, 16, 9, 0.85)' : 'rgba(8, 5, 2, 0.65)',
                border: isSelected ? '1px solid var(--a3)' : '1px solid rgba(198, 185, 176, 0.45)',
                clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)',
                padding: '10px 16px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: isSelected
                  ? '0 0 15px #C6B9B0, 0 0 35px rgba(198, 185, 176, 0.35), inset 0 0 20px rgba(198, 185, 176, 0.15)'
                  : 'none',
                transition: 'all 0.25s ease'
              }}
            >
              {/* Corner ticks */}
              <div style={{
                position: 'absolute',
                top: '3px',
                left: '3px',
                width: '8px',
                height: '8px',
                borderTop: '1px solid var(--a2)',
                borderLeft: '1px solid var(--a2)'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '3px',
                right: '3px',
                width: '8px',
                height: '8px',
                borderBottom: '1px solid var(--a2)',
                borderRight: '1px solid var(--a2)'
              }} />

              {/* CARD TOP META */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--mono)',
                fontSize: '7.5px',
                color: 'var(--a)',
                opacity: 0.65,
                letterSpacing: '1px',
                marginBottom: '6px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  LAT: {member.lat}
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#00d464',
                      boxShadow: '0 0 6px #00d464',
                      display: 'inline-block'
                    }}
                  />
                </span>
                <span>{member.status}</span>
              </div>

              {/* CARD NAME */}
              <div style={{
                fontSize: 'clamp(13px, 1.8vw, 17px)',
                fontWeight: 900,
                letterSpacing: '4px',
                color: isSelected ? 'var(--a3)' : 'var(--a2)',
                textShadow: isSelected ? 'var(--glow)' : 'var(--glow-s)',
                textAlign: 'center',
                padding: '4px 0'
              }}>
                {member.name}
              </div>

              {/* CARD BOTTOM META */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--mono)',
                fontSize: '7.5px',
                color: 'var(--a)',
                opacity: 0.6,
                letterSpacing: '1px',
                marginTop: '6px'
              }}>
                <span>STATUS: {member.code}</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--a)', opacity: 1 }} />
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--a)', opacity: 0.6 }} />
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--a)', opacity: 0.3 }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
