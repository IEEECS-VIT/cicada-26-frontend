(function () {
  const CONFIG = {
    userName: 'ARJUN MEHTA',
    teamName: 'NOCTURNE SIX',
    regNo: 'CC-2067-0093',
    email: 'a.mehta@cicada2067.io',
    decryptOnLoad: true,
    starDensity: 240,
    accent: '#e0a279'
  };

  const fields = [
    { k: 'v-name', v: CONFIG.userName },
    { k: 'v-team', v: CONFIG.teamName },
    { k: 'v-team-2', v: CONFIG.teamName },
    { k: 'v-reg', v: CONFIG.regNo },
    { k: 'v-mail', v: CONFIG.email }
  ];

  const statusLineEl = document.getElementById('status-line');
  const sessionIdEl = document.getElementById('session-id');
  const clockEl = document.getElementById('clock');

  document.documentElement.style.setProperty('--acc', CONFIG.accent);

  function tickClock() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    clockEl.textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }
  tickClock();
  setInterval(tickClock, 1000);

  sessionIdEl.textContent = CONFIG.regNo.slice(-4).padStart(4, '0') + '-A';

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*/';
  const READY = 'ALL SYSTEMS NOMINAL · YOU ARE CLEAR TO PROCEED';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // structural characters stay put so the string keeps its shape while scrambling
  const isFixed = ch => ch === ' ' || ch === '-' || ch === '@' || ch === '.';

  // p is how much of the string has resolved; p<=0 is fully scrambled, p>=1 is plain text
  function roll(text, p) {
    const cut = p * text.length;
    let str = '';
    for (let i = 0; i < text.length; i++) {
      str += (p >= 1 || i < cut || isFixed(text[i]))
        ? text[i]
        : chars[(Math.random() * chars.length) | 0];
    }
    return str;
  }

  const ROLL_MS = 38; // re-roll quantum, so it reads as a terminal not a 60fps blur

  // churn indefinitely; runs until resolveScramble takes over.
  // lockWidth reads offsetWidth every roll, which forces a synchronous layout, so it
  // is only worth paying for hover. Touch ends on pointerup, never on geometry.
  function holdScramble(el, text, lockWidth) {
    cancelAnimationFrame(el._raf);
    let lastRoll = 0;
    const step = now => {
      if (now - lastRoll >= ROLL_MS) {
        lastRoll = now;
        el.textContent = roll(text, 0);
        // grow-only: a narrower frame must not pull the edge out from under the
        // cursor, which would fire pointerleave and oscillate
        if (lockWidth) {
          el.style.minWidth = Math.max(parseFloat(el.style.minWidth) || 0, el.offsetWidth) + 'px';
        }
      }
      el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  function resolveScramble(el, text, dur, delay) {
    cancelAnimationFrame(el._raf);
    const start = performance.now();
    let lastRoll = 0;
    const step = now => {
      const p = Math.max(0, Math.min(1, (now - start - delay) / dur));
      if (p >= 1 || now - lastRoll >= ROLL_MS) {
        lastRoll = now;
        el.textContent = roll(text, p);
      }
      if (p < 1) el._raf = requestAnimationFrame(step);
      else { el._raf = 0; el.style.minWidth = ''; }
    };
    el._raf = requestAnimationFrame(step);
  }

  // Not gated on prefers-reduced-motion: a text scramble has no spatial movement,
  // so it isn't a vestibular trigger. reduceMotion still governs the starfield parallax.
  function runIntro() {
    statusLineEl.textContent = 'DECRYPTING CREW RECORD…';
    fields.forEach((f, i) => resolveScramble(document.getElementById(f.k), f.v, 1200, i * 170));
    // on a timer, not per-field callbacks: hovering mid-intro cancels a field's run
    // and would otherwise strand the status line on "DECRYPTING"
    setTimeout(() => { statusLineEl.textContent = READY; }, 1200 + (fields.length - 1) * 170);
  }

  // Hover-to-decrypt. Gate on the event's own pointerType rather than a media query:
  // a touch laptop reports `pointer: coarse` even with a mouse attached, which would
  // disable this entirely. pointerType reflects what was actually used, per event.
  const TAP_HOLD_MS = 380;   // churn time for a tap, since touch has no "still here"
  const TAP_SLOP_PX = 10;    // beyond this the gesture was a scroll, not a tap

  fields.forEach(f => {
    const el = document.getElementById(f.k);
    el.classList.add('cd-scramble');
    // widen the target to the whole field cell; a 17px-tall strip is hard to hit
    const target = el.closest('.cd-grid2__cell') || el;
    target.classList.add('cd-hoverable');

    target.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'touch') holdScramble(el, f.v, true);
    });
    target.addEventListener('pointerleave', e => {
      if (e.pointerType !== 'touch') resolveScramble(el, f.v, 520, 0);
    });

    // Touch has no hover, so a tap stands in for it: churn briefly, then resolve.
    // Deliberately a tap and not press-and-hold, which would collide with the native
    // long-press selection gesture on values worth copying (reg no, comms id).
    let sx = 0, sy = 0;
    target.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch') { sx = e.clientX; sy = e.clientY; }
    }, { passive: true });
    target.addEventListener('pointerup', e => {
      if (e.pointerType !== 'touch') return;
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > TAP_SLOP_PX) return; // scrolled
      clearTimeout(el._tap);
      holdScramble(el, f.v, false);
      el._tap = setTimeout(() => resolveScramble(el, f.v, 520, 0), TAP_HOLD_MS);
    }, { passive: true });
  });

  if (CONFIG.decryptOnLoad) runIntro();

  const sigilVideo = document.querySelector('.cd-sigil__video');
  if (sigilVideo) {
    // plays regardless of reduce-motion: slow local rotation, and a frozen frame
    // reads as a broken asset. Large sweeps stay suppressed in CSS instead.
    const kick = () => { const r = sigilVideo.play(); if (r) r.catch(() => {}); };
    kick();
    sigilVideo.addEventListener('canplay', kick, { once: true });
    ['pointerdown', 'keydown'].forEach(evt =>
      document.addEventListener(evt, kick, { once: true, passive: true }));
  }

  function initSky() {
    const c = document.getElementById('sky');
    if (!c) return;
    const ctx = c.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, stars = [], streaks = [], nextStreak = 900;
    const mouse = { x: 0.5, y: 0.5, cx: 0.5, cy: 0.5 };

    const build = () => {
      w = c.clientWidth || window.innerWidth;
      h = c.clientHeight || window.innerHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(CONFIG.starDensity);
      stars = [];
      for (let i = 0; i < n; i++) {
        const z = Math.random();
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: 0.35 + z * 1.25,
          ph: Math.random() * Math.PI * 2,
          sp: 0.09 + z * 0.05 + Math.random() * 0.04,
          warm: Math.random() < 0.34
        });
      }
    };

    window.addEventListener('resize', build);
    build();

    if (!reduceMotion) {
      window.addEventListener('mousemove', e => {
        mouse.x = e.clientX / window.innerWidth;
        mouse.y = e.clientY / window.innerHeight;
      });
    }

    let last = performance.now();
    const frame = now => {
      const dt = Math.min(now - last, 48);
      last = now;
      mouse.cx += (mouse.x - mouse.cx) * 0.045;
      mouse.cy += (mouse.y - mouse.cy) * 0.045;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.x -= s.sp * dt * 0.055;
        if (s.x < -4) { s.x = w + 4; s.y = Math.random() * h; }
        s.ph += dt * 0.0016;
        const tw = 0.55 + 0.45 * Math.sin(s.ph);
        const px = s.x + (mouse.cx - 0.5) * -26 * s.z;
        const py = s.y + (mouse.cy - 0.5) * -18 * s.z;
        const a = (0.18 + s.z * 0.62) * tw;
        ctx.beginPath();
        ctx.fillStyle = s.warm
          ? 'rgba(246,214,184,' + a.toFixed(3) + ')'
          : 'rgba(228,232,244,' + a.toFixed(3) + ')';
        ctx.arc(px, py, s.r, 0, 6.2832);
        ctx.fill();
        if (s.z > 0.88) {
          ctx.fillStyle = 'rgba(246,206,168,' + (a * 0.1).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(px, py, s.r * 5, 0, 6.2832);
          ctx.fill();
        }
      }

      nextStreak -= dt;
      if (nextStreak <= 0) {
        const burst = Math.random() < 0.22 ? 2 + ((Math.random() * 2) | 0) : 1;
        for (let i = 0; i < burst; i++) {
          streaks.push({
            x: w * (0.2 + Math.random() * 0.95),
            y: h * (Math.random() * 0.8 - 0.08),
            len: 70 + Math.random() * 190,
            sp: 0.32 + Math.random() * 0.5,
            slope: 0.28 + Math.random() * 0.22,
            life: -i * 220,
            dur: 720 + Math.random() * 620
          });
        }
        nextStreak = 900 + Math.random() * 2400;
      }
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.life += dt;
        if (s.life < 0) continue;
        const p = s.life / s.dur;
        if (p >= 1) { streaks.splice(i, 1); continue; }
        const ease = p < 0.4 ? p / 0.4 : (1 - p) / 0.6;
        s.x -= dt * s.sp;
        s.y += dt * s.sp * s.slope;
        const g = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y - s.len * s.slope);
        g.addColorStop(0, 'rgba(255,238,218,' + (0.8 * ease).toFixed(3) + ')');
        g.addColorStop(0.45, 'rgba(255,206,158,' + (0.3 * ease).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(255,190,140,0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.len, s.y - s.len * s.slope);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,246,232,' + (0.85 * ease).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.5, 0, 6.2832);
        ctx.fill();
      }

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }

  initSky();
})();
