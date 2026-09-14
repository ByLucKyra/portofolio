import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import '@fontsource/barlow-condensed/800-italic.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/anton/400.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import { sections, wrap, screenFromHash, screenHash, WELCOME, readSavedScreen, saveScreen } from './navigation.mjs';
import { descriptions, subtitles, projects, experienceDrafts } from './content';
import { ProjectShowcase } from './ProjectShowcase';
import { SkillTree } from './SkillTree';
import { AboutMenu } from './AboutMenu';
import './style.css';

function App() {
  const initial = screenFromHash(location.hash);
  const [screen, setScreen] = useState(initial);
  const [selected, setSelected] = useState(Math.max(0, initial));
  const [busy, setBusy] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [project, setProject] = useState<number | null>(null);
  const [savedScreen, setSavedScreen] = useState<number | null>(() => readSavedScreen(undefined));
  const [welcomeChoice, setWelcomeChoice] = useState(0);
  const configDialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const wipe = useRef<HTMLDivElement>(null);
  const wedge = useRef<HTMLImageElement>(null);
  const menu = useRef<HTMLElement>(null);
  const sectionNav = useRef<HTMLElement>(null);
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
    const chosen = current.current === -1 && next >= 0 && !fromHistory
      ? menu.current?.querySelector<HTMLElement>(`[data-index="${next}"] span`) : null;
    if (chosen && wipe.current) {
      const rect = chosen.getBoundingClientRect();
      const x = (value: number) => `${value / window.innerWidth * 100}%`;
      const y = (value: number) => `${value / window.innerHeight * 100}%`;
      const start = `polygon(${x(rect.left - 30)} ${y(rect.top + rect.height * .3)}, ${x(rect.right + 35)} ${y(rect.top - 20)}, ${x(rect.right)} ${y(rect.bottom)}, ${x(rect.left - 20)} ${y(rect.bottom + 10)})`;
      const title = wipe.current.querySelector('span')!;
      title.textContent = sections[next];
      gsap.set(wipe.current, { x: 0, xPercent: 0, clipPath: start, backgroundColor: '#f5fcff' });
      gsap.set(title, { position: 'absolute', left: 0, top: 0, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, xPercent: -50, yPercent: -50, fontFamily: 'Barlow Condensed', fontWeight: 800, fontStyle: 'italic', fontSize: getComputedStyle(chosen).fontSize, rotation: -8 });
      tl.to(title, { scale: .94, duration: .12, ease: 'power2.in' })
        .to(wipe.current, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: .58, ease: 'power3.inOut' })
        .to(title, { x: window.innerWidth / 2, y: window.innerHeight / 2, rotation: 0, scale: 1.15, duration: .58, ease: 'power3.inOut' }, '<')
        .call(commit)
        .to(title, { opacity: 0, duration: .18 }, '+=.1')
        .to(wipe.current, { xPercent: 130, duration: .5, ease: 'power3.inOut' }, '<')
        .set(wipe.current, { clearProps: 'clipPath,backgroundColor' })
        .set(title, { clearProps: 'all' })
        .call(() => { title.textContent = 'MAKE YOUR CHOICE.'; });
      return;
    }
    tl.to(scene.current, { x: next < 0 ? 70 : -70, opacity: 0, duration: .2, ease: 'power2.in' })
      .fromTo(wipe.current, { x: 0, xPercent: -130 }, { xPercent: 0, duration: .36, ease: 'power3.in' }, .06)
      .call(commit)
      .to(wipe.current, { xPercent: 130, duration: .48, ease: 'power3.inOut' }, '+=.06');
  }
  navigateRef.current = navigate;

  useLayoutEffect(() => {
    const finish = () => {
      locked.current = false; setBusy(false);
      const pending = pendingHistory.current; pendingHistory.current = null;
      if (pending !== null && pending !== current.current) { navigateRef.current(pending, true); return; }
      const target = screen === WELCOME ? scene.current?.querySelector<HTMLButtonElement>('.welcome-button') : screen < 0 ? menu.current?.querySelector<HTMLButtonElement>(`[data-index="${selection.current}"]`) : scene.current?.querySelector<HTMLElement>('h1');
      target?.focus({ preventScroll: true });
    };
    const ctx = gsap.context(() => {
      gsap.set(scene.current, { x: 0, opacity: 1 });
      if (reduced) { gsap.set(wipe.current, { x: 0, xPercent: 130 }); finish(); return; }
      const tl = gsap.timeline({ onComplete: finish }); entrance.current = tl;
      if (screen === WELCOME) {
        tl.from('.welcome-brand', { y: -40, opacity: 0, duration: 1.1, ease: 'power3.out' }, .15)
          .from('.welcome-button', { x: 100, opacity: 0, duration: .7, stagger: .1, ease: 'power4.out' }, .4)
          .from('.welcome-caption', { opacity: 0, duration: .7 }, .6);
      } else {
        tl.from('.screen-title', { x: -140, opacity: 0, duration: .7, ease: 'power4.out' }, .08)
          .from('.reveal', { y: 35, x: 38, opacity: 0, duration: .55, stagger: .055, ease: 'power3.out' }, .16);
        if (screen === -1) tl.from('.menu-button', { x: 180, opacity: 0, duration: .6, stagger: .045, ease: 'power4.out' }, .13);
        if (sectionNav.current) tl.from(sectionNav.current.children, { x: 45, y: 24, opacity: 0, duration: .55, stagger: .045, ease: 'power4.out' }, .2);
      }
      if (screen === 1) {
        tl.from('.journey-line', { scaleY: 0, transformOrigin: 'top', duration: .85, ease: 'power2.out' }, .25)
          .from('.journey-step', { x: 45, opacity: 0, duration: .45, stagger: .12, ease: 'power3.out' }, .35);
      }
    }, scene);
    return () => ctx.revert();
  }, [screen, reduced]);

  useEffect(() => {
    if (screen >= -1) { saveScreen(screen, undefined); setSavedScreen(screen); }
  }, [screen]);

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
    const position = () => {
      const label = button.querySelector('span')!;
      const height = button.offsetHeight * 2.05;
      const style = getComputedStyle(button);
      gsap.to(wedge.current, {
        x: button.offsetLeft - 48,
        y: button.offsetTop - height * .38,
        width: label.offsetWidth * Number(style.getPropertyValue('--stretch')) * 1.1 + 100,
        height,
        rotation: Number(style.getPropertyValue('--tilt').replace('deg', '')) || 0,
        duration: reduced ? 0 : .26, ease: 'power3.out', overwrite: true,
      });
    };
    position(); const observer = new ResizeObserver(position); observer.observe(menu.current); observer.observe(button);
    return () => { observer.disconnect(); gsap.killTweensOf(wedge.current); };
  }, [selected, screen, reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || dialog.current?.open || configDialog.current?.open || (e.target instanceof HTMLElement && e.target.closest('input,textarea,select,[contenteditable]'))) return;
      const key = e.key.toLowerCase();
      if (current.current === WELCOME) {
        if (['arrowdown', 's', 'arrowup', 'w'].includes(key)) {
          e.preventDefault(); if (locked.current) return;
          const buttons = Array.from(scene.current!.querySelectorAll<HTMLButtonElement>('.welcome-button:not(:disabled)'));
          const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
          buttons[(index + (['s','arrowdown'].includes(key) ? 1 : buttons.length - 1) + buttons.length) % buttons.length]?.focus();
        }
        if (key === 'enter' && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); navigateRef.current(-1); }
        return;
      }
      if (key === 'escape' && current.current === -1) { e.preventDefault(); navigateRef.current(WELCOME); return; }
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
    <div className="stage" ref={stage} data-screen={screen === WELCOME ? 'welcome' : screen < 0 ? 'menu' : screen === 0 ? 'about' : screen === 1 ? 'experience' : screen === 2 ? 'projects' : screen === 3 ? 'skills' : 'section'}>
      <div className="environment" aria-hidden="true"><div className="city-parallax"><div className="city-drift"><img src="/assets/city.svg" className="city" alt="" /></div></div><div className="light-beam beam-one"/><div className="light-beam beam-two"/><div className="water-shimmer"/><div className="depth"/></div>
      {screen !== WELCOME && <header className="hud"><div className="status-box"><strong>{String(active+1).padStart(2,'0')} <span>/ {String(sections.length).padStart(2,'0')}</span></strong><small>PERSONAL PORTFOLIO</small></div><div className="top-quote">LIFE IS A SERIES OF CHOICES.<span>選択の先に、きっと何かがある。</span></div></header>}
      <div className="scene" ref={scene} aria-busy={busy}>
        {screen !== WELCOME && <div className={`screen-title ${screen >= 0 ? 'section-giant' : ''}`} aria-hidden="true">{screen < 0 ? 'MENU' : sections[screen]}</div>}
        {screen === WELCOME ? <main className="welcome-content">
          <div className="welcome-brand"><div className="welcome-monogram" aria-hidden="true">LR<span>01</span></div><h1>LUCKY<br/><span>RAMADHAN</span></h1><div className="welcome-edition"><span>PERSONAL</span><strong>PORTFOLIO</strong></div><p>SOFTWARE DEVELOPER / A WORK IN PROGRESS</p></div>
          <div className="welcome-caption"><span>YOUR NEXT CHAPTER STARTS HERE.</span><p>Every idea.<br/>A new possibility.</p><small>EXPLORE · BUILD · REPEAT</small></div>
          <nav className="welcome-menu" aria-label="Welcome menu">
            <button className={`welcome-button ${welcomeChoice === 0 ? 'active' : ''}`} onFocus={()=>setWelcomeChoice(0)} onPointerEnter={()=>setWelcomeChoice(0)} onClick={()=>navigate(-1)}><span>START</span><small>ENTER THE PORTFOLIO</small></button>
            <button className={`welcome-button ${welcomeChoice === 1 ? 'active' : ''}`} disabled={savedScreen === null} onFocus={()=>setWelcomeChoice(1)} onPointerEnter={()=>{if(savedScreen !== null)setWelcomeChoice(1);}} onClick={()=>{if(savedScreen !== null)navigate(savedScreen);}}><span>CONTINUE</span><small>{savedScreen === null ? 'NO PREVIOUS VISIT' : `RESUME / ${savedScreen === -1 ? 'MAIN MENU' : sections[savedScreen]}`}</small></button>
            <button className={`welcome-button ${welcomeChoice === 2 ? 'active' : ''}`} onFocus={()=>setWelcomeChoice(2)} onPointerEnter={()=>setWelcomeChoice(2)} onClick={()=>configDialog.current?.showModal()}><span>CONFIG</span><small>MAKE YOURSELF COMFORTABLE</small></button>
          </nav>
        </main> : screen < 0 ? <>
          <h1 className="sr-only">Lucky Ramadhan — Personal portfolio</h1>
          <nav className="main-menu" aria-label="Main menu" ref={menu}>
            <img ref={wedge} className="selection-wedge" src="/assets/selection.svg" alt="" aria-hidden="true"/>
            {sections.map((name, i) => <button key={name} data-index={i} className={`menu-button ${selected === i ? 'selected' : ''}`} aria-label={`Open ${name}`} onFocus={() => {if(!locked.current)setSelected(i);}} onPointerEnter={() => {if(!locked.current)setSelected(i);}} onClick={() => navigate(i)}><span data-label={name}>{name}</span></button>)}
          </nav>
          <p className="menu-description reveal" aria-live="polite"><span>{String(selected+1).padStart(2,'0')} /</span> {descriptions[selected]}</p>
        </> : <main className="section-content">
          <div className="section-heading reveal"><h1 tabIndex={-1}>{screen === 0 ? 'ABOUT ME' : screen === 3 ? 'SKILL TREE' : sections[screen]}</h1><p>{subtitles[screen]}</p></div>
          <div className="section-body" key={screen}>
            {screen === 0 && <AboutMenu reduced={reduced} disabled={busy} onNavigate={navigate}/>}
            {screen === 1 && <>
              <div className="journey-caption reveal" aria-hidden="true"><span>EVERY EXPERIENCE<br/>SHAPES A BETTER TOMORROW.</span><p>Past<br/>shapes<br/><em>present.</em></p><small>EVERY PROJECT. EVERY CHALLENGE.<br/>A STRONGER ME.</small></div>
              <p className="journey-draft reveal"><strong>DESIGN PREVIEW</strong> Sample roles, dates, and technologies from the reference. Not a verified résumé.</p>
              <div className="journey-timeline"><div className="journey-line" aria-hidden="true"/><ol aria-label="Professional milestones — draft content">{experienceDrafts.map((entry,i)=><li className="journey-step" key={entry.period}>
                <p className="journey-period">{entry.period}</p><span className="journey-dot" aria-hidden="true"/>
                <article className="journey-entry"><div className="journey-index" aria-hidden="true"><small>CHAPTER</small><span>0{experienceDrafts.length-i}</span></div><div className="journey-copy"><h2>{entry.role}</h2><p className="journey-organization">{entry.organization}</p><p className="journey-description">{entry.description}</p><ul className="technology-tags" aria-label="Technologies">{entry.technologies.map(technology=><li key={technology}>{technology}</li>)}</ul></div></article>
              </li>)}</ol></div>
              <p className="journey-closing reveal">And leads to a greater future. <span>MORE THAN CODE.</span></p>
            </>}
            {screen === 2 && <ProjectShowcase reduced={reduced} disabled={busy} onDetails={setProject}/>}
            {screen === 3 && <SkillTree reduced={reduced} disabled={busy}/>}
            {screen === 4 && <><p className="section-lead reveal">Small steps. Meaningful milestones.</p><div className="milestone reveal"><span className="milestone-number">NEXT</span><h2>The collection starts here.</h2><p>Hackathons, certifications, and milestones will appear here once the details are confirmed.</p><span className="outline-label">AWAITING VERIFIED ENTRIES</span></div></>}
            {screen === 5 && <><p className="section-lead reveal">Let’s build something great.</p><div className="contact-message reveal"><h2>Same vision.<br/>Bigger possibilities.</h2><p>Interesting projects, thoughtful conversations, and useful things built together.</p></div><div className="contact-grid reveal">{['Email','LinkedIn','GitHub'].map(name=><div key={name}><h2>{name} ↗</h2><p>Link awaiting confirmation</p></div>)}</div><p className="draft-note reveal">Contact channels will be connected after the public links are confirmed.</p></>}
          </div>
        </main>}
        {screen !== WELCOME && <><aside className="identity reveal"><p>LUCKY RAMADHAN</p><span>Software Developer</span><div className="identity-stats"><div><small>ARCANA</small><strong>Developer</strong></div><div><small>CHAPTER</small><strong>{String(active+1).padStart(2,'0')}</strong></div><p>Building a better<br/>tomorrow, one line<br/>at a time.</p></div></aside>
        <div className="party-rail" aria-hidden="true"><b>LEADER</b>{[0,1,2,3,4].map(i=><div className="gauge" key={i} style={{'--gauge':`${92-i*9}%`} as React.CSSProperties}><i/><span/></div>)}</div></>}
      </div>
      <footer className="controls"><button className="motion-control" aria-pressed={reduced} onClick={()=>{transition.current?.progress(1);setReduced(!reduced);}}>{reduced ? 'MOTION: REDUCED' : 'MOTION: FULL'}</button>{screen >= 0 && <nav ref={sectionNav} aria-label="Sections" className="section-nav">{sections.map((name,i)=><button key={name} aria-current={screen===i?'page':undefined} onClick={()=>navigate(i)}><span>{name}</span></button>)}</nav>}<div className="key-hints">{screen === WELCOME ? <span><kbd>↑</kbd><kbd>↓</kbd> Select <kbd>↵</kbd> Confirm</span> : screen < 0 ? <><button onClick={()=>navigate(WELCOME)}><kbd>Esc</kbd> Title</button><span className="move-hint"><kbd>↑</kbd><kbd>↓</kbd> Select</span><button onClick={()=>navigate(selected)}><kbd>↵</kbd> Confirm</button></> : <button onClick={()=>navigate(-1)}><kbd>Esc</kbd> Back</button>}</div></footer>
      <div className="transition-wipe" ref={wipe} aria-hidden="true"><span>MAKE YOUR CHOICE.</span></div>
    </div>
    <dialog ref={dialog} onClose={()=>setProject(null)} onClick={e=>{if(e.target===dialog.current)setProject(null);}} className="project-dialog">{project !== null && <><p className="eyebrow">PROJECT FILE / 0{project+1}</p><h2>{projects[project].name}</h2><p>{projects[project].detail}</p><p className="draft-note">Preview / final case study pending</p><button autoFocus onClick={()=>setProject(null)}><kbd>Esc</kbd> Close entry</button></>}</dialog>
    <dialog ref={configDialog} className="config-dialog" aria-labelledby="config-title"><p className="eyebrow">YOUR EXPERIENCE</p><h2 id="config-title">CONFIG</h2><label className="config-option"><span><strong>Reduced motion</strong><small>Keep transitions simple and pause ambient movement.</small></span><input type="checkbox" checked={reduced} onChange={e=>{transition.current?.progress(1);setReduced(e.target.checked);}}/></label><p className="config-help">Navigate with ↑ / ↓ or W / S. Press Enter to confirm, Escape to go back.</p><form method="dialog"><button>DONE <kbd>Esc</kbd></button></form></dialog>
  </div>;
}

createRoot(document.getElementById('root')!).render(<App/>);
