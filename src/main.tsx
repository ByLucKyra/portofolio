import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import '@fontsource/barlow-condensed/800-italic.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/anton/400.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import { sections, wrap, screenFromHash, screenHash } from './navigation.mjs';
import { descriptions, subtitles, projects, abilities } from './content';
import './style.css';

function App() {
  const initial = screenFromHash(location.hash);
  const [screen, setScreen] = useState(initial);
  const [selected, setSelected] = useState(Math.max(0, initial));
  const [busy, setBusy] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [project, setProject] = useState<number | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const wipe = useRef<HTMLDivElement>(null);
  const wedge = useRef<HTMLImageElement>(null);
  const menu = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const locked = useRef(false);
  const current = useRef(screen);
  const selection = useRef(selected);
  const transition = useRef<gsap.core.Timeline | null>(null);
  const entrance = useRef<gsap.core.Timeline | null>(null);
  const pendingHistory = useRef<number | null>(null);
  const navigateRef = useRef<(next: number, history?: boolean) => void>(() => {});
  selection.current = selected;
  current.current = screen;

  function navigate(next: number, fromHistory = false) {
    if (locked.current) { if (fromHistory) pendingHistory.current = next; return; }
    if (next === current.current) return;
    locked.current = true; setBusy(true);
    if (next >= 0) setSelected(next);
    const commit = () => {
      if (!fromHistory) history.pushState(null, '', screenHash(next));
      flushSync(() => { setProject(null); setScreen(next); });
    };
    entrance.current?.kill();
    if (reduced) { commit(); return; }
    const tl = gsap.timeline(); transition.current = tl;
    tl.to(scene.current, { x: next < 0 ? 70 : -70, opacity: 0, duration: .2, ease: 'power2.in' })
      .fromTo(wipe.current, { xPercent: -130 }, { xPercent: 0, duration: .36, ease: 'power3.in' }, .06)
      .call(commit)
      .to(wipe.current, { xPercent: 130, duration: .48, ease: 'power3.inOut' }, '+=.06');
  }
  navigateRef.current = navigate;

  useLayoutEffect(() => {
    const finish = () => {
      locked.current = false; setBusy(false);
      const pending = pendingHistory.current; pendingHistory.current = null;
      if (pending !== null && pending !== current.current) { navigateRef.current(pending, true); return; }
      const target = screen < 0 ? menu.current?.querySelector<HTMLButtonElement>(`[data-index="${selection.current}"]`) : scene.current?.querySelector<HTMLElement>('h1');
      target?.focus({ preventScroll: true });
    };
    const ctx = gsap.context(() => {
      gsap.set(scene.current, { x: 0, opacity: 1 });
      if (reduced) { gsap.set(wipe.current, { xPercent: 130 }); finish(); return; }
      const tl = gsap.timeline({ onComplete: finish }); entrance.current = tl;
      tl.from('.screen-title', { x: -140, opacity: 0, duration: .7, ease: 'power4.out' }, .08)
        .from('.reveal', { y: 35, x: 38, opacity: 0, duration: .55, stagger: .055, ease: 'power3.out' }, .16)
        .from('.menu-button', { x: 180, opacity: 0, duration: .6, stagger: .045, ease: 'power4.out' }, .13);
    }, scene);
    return () => ctx.revert();
  }, [screen, reduced]);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const changed = () => { transition.current?.progress(1); setReduced(media.matches); };
    media.addEventListener('change', changed);
    return () => { media.removeEventListener('change', changed); transition.current?.kill(); };
  }, []);

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.to('.city-drift', { y: -12, scale: 1.025, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.light-beam', { xPercent: 30, opacity: .24, duration: 6, stagger: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, stage);
    const xTo = gsap.quickTo('.city-parallax', 'x', { duration: 1.4, ease: 'power2.out' });
    const yTo = gsap.quickTo('.city-parallax', 'y', { duration: 1.4, ease: 'power2.out' });
    const el = stage.current!;
    const move = (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; const r = el.getBoundingClientRect(); xTo((e.clientX-r.left-r.width/2)*.009); yTo((e.clientY-r.top-r.height/2)*.009); };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    return () => { ctx.revert(); xTo.tween.kill(); yTo.tween.kill(); gsap.set('.city-parallax', {x:0,y:0}); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, [reduced]);

  useLayoutEffect(() => {
    if (screen >= 0 || !menu.current || !wedge.current) return;
    const button = menu.current.querySelector<HTMLElement>(`[data-index="${selected}"]`)!;
    const position = () => gsap.to(wedge.current, { y: button.offsetTop, duration: reduced ? 0 : .28, ease: 'power3.out', overwrite: true });
    position(); const observer = new ResizeObserver(position); observer.observe(menu.current);
    return () => { observer.disconnect(); gsap.killTweensOf(wedge.current); };
  }, [selected, screen, reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || dialog.current?.open || (e.target instanceof HTMLElement && e.target.closest('input,textarea,select,[contenteditable]'))) return;
      const key = e.key.toLowerCase();
      if (key === 'escape' && current.current >= 0) { e.preventDefault(); navigateRef.current(-1); return; }
      if (current.current >= 0) return;
      if (['arrowdown', 's', 'arrowup', 'w'].includes(key)) {
        e.preventDefault(); if (locked.current) return;
        const next = wrap(selection.current + (['s','arrowdown'].includes(key) ? 1 : -1));
        setSelected(next); menu.current?.querySelector<HTMLButtonElement>(`[data-index="${next}"]`)?.focus({ preventScroll: true });
      }
      if (key === 'enter' && !(e.target instanceof HTMLButtonElement) && !(e.target instanceof HTMLAnchorElement)) { e.preventDefault(); navigateRef.current(selection.current); }
    };
    const onHistory = () => navigateRef.current(screenFromHash(location.hash), true);
    window.addEventListener('keydown', onKey); window.addEventListener('popstate', onHistory); window.addEventListener('hashchange', onHistory);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('popstate', onHistory); window.removeEventListener('hashchange', onHistory); };
  }, []);

  useEffect(() => {
    if (project !== null) dialog.current?.showModal();
    else dialog.current?.close();
  }, [project]);

  const active = screen < 0 ? selected : screen;
  return <div className={`app ${reduced ? 'reduced-motion' : ''}`}>
    <div className="stage" ref={stage}>
      <div className="environment" aria-hidden="true"><div className="city-parallax"><div className="city-drift"><img src="/assets/city.svg" className="city" alt="" /></div></div><div className="light-beam beam-one"/><div className="light-beam beam-two"/><div className="water-shimmer"/><div className="depth"/></div>
      <header className="hud"><div className="status-box"><strong>{String(active+1).padStart(2,'0')} <span>/ 07</span></strong><small>PERSONAL PORTFOLIO</small></div><div className="top-quote">LIFE IS A SERIES OF CHOICES.<span>選択の先に、きっと何かがある。</span></div></header>
      <div className="scene" ref={scene} aria-busy={busy}>
        <div className={`screen-title ${screen >= 0 ? 'section-giant' : ''}`} aria-hidden="true">{screen < 0 ? 'MENU' : sections[screen]}</div>
        {screen < 0 ? <>
          <h1 className="sr-only">Lucky Ramadhan — Personal portfolio</h1>
          <nav className="main-menu" aria-label="Main menu" ref={menu}>
            <img ref={wedge} className="selection-wedge" src="/assets/selection.svg" alt="" aria-hidden="true"/>
            {sections.map((name, i) => <button key={name} data-index={i} className={`menu-button ${selected === i ? 'selected' : ''}`} aria-label={`Open ${name}`} onFocus={() => {if(!locked.current)setSelected(i);}} onPointerEnter={() => {if(!locked.current)setSelected(i);}} onClick={() => navigate(i)}><span>{name}</span></button>)}
          </nav>
          <p className="menu-description reveal" aria-live="polite"><span>{String(selected+1).padStart(2,'0')} /</span> {descriptions[selected]}</p>
        </> : <main className="section-content">
          <div className="section-heading reveal"><h1 tabIndex={-1}>{sections[screen]}</h1><p>{subtitles[screen]}</p></div>
          <div className="section-body" key={screen}>
            {screen === 0 && <>
              <div className="about-intro reveal"><div><p className="eyebrow">HELLO, I'M</p><h2>LUCKY RAMADHAN</h2><p>I love turning ideas into real products. I’m curious about technology, solving problems, and making useful things through code.</p><p>Always curious, always learning, and ready for the next challenge.</p></div><dl className="facts"><dt>ROLE</dt><dd>Software Developer</dd><dt>FOCUS</dt><dd>Building useful things</dd><dt>APPROACH</dt><dd>Learn. Explore. Create.</dd><dt>PROFILE</dt><dd>Draft / in progress</dd></dl></div>
              <section className="reveal"><h3>INTERESTS / DRAFT</h3><div className="interests">{['Coding','Learning','Games','Music','Travel','Anime & arts'].map((label,i)=><div key={label}><img src={`/assets/interest-${i}.svg`} alt="" width="34" height="28"/><span>{label}</span></div>)}</div></section>
              <section className="reveal"><h3>WHAT DRIVES ME</h3><blockquote>“I believe technology can create opportunities, connect people, and solve real problems. I want to keep building, keep learning, and contribute to solutions that make a positive impact.”<cite>Lucky Ramadhan / draft copy</cite></blockquote></section>
              <div className="perspectives reveal">{[[5,'EXPLORE THE LAB'],[2,'VIEW PROJECTS'],[6,'GET IN TOUCH']].map(([index,label])=><button key={index} onClick={()=>navigate(Number(index))}><img src="/assets/city.svg" alt=""/><span>{label} ↗</span></button>)}</div>
            </>}
            {screen === 1 && <><p className="section-lead reveal">Past shapes present.</p><div className="timeline reveal"><article><span className="timeline-marker"/><p className="eyebrow">PROFESSIONAL JOURNEY</p><h2>A story still being written.</h2><p>This space will connect work, projects, and the experiences behind them.</p><p className="draft-note">Roles, organizations, and dates are awaiting confirmation.</p></article></div><div className="journey-types reveal"><span>WORK</span><span>INITIATIVES</span><span>COMMUNITY</span></div></>}
            {screen === 2 && <><p className="section-lead reveal">Build. Explore. Iterate.</p><div className="project-list">{projects.map((p,i)=><button className="project-card reveal" key={p.name} onClick={()=>setProject(i)}><div className="project-preview"><img src="/assets/city.svg" alt=""/><strong>0{i+1}</strong></div><div><small>{p.category}</small><h2>{p.name}</h2><p>{p.description}</p></div><span className="entry-arrow">↗</span></button>)}</div><p className="draft-note reveal">Case studies in progress. Open an entry to explore.</p></>}
            {screen === 3 && <><p className="section-lead reveal">Learn. Adapt. Build. Repeat.</p><div className="skills-grid">{abilities.map(([name,...items],i)=><article className="ability reveal" key={name}><small>ABILITY / 0{i+1}</small><h2>{name}</h2><ul>{items.map(item=><li key={item}>{item}</li>)}</ul></article>)}</div><p className="draft-note reveal">Technology list from the project brief. No proficiency scores assigned.</p></>}
            {screen === 4 && <><p className="section-lead reveal">Small steps. Meaningful milestones.</p><div className="milestone reveal"><span className="milestone-number">NEXT</span><h2>The collection starts here.</h2><p>Hackathons, certifications, and milestones will appear here once the details are confirmed.</p><span className="outline-label">AWAITING VERIFIED ENTRIES</span></div></>}
            {screen === 5 && <><p className="section-lead reveal">A space to explore.</p><p className="reveal">A working notebook for ideas before they become finished projects.</p><div className="lab-list">{[['AI AGENT EXPERIMENTS','Research workflows and agent-assisted tools.'],['INTERFACE PLAYGROUND','Motion, interactions, and unusual ways to navigate.'],['IDEAS IN PROGRESS','Small prototypes, open questions, and possibilities.']].map(([name,desc],i)=><article className="reveal" key={name}><small>0{i+1} / EXPLORATION</small><h2>{name}</h2><p>{desc}</p></article>)}</div></>}
            {screen === 6 && <><p className="section-lead reveal">Let’s build something great.</p><div className="contact-message reveal"><h2>Same vision.<br/>Bigger possibilities.</h2><p>Interesting projects, thoughtful conversations, and useful things built together.</p></div><div className="contact-grid reveal">{['Email','LinkedIn','GitHub'].map(name=><div key={name}><h2>{name} ↗</h2><p>Link awaiting confirmation</p></div>)}</div><p className="draft-note reveal">Contact channels will be connected after the public links are confirmed.</p></>}
          </div>
        </main>}
        <aside className="identity reveal"><p>LUCKY RAMADHAN</p><span>Software Developer</span><div className="identity-stats"><div><small>ARCANA</small><strong>Developer</strong></div><div><small>CHAPTER</small><strong>{String(active+1).padStart(2,'0')}</strong></div><p>Building a better<br/>tomorrow, one line<br/>at a time.</p></div></aside>
        <div className="party-rail" aria-hidden="true"><b>LEADER</b>{[0,1,2,3,4].map(i=><div className="gauge" key={i} style={{'--gauge':`${92-i*9}%`} as React.CSSProperties}><i/><span/></div>)}</div>
      </div>
      <footer className="controls"><button className="motion-control" aria-pressed={reduced} onClick={()=>{transition.current?.progress(1);setReduced(!reduced);}}>{reduced ? 'MOTION: REDUCED' : 'MOTION: FULL'}</button>{screen >= 0 && <nav aria-label="Sections" className="section-nav">{sections.map((name,i)=><button key={name} aria-current={screen===i?'page':undefined} onClick={()=>navigate(i)}>{name}</button>)}</nav>}<div className="key-hints">{screen < 0 ? <><span className="move-hint"><kbd>↑</kbd><kbd>↓</kbd> Select</span><button onClick={()=>navigate(selected)}><kbd>↵</kbd> Confirm</button></> : <button onClick={()=>navigate(-1)}><kbd>Esc</kbd> Back</button>}</div></footer>
      <div className="transition-wipe" ref={wipe} aria-hidden="true"><span>MAKE YOUR CHOICE.</span></div>
    </div>
    <dialog ref={dialog} onClose={()=>setProject(null)} onClick={e=>{if(e.target===dialog.current)setProject(null);}} className="project-dialog">{project !== null && <><p className="eyebrow">PROJECT FILE / 0{project+1}</p><h2>{projects[project].name}</h2><p>{projects[project].detail}</p><p className="draft-note">Preview / final case study pending</p><button autoFocus onClick={()=>setProject(null)}><kbd>Esc</kbd> Close entry</button></>}</dialog>
  </div>;
}

createRoot(document.getElementById('root')!).render(<App/>);
