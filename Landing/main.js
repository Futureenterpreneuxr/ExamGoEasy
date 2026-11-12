(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* 1. Release the hero entrance once the font is ready (or after 1.2s at most) */
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    root.classList.add('ready');
    document.querySelectorAll('.hero [data-reveal]').forEach((el) => el.classList.add('in'));
    autoTick();
  };
  const hold = root.classList.contains('has-intro') ? 1150 : 0; // wait for the intro to lift
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(start, hold));
  setTimeout(start, 1200 + hold);

  /* 2. Entrances for the parts of each section, once, as they enter */
  const parts = document.querySelectorAll('[data-reveal]:not(.hero [data-reveal])');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    parts.forEach((el) => io.observe(el));
  } else {
    parts.forEach((el) => el.classList.add('in'));
  }

  /* 3. Curtain footer: it sits behind the page, so reveal its parts
        once the page has lifted enough to show the first of them */
  const reply = document.querySelector('.reply');
  const back = document.querySelectorAll('.back__panel, .giant');
  let ticking = false;
  const checkCurtain = () => {
    ticking = false;
    const shown = innerHeight - reply.getBoundingClientRect().bottom;
    if (shown < 120) return;
    back.forEach((el, i) => { el.style.setProperty('--i', i); el.classList.add('in'); });
    removeEventListener('scroll', onScroll);
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(checkCurtain);
  };
  addEventListener('scroll', onScroll, { passive: true });
  checkCurtain();

  /* 4. The answer sheet ticks itself, one row at a time.
        Visitors can tick or untick any row; their choice is never overwritten. */
  const rows = document.querySelectorAll('.task');
  rows.forEach((row) => {
    row.addEventListener('click', () => {
      row.dataset.touched = '1';
      row.setAttribute('aria-checked', row.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
      updateStamp();
    });
  });

  function autoTick() {
    const auto = [...rows].filter((r) => r.hasAttribute('data-auto'));
    const tick = (row) => {
      if (!row.dataset.touched) row.setAttribute('aria-checked', 'true');
      updateStamp();
    };
    if (reduced) { auto.forEach(tick); return; }
    auto.forEach((row, i) => setTimeout(() => tick(row), 1000 + i * 650));
  }

  /* 5. Gentle tilt on the sheet, mouse only, decorative */
  const sheet = document.querySelector('[data-tilt]');
  const hero = document.querySelector('.hero');
  if (sheet && hero && fineHover && !reduced) {
    let raf = 0;
    hero.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const x = (e.clientX / innerWidth - 0.5) * 2;
        const y = (e.clientY / innerHeight - 0.5) * 2;
        sheet.style.setProperty('--ry', (x * 4).toFixed(2) + 'deg');
        sheet.style.setProperty('--rx', (-y * 3).toFixed(2) + 'deg');
      });
    });
    hero.addEventListener('pointerleave', () => {
      sheet.style.setProperty('--ry', '0deg');
      sheet.style.setProperty('--rx', '0deg');
    });
  }

  /* 6. A "Graded" stamp lands on the sheet once every row is ticked, and lifts if one is unticked.
        Built here (not in the HTML) because it only exists as a result of the visitor's ticks. */
  const tasks = document.querySelector('.tasks');
  let stamp = null;
  function updateStamp() {
    if (!tasks || !sheet) return;
    const all = [...rows].every((r) => r.getAttribute('aria-checked') === 'true');
    if (all && !stamp) {
      stamp = document.createElement('div');
      stamp.setAttribute('aria-hidden', 'true');
      stamp.textContent = 'Graded';
      Object.assign(stamp.style, {
        position: 'absolute', zIndex: '2', right: '8%', pointerEvents: 'none',
        top: Math.round(tasks.offsetTop + tasks.offsetHeight * 0.3) + 'px',
        padding: '8px 20px', background: 'var(--paper)', color: 'var(--teal)',
        border: '4px solid var(--teal)', transform: 'rotate(-8deg)',
        font: '500 1.75rem/1 "Hanken Grotesk", system-ui, sans-serif', letterSpacing: '-0.02em',
      });
      sheet.appendChild(stamp);
      if (stamp.animate && !reduced) {
        stamp.animate(
          [{ opacity: 0, transform: 'rotate(-8deg) scale(1.5)' }, { opacity: 1, transform: 'rotate(-8deg) scale(1)' }],
          { duration: 320, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
        );
      }
    } else if (!all && stamp) {
      const old = stamp;
      stamp = null;
      if (old.animate && !reduced) old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150 }).onfinish = () => old.remove();
      else old.remove();
    }
  }

  /* 7. Hours calculator: sliders update the number, which counts to its new value */
  const calc = document.querySelector('.calc');
  if (calc) {
    const inputs = calc.querySelectorAll('[data-calc]');
    const outH = calc.querySelector('[data-out="hours"]');
    const outD = calc.querySelector('[data-out="days"]');
    const result = calc.querySelector('.result');
    const fmtH = (n) => (n < 10 ? n.toFixed(1) : Math.round(n).toLocaleString('en-IN'));
    const fmtD = (n) => n.toFixed(1);
    const target = () => {
      const v = {};
      inputs.forEach((i) => { v[i.dataset.calc] = Number(i.value); });
      const hours = (v.students * v.tests * v.mins) / 60;
      return { hours, days: hours / 8 };
    };
    let shown = target();
    let frame = 0;
    const paint = () => { outH.textContent = fmtH(shown.hours); outD.textContent = fmtD(shown.days); };
    const countTo = (to) => {
      cancelAnimationFrame(frame);
      if (reduced) { shown = to; paint(); return; }
      const from = shown;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / 380, 1);
        const e = 1 - Math.pow(1 - p, 3);
        shown = { hours: from.hours + (to.hours - from.hours) * e, days: from.days + (to.days - from.days) * e };
        paint();
        if (p < 1) frame = requestAnimationFrame(step);
        else result.setAttribute('aria-busy', 'false');
      };
      result.setAttribute('aria-busy', 'true');
      frame = requestAnimationFrame(step);
    };
    inputs.forEach((i) => {
      i.addEventListener('input', () => {
        i.parentElement.querySelector('output').value = i.value;
        countTo(target());
      });
    });
    paint();
    if ('IntersectionObserver' in window && !reduced) {
      const seen = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        seen.disconnect();
        const to = target();
        shown = { hours: 0, days: 0 };
        countTo(to);
      }, { threshold: 0.35 });
      seen.observe(calc);
    }
  }

  /* 8. Buttons lean a few pixels toward the mouse, mouse only */
  if (fineHover && !reduced) {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = Math.max(-6, Math.min(6, (e.clientX - (r.left + r.width / 2)) * 0.18));
        const dy = Math.max(-6, Math.min(6, (e.clientY - (r.top + r.height / 2)) * 0.18));
        btn.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
      });
      btn.addEventListener('pointerleave', () => {
        const from = btn.style.translate || '0px 0px';
        btn.style.translate = '';
        if (btn.animate) btn.animate([{ translate: from }, { translate: '0px 0px' }], { duration: 260, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
      });
    });
  }

  /* 9. The week row scrolls sideways, so make it reachable and scrollable from the keyboard */
  const days = document.querySelector('.days');
  if (days) {
    days.tabIndex = 0;
    days.setAttribute('role', 'region');
    days.setAttribute('aria-label', 'Your week, scroll sideways');
  }

  /* 10. Cursor follower: trails the mouse, becomes a tick over links, buttons and tick rows. Mouse only. */
  if (fineHover && !reduced) {
    const dot = document.createElement('div');
    dot.className = 'cursor';
    dot.setAttribute('aria-hidden', 'true');
    dot.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><use href="#tick"/></svg>';
    document.body.appendChild(dot);
    let tx = 0, ty = 0, x = 0, y = 0, running = false;
    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      dot.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
      if (Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2) requestAnimationFrame(loop);
      else running = false;
    };
    addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      tx = e.clientX; ty = e.clientY;
      if (!dot.classList.contains('is-on')) { x = tx; y = ty; dot.classList.add('is-on'); }
      dot.classList.toggle('is-link', !!(e.target.closest && e.target.closest('a, button, .task')));
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => dot.classList.remove('is-on'));
  }
})();
