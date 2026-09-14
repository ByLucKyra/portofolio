import { useEffect, useRef, useState } from 'react';
import { experienceDrafts } from './content';

const chapters = [...experienceDrafts].reverse();

export function ExperienceJourney({ reduced, disabled }: { reduced: boolean; disabled: boolean }) {
  const viewport = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const previous = useRef({ x: 0, time: 0 });
  const drag = useRef<{ x: number; scroll: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [motion, setMotion] = useState('idle');
  const [direction, setDirection] = useState(1);
  const [dragging, setDragging] = useState(false);
  const active = Math.round(progress * (chapters.length - 1));

  useEffect(() => () => clearTimeout(timer.current), []);

  function go(index: number) {
    const el = viewport.current;
    if (!el || disabled) return;
    const target = Math.max(0, Math.min(chapters.length - 1, index));
    el.scrollTo({ left: target / (chapters.length - 1) * (el.scrollWidth - el.clientWidth), behavior: reduced ? 'instant' : 'smooth' });
  }

  function onScroll() {
    const el = viewport.current!;
    const x = el.scrollLeft;
    const now = performance.now();
    const delta = x - previous.current.x;
    setProgress(Math.max(0, Math.min(1, x / Math.max(1, el.scrollWidth - el.clientWidth))));
    if (Math.abs(delta) > .1) {
      setDirection(delta > 0 ? 1 : -1);
      setMotion(Math.abs(delta) / Math.max(1, now - previous.current.time) > .8 ? 'run' : 'walk');
    }
    previous.current = { x, time: now };
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMotion('idle'), 160);
  }

  function endDrag() {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    const el = viewport.current!;
    go(Math.round(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth) * (chapters.length - 1)));
  }

  return <section className="experience-journey reveal" aria-label="Interactive experience journey">
    <div className="journey-board-top"><span>THE PATH SO FAR <b>／ 2020 — NOW</b></span><span>DRAG TO EXPLORE ↔</span></div>
    <div className="journey-world">
      <div ref={viewport} className={`journey-viewport ${dragging ? 'is-dragging' : ''}`} tabIndex={0} role="region" aria-label="Experience timeline" aria-describedby="journey-help"
        onScroll={onScroll}
        onKeyDown={event => {
          if (disabled || event.altKey || event.ctrlKey || event.metaKey) return;
          const index = event.key === 'ArrowRight' ? active + 1 : event.key === 'ArrowLeft' ? active - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? chapters.length - 1 : null;
          if (index !== null) { event.preventDefault(); go(index); }
        }}
        onPointerDown={event => {
          if (disabled || event.pointerType !== 'mouse' || event.button !== 0) return;
          drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft };
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={event => { if (drag.current) event.currentTarget.scrollLeft = drag.current.scroll + drag.current.x - event.clientX; }}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
        <ol className="journey-track" aria-label="Professional milestones — draft content">
          {chapters.map((entry, index) => <li key={entry.period} className="journey-stop" data-active={active === index} aria-current={active === index ? 'step' : undefined}>
            <span className="journey-checkpoint" aria-hidden="true"/>
            <span className="journey-stem" aria-hidden="true"/>
            <article className="journey-card">
              <div className="journey-card-top"><span>CHAPTER / 0{index + 1}</span><span>{entry.period}</span></div>
              <h2>{entry.role}</h2><p className="journey-employer">{entry.organization}</p>
              <p className="journey-card-description">{entry.description}</p>
              <ul className="technology-tags" aria-label="Technologies">{entry.technologies.map(tech => <li key={tech}>{tech}</li>)}</ul>
            </article>
          </li>)}
        </ol>
      </div>
      <div className="journey-traveler" data-motion={reduced ? 'idle' : motion} data-direction={direction} aria-hidden="true">
        <span className="traveler-tag">YOU ARE HERE</span>
        <div className="traveler-facing"><svg className="traveler-body" viewBox="0 0 80 112" fill="none">
          <g className="traveler-leg back"><path d="M38 67L29 86L31 103L42 105" stroke="#4264b5" strokeWidth="10" strokeLinejoin="round"/></g>
          <g className="traveler-arm back"><path d="M38 39L24 53L29 66" stroke="#4264b5" strokeWidth="9" strokeLinejoin="round"/></g>
          <path d="M27 36L47 32L57 66L33 72L23 60Z" fill="#132957" stroke="#85e4ff" strokeWidth="2"/>
          <path d="M28 40L21 43L20 62L30 64" fill="#386dc4" stroke="#08132d" strokeWidth="3"/>
          <g className="traveler-leg front"><path d="M43 67L49 86L45 103L56 105" stroke="#a6eaff" strokeWidth="10" strokeLinejoin="round"/><path d="M43 105H58" stroke="#fff" strokeWidth="5"/></g>
          <g className="traveler-arm front"><path d="M44 41L54 55L65 49" stroke="#78d5fa" strokeWidth="9" strokeLinejoin="round"/><path d="M63 49L68 46" stroke="#eefaff" strokeWidth="7"/></g>
          <path d="M35 27L37 38L49 35L46 25" fill="#bcf2ff"/>
          <path d="M30 10L50 8L56 19L60 25L53 28L51 34L36 31L29 23Z" fill="#dcf8ff"/>
          <path d="M24 18L27 5L38 7L44 2L55 9L56 18L44 15L37 25L34 16L29 26Z" fill="#193f94" stroke="#76d7ff" strokeWidth="2"/>
          <path d="M50 20H54" stroke="#09132e" strokeWidth="3"/>
          <path className="traveler-scarf" d="M36 35L48 33L43 41L19 38L9 44L16 33Z" fill="#ff3565"/>
        </svg></div><span className="traveler-shadow"/>
      </div>
    </div>
    <div className="journey-dashboard">
      <div className="journey-now" aria-live="polite"><span>CHAPTER <b>0{active + 1} / 0{chapters.length}</b></span><strong>{chapters[active].organization}</strong></div>
      <div className="journey-navigation"><button disabled={disabled || active === 0} onClick={() => go(active - 1)} aria-label="Previous experience">←</button><span>{Math.round(progress * 100)}%</span><button disabled={disabled || active === chapters.length - 1} onClick={() => go(active + 1)} aria-label="Next experience">→</button></div>
      <input type="range" min="0" max={chapters.length - 1} step="1" value={active} disabled={disabled} onChange={event => go(Number(event.target.value))} aria-label="Choose experience chapter" aria-valuetext={`Chapter ${active + 1}: ${chapters[active].role}`}/>
    </div>
    <div className="journey-notes"><p id="journey-help">Swipe or drag the path · ← → Move · Home / End</p><p>DESIGN PREVIEW · Roles and dates from the reference; awaiting confirmation.</p></div>
  </section>;
}
