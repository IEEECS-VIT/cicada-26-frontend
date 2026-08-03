import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SpaceCanvas from './components/SpaceCanvas.jsx';
import Navbar from './components/Navbar.jsx';
import HudPanel from './components/HudPanel.jsx';
import CrewManifest, { CREW_DATA } from './components/CrewManifest.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import LaunchOverlay from './components/LaunchOverlay.jsx';
import DetailModal from './components/DetailModal.jsx';
import { Rocket, ShieldAlert } from 'lucide-react';

export default function App() {
  const [selectedCrewId, setSelectedCrewId] = useState('cooper');
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [missionStatus, setMissionStatus] = useState('AWAITING_INPUT');

  const handleLaunchInit = () => {
    setIsLaunching(true);
    setMissionStatus('WARP_SEQUENCE_ACTIVE');
  };

  const handleLaunchComplete = () => {
    setIsLaunching(false);
    setMissionStatus('ORBIT_ESTABLISHED');
  };

  const handleTeamCodeClick = () => {
    setActiveModalItem({
      name: 'TEAM CODE: CICADA-2067',
      role: 'SYSTEM ACCESS CREDENTIAL',
      spec: 'Encrypted Quantum Handshake Protocol for Orbital Station Access.',
      lat: '0.00',
      code: 'VERIFIED'
    });
  };

  return (
    <>
      {/* 3D Three.js Interactive Starfield & Dust Background */}
      <SpaceCanvas isLaunching={isLaunching} />

      {/* CRT Scanline FX */}
      <div className="scanlines" />

      {/* Corner HUD Frame Indicators */}
      <div className="corner-frame cf-tl" />
      <div className="corner-frame cf-tr" />
      <div className="corner-frame cf-bl" />
      <div className="corner-frame cf-br" />

      {/* Fixed Micro Telemetry Labels */}
      <div id="stat-bl" className="fixed-micro">
        LAT: 0.00<br />
        STATUS: NORMAL
      </div>
      <div id="stat-br" className="fixed-micro">
        STATUS: {missionStatus}
      </div>
      <div id="side-l" className="fixed-micro">
        BLINKINGS DISCOVER
      </div>
      <div id="side-r" className="fixed-micro">
        ENDURANCE - SYSTEM ONLINE
      </div>

      {/* Animated Top Navbar */}
      <Navbar onSelectSection={(sec) => console.log('Section:', sec)} />

      {/* Main HUD Centered Layout */}
      <main className="app-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            width: 'min(75vw, 700px)',
            margin: '0 auto'
          }}
        >
          {/* SHIP HEADER PANEL */}
          <HudPanel delay={0.2} style={{ width: '100%', textAlign: 'center', padding: '16px 30px' }}>
            <div style={{ fontSize: '7.5px', letterSpacing: '4px', color: 'var(--a)', opacity: 0.65, marginBottom: '6px' }}>
              SYS READY
            </div>
            <div style={{
              fontSize: 'clamp(18px, 3vw, 28px)',
              fontWeight: 900,
              letterSpacing: '8px',
              color: 'var(--a3)',
              textShadow: 'var(--glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <span style={{ fontSize: '18px', color: 'var(--a)', opacity: 0.7 }}>—✛—</span>
              ENDURANCE — 01
              <span style={{ fontSize: '18px', color: 'var(--a)', opacity: 0.7 }}>—✛—</span>
            </div>
            <div style={{ fontSize: '7.5px', letterSpacing: '3px', color: 'var(--a)', opacity: 0.55, marginTop: '6px' }}>
              SYS READY · HULL NOMINAL · ALL SYSTEMS GO
            </div>
          </HudPanel>

          {/* TEAM CODE PANEL */}
          <HudPanel
            delay={0.3}
            onClick={handleTeamCodeClick}
            style={{ width: '100%', textAlign: 'center', padding: '14px 20px' }}
          >
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '14px',
              display: 'flex',
              gap: '4px'
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--a)', boxShadow: '0 0 4px var(--a)' }} />
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--a)', opacity: 0.6 }} />
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--a)', opacity: 0.3 }} />
            </div>
            <div style={{ fontSize: '7.5px', letterSpacing: '4px', color: 'var(--a)', opacity: 0.7 }}>
              TEAM CODE
            </div>
            <div style={{
              fontSize: 'clamp(16px, 2.5vw, 24px)',
              fontWeight: 900,
              letterSpacing: '6px',
              color: 'var(--a3)',
              textShadow: 'var(--glow-s)',
              marginTop: '4px'
            }}>
              TEAM CODE
            </div>
          </HudPanel>

          {/* CREW MANIFEST GRID */}
          <CrewManifest
            selectedId={selectedCrewId}
            onSelectCrew={setSelectedCrewId}
            onOpenDetails={(member) => setActiveModalItem(member)}
          />

          {/* PROGRESS BAR */}
          <ProgressBar total={14} active={8} label="MISSION PHASE: 02 · ORBITAL APPROACH" />

          {/* LAUNCH BUTTON */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              width: '100%'
            }}
          >
            <motion.button
              whileHover={{ scale: 1.03, translateY: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLaunchInit}
              style={{
                position: 'relative',
                background: 'rgba(12, 8, 4, 0.85)',
                border: '1px solid var(--a)',
                clipPath: 'polygon(14px 0%, calc(100% - 14px) 0%, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0% calc(100% - 14px), 0% 14px)',
                color: 'var(--a3)',
                fontFamily: 'var(--font)',
                fontSize: 'clamp(14px, 2vw, 20px)',
                fontWeight: 900,
                letterSpacing: '8px',
                padding: '18px 40px',
                cursor: 'pointer',
                boxShadow: 'var(--glow), inset 0 0 30px rgba(198, 185, 176, 0.08)',
                textShadow: 'var(--glow)',
                width: '100%',
                maxWidth: '400px',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <Rocket size={20} />
              <span>INITIALIZE LAUNCH</span>
            </motion.button>

            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '8px',
              letterSpacing: '3px',
              color: 'var(--a)',
              opacity: 0.55
            }}>
              MISSION STATUS: {missionStatus}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Warp Launch Countdown & Speed Effect */}
      <LaunchOverlay
        isLaunching={isLaunching}
        onComplete={handleLaunchComplete}
      />

      {/* Telemetry Detail Modal */}
      <DetailModal
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
      />
    </>
  );
}
