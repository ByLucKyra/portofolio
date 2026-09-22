import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync, preload } from 'react-dom';
import gsap from 'gsap';
import '@fontsource/barlow-condensed/800-italic.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/anton/400.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import { sections, wrap, screenFromHash, screenHash, WELCOME, readSavedScreen, saveScreen } from './navigation.mjs';
import { descriptions, subtitles, projects } from './content';
import { ProjectShowcase } from './ProjectShowcase';
import { SkillTree } from './SkillTree';
import { AboutMenu } from './AboutMenu';
import { ExperienceJourney } from './ExperienceJourney';
import { MenuEmblem } from './MenuEmblem';
import { EnvironmentElements } from './EnvironmentElements';
import { attachParallax } from './parallax.mjs';
import { playButtonSound } from './button-sound.mjs';
import './style.css';

const sectionArtwork = ['about-study', 'experience-journey', 'projects-workshop', 'skills-network', 'achievements-ascent', 'contact-signal'];

function App() {
  const initial = screenFromHash(location.hash);
  const [screen, setScreen] = useState(initial);
  const [selected, setSelected] = useState(Math.max(0, initial));
  const [busy, setBusy] = useState(false);
  const [outgoingArtwork, setOutgoingArtwork] = useState<string | null>(null);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [project, setProject] = useState<number | null>(null);
  const [savedScreen, setSavedScreen] = useState<number | null>(() => readSavedScreen(undefined));
  const [welcomeChoice, setWelcomeChoice] = useState(0);
  const [sound, setSound] = useState(() => {
    try { return localStorage.getItem('lucky:sound') !== 'off'; } catch { return true; }
  });
  const audio = useRef<AudioContext | null>(null);
  const soundtrack = useRef<HTMLAudioElement>(null);
  const musicUnlocked = useRef(false);
  const [music, setMusic] = useState(() => {
    try { return localStorage.getItem('lucky:music') !== 'off'; } catch { return true; }
  });
  const [musicVolume, setMusicVolume] = useState(() => {
    try {
      const saved = localStorage.getItem('lucky:music-volume');
      const value = saved === null ? .18 : Number(saved);
      return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : .18;
    } catch { return .18; }
  });
  useEffect(() => {
    const player = soundtrack.current!;
    player.volume = musicVolume;
    const sync = () => {
      if (music && musicUnlocked.current && !document.hidden) void player.play().catch(() => {});
      else player.pause();
    };
    try {
      localStorage.setItem('lucky:music', music ? 'on' : 'off');
      localStorage.setItem('lucky:music-volume', String(musicVolume));
    } catch { /* Keep controls usable when storage is unavailable. */ }
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => { document.removeEventListener('visibilitychange', sync); player.pause(); };
  }, [music, musicVolume]);
  const soundEnabled = useRef(sound);
  soundEnabled.current = sound;
  useEffect(() => {
    try { localStorage.setItem('lucky:sound', sound ? 'on' : 'off'); } catch { /* Session preference still works. */ }
  }, [sound]);
  useEffect(() => () => { void audio.current?.close().catch(() => {}); }, []);

  async function buttonSound(event: React.MouseEvent<HTMLDivElement>) {
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
    musicUnlocked.current = true;
    if (music && !document.hidden) void soundtrack.current?.play().catch(() => {});
    if (!soundEnabled.current || !('AudioContext' in window)) return;
    const cue = button.closest('dialog') ? 'detail' : screen === WELCOME ? 'welcome' : screen < 0 ? 'menu' : 'detail';
    try {
      const context = audio.current ??= new AudioContext();
      if (context.state === 'suspended') await context.resume();
      if (soundEnabled.current && context.state === 'running') playButtonSound(context, cue);
    } catch { /* Sound support must never interrupt navigation. */ }
  }
  const configDialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const wipe = useRef<HTMLDivElement>(null);
  const titleFlight = useRef<HTMLSpanElement>(null);
  const titleHandoff = useRef(false);
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

  function finishNavigation() {
    if (transition.current?.isActive() || entrance.current?.isActive()) return;
    locked.current = false; setBusy(false);
    const pending = pendingHistory.current; pendingHistory.current = null;
    if (pending !== null && pending !== current.current) { navigateRef.current(pending, true); return; }
    const target = current.current === WELCOME ? scene.current?.querySelector<HTMLButtonElement>('.welcome-button')
      : current.current < 0 ? menu.current?.querySelector<HTMLButtonElement>(`[data-index="${selection.current}"]`)
      : scene.current?.querySelector<HTMLElement>('h1');
    target?.focus({ preventScroll: true });
  }

  function navigate(next: number, fromHistory = false, source?: HTMLElement) {
    if (locked.current) { if (fromHistory) pendingHistory.current = next; return; }
    if (next === current.current) return;
    if (next !== WELCOME) preload(`/assets/${next < 0 ? 'menu-nexus' : sectionArtwork[next]}.png`, { as: 'image' });
    locked.current = true; setBusy(true);
    if (next >= 0) flushSync(() => setSelected(next));
    const sourceArtwork = current.current < 0 ? 'menu-nexus' : sectionArtwork[current.current];
    const commit = () => {
      if (!fromHistory) history.pushState(null, '', screenHash(next));
      flushSync(() => { setProject(null); if (titleHandoff.current) setOutgoingArtwork(sourceArtwork); setScreen(next); });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (stage.current) { stage.current.scrollTop = 0; stage.current.scrollLeft = 0; }
    };
    entrance.current?.kill();
    if (reduced) { commit(); return; }
    const tl = gsap.timeline({ onComplete: finishNavigation }); transition.current = tl;
    const chosen = next >= 0 && !fromHistory ? source ?? (current.current === -1
      ? menu.current?.querySelector<HTMLElement>(`[data-index="${next}"] span`) : null) : null;
    titleHandoff.current = !!chosen;
    if (chosen && titleFlight.current) {
      const rect = chosen.getBoundingClientRect();
      const style = getComputedStyle(chosen);
      const flight = titleFlight.current;
      const suffix = flight.querySelector<HTMLElement>('.title-flight-suffix')!;
      const extra = flight.querySelector<HTMLElement>('.title-flight-extra')!;
      const rotation = Number(gsap.getProperty(chosen, 'rotation'));
      const scaleX = Number(gsap.getProperty(chosen, 'scaleX'));
      const elements = stage.current!.querySelector('.environment-elements');
      const destination = () => scene.current!.querySelector<HTMLElement>('.section-title-word')!;
      gsap.set(flight, { visibility: 'visible', opacity: 1, fontSize: style.fontSize, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing,
        rotation, skewX: Number(gsap.getProperty(chosen, 'skewX')), scaleX, scaleY: Number(gsap.getProperty(chosen, 'scaleY')), xPercent: -50, yPercent: -50 });
      gsap.set(suffix, { opacity: 1, x: 0 });
      gsap.set(extra, { opacity: 0, x: -18, clipPath: 'inset(0 100% 0 0)' });
      const suffixOffset = suffix.offsetWidth * scaleX / 2;
      gsap.set(flight, { '--banner-tail': `${suffix.offsetWidth}px`, '--banner-cut': 'polygon(0% 80%,100% 0%,92% 82%,3% 100%)',
        x: rect.left + rect.width / 2 - Math.cos(rotation * Math.PI / 180) * suffixOffset,
        y: rect.top + rect.height / 2 - Math.sin(rotation * Math.PI / 180) * suffixOffset });
      gsap.set(chosen, { visibility: 'hidden' });
      if (current.current === -1) gsap.set(wedge.current, { visibility: 'hidden' });
      // The title stays visible while the world passes behind it at different depths.
      tl.to(scene.current, { x: -32, opacity: 0, duration: .28, ease: 'power2.in' }, 0)
        .to(stage.current, { '--scene-travel': -1, duration: .3, ease: 'power2.in' }, 0)
        .to(elements, { opacity: 0, duration: .16 }, .14)
        .call(commit, [], .3)
        .set(stage.current, { '--scene-travel': 1 }, .3)
        .to(stage.current, { '--scene-travel': 0, duration: .85, ease: 'power3.out' }, .3)
        .to(elements, { opacity: 1, duration: .6, ease: 'power2.out' }, .3)
        .to(flight, {
          x: () => { const r = destination().getBoundingClientRect(); return r.left + r.width / 2; },
          y: () => { const r = destination().getBoundingClientRect(); return r.top + r.height / 2; },
          fontSize: () => getComputedStyle(destination()).fontSize,
          lineHeight: () => getComputedStyle(destination()).lineHeight,
          letterSpacing: () => getComputedStyle(destination()).letterSpacing,
          rotation: -7, skewX: -8, scaleX: 1, scaleY: 1,
          '--banner-cut': 'polygon(0% 26%,100% 0%,92% 82%,3% 100%)',
          duration: .85, ease: 'power3.inOut',
        }, .3)
        .to(suffix, { opacity: 0, x: 12, duration: .2 }, .38)
        .to(flight, {
          '--banner-tail': () => {
            const word = destination();
            const heading = word.parentElement!;
            const padding = getComputedStyle(heading);
            return `${Math.max(0, heading.offsetWidth - word.offsetWidth - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight))}px`;
          }, duration: .4, ease: 'power3.inOut',
        }, .65)
        .to(extra, { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: .4, ease: 'power3.out' }, .65)
        .call(() => {
          gsap.set(destination().parentElement!.querySelectorAll('span'), { visibility: 'visible' });
          gsap.set(destination().parentElement, { '--title-banner-opacity': 1 });
          gsap.set(flight, { visibility: 'hidden' });
          gsap.set(stage.current, { '--scene-travel': 0 });
          gsap.set(elements, { clearProps: 'opacity' });
          gsap.set(chosen, { clearProps: 'visibility' });
          if (wedge.current) gsap.set(wedge.current, { clearProps: 'visibility' });
          setOutgoingArtwork(null);
          titleHandoff.current = false;
        });
      return;
    }
    tl.to(scene.current, { x: next < 0 ? 70 : -70, opacity: 0, duration: .2, ease: 'power2.in' })
      .fromTo(wipe.current, { x: 0, xPercent: -130 }, { xPercent: 0, duration: .36, ease: 'power3.in' }, .06)
      .call(commit)
      .to(wipe.current, { xPercent: 130, duration: .48, ease: 'power3.inOut' }, '+=.06');
  }
  navigateRef.current = navigate;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(scene.current, { x: 0, opacity: 1 });
      if (screen === WELCOME && stage.current) { stage.current.scrollTop = 0; stage.current.scrollLeft = 0; }
      if (reduced) { gsap.set(wipe.current, { x: 0, xPercent: 130 }); finishNavigation(); return; }
      const tl = gsap.timeline({ onComplete: finishNavigation }); entrance.current = tl;
      if (screen === WELCOME) {
        const mobile = window.matchMedia('(max-width:700px)').matches;
        tl.from('.welcome-brand', { y: -40, opacity: 0, duration: 1.1, ease: 'power3.out' }, .15)
          .fromTo('.welcome-button', { x: mobile ? 0 : 100, y: mobile ? 24 : 0, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: .7, stagger: .1, ease: 'power4.out', clearProps: 'transform,translate,rotate,scale' }, .4)
          .from('.welcome-caption', { opacity: 0, duration: .7 }, .6);
      } else {
        tl.from('.screen-title', { x: -140, opacity: 0, duration: .7, ease: 'power4.out' }, .08)
          .from(screen >= 0 && titleHandoff.current ? '.reveal:not(.section-heading)' : '.reveal', { y: 35, x: 38, opacity: 0, duration: .55, stagger: .055, ease: 'power3.out' }, .16);
        if (screen >= 0 && titleHandoff.current) {
          gsap.set('.section-title-word,.section-title-extra', { visibility: 'hidden' });
          gsap.set('.section-heading h1', { '--title-banner-opacity': 0 });
          tl.from('.section-body', { x: 55, opacity: 0, duration: .65, ease: 'power3.out' }, .18);
          tl.from('.section-heading p', { y: 12, opacity: 0, duration: .35 }, .8);
        }
        if (screen === -1) tl.from('.menu-button', { x: 180, opacity: 0, duration: .6, stagger: .045, ease: 'power4.out' }, .13);
        if (sectionNav.current) tl.from(sectionNav.current.children, { x: 45, y: 24, opacity: 0, duration: .55, stagger: .045, ease: 'power4.out' }, .2);
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
      gsap.to('.light-beam', { xPercent: 30, opacity: .24, duration: 6, stagger: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, stage);
    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    if (reduced || screen === WELCOME) return;
    return attachParallax(stage.current!);
  }, [screen === WELCOME, reduced]);

  useEffect(() => {
    const camera = gsap.to(stage.current, {
      '--focus-y': reduced || screen !== -1 ? 0 : selected / (sections.length - 1) * 2 - 1,
      duration: reduced ? 0 : .75, ease: 'power3.out',
    });
    return () => { camera.kill(); };
  }, [screen, selected, reduced]);

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
  const artwork = screen < 0 ? 'menu-nexus' : sectionArtwork[screen];
  return <div className={`app ${reduced ? 'reduced-motion' : ''}`} onClickCapture={buttonSound}>
    <div className="stage" ref={stage} data-theme={active} data-screen={screen === WELCOME ? 'welcome' : screen < 0 ? 'menu' : sections[screen].toLowerCase()}>
      <div className="environment" aria-hidden="true">
        <div className="environment-backdrop">{screen !== WELCOME && <img key={artwork} src={`/assets/${artwork}.png`} className="environment-art" alt="" decoding="async"/>}{outgoingArtwork && <img src={`/assets/${outgoingArtwork}.png`} className="environment-art environment-art-outgoing" alt=""/>}</div>
        <div className="light-beam beam-one"/><div className="light-beam beam-two"/><div className="water-shimmer"/>
        {screen !== WELCOME && <EnvironmentElements theme={active}/>}
        <div className="depth"/>
      </div>
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
          <MenuEmblem selected={selected} reduced={reduced}/>
          <h1 className="sr-only">Lucky Ramadhan — Personal portfolio</h1>
          <nav className="main-menu" aria-label="Main menu" ref={menu}>
            <img ref={wedge} className="selection-wedge" src="/assets/selection.svg" alt="" aria-hidden="true"/>
            {sections.map((name, i) => <button key={name} data-index={i} className={`menu-button ${selected === i ? 'selected' : ''}`} aria-label={`Open ${name}`} onFocus={() => {if(!locked.current)setSelected(i);}} onPointerEnter={() => {if(!locked.current)setSelected(i);}} onClick={() => navigate(i)}><span data-label={name}>{name}</span></button>)}
          </nav>
          <p className="menu-description reveal" aria-live="polite"><span>{String(selected+1).padStart(2,'0')} /</span> {descriptions[selected]}</p>
        </> : <main className="section-content">
          <div className="section-heading reveal"><h1 tabIndex={-1}>{<><span className="section-title-word">{screen === 3 ? 'SKILL' : sections[screen]}</span>{(screen === 0 || screen === 3) && <>{' '}<span className="section-title-extra">{screen === 0 ? 'ME' : 'TREE'}</span></>}</>}</h1><p>{subtitles[screen]}</p></div>
          <div className="section-body" key={screen}>
            {screen === 0 && <AboutMenu reduced={reduced} disabled={busy} onNavigate={navigate}/>}
            {screen === 1 && <ExperienceJourney reduced={reduced} disabled={busy}/>}
            {screen === 2 && <ProjectShowcase reduced={reduced} disabled={busy} onDetails={setProject}/>}
            {screen === 3 && <SkillTree reduced={reduced} disabled={busy}/>}
            {screen === 4 && <><p className="section-lead reveal">Small steps. Meaningful milestones.</p><div className="milestone reveal"><span className="milestone-number">NEXT</span><h2>The collection starts here.</h2><p>Hackathons, certifications, and milestones will appear here once the details are confirmed.</p><span className="outline-label">AWAITING VERIFIED ENTRIES</span></div></>}
            {screen === 5 && <><p className="section-lead reveal">Let’s build something great.</p><div className="contact-message reveal"><h2>Same vision.<br/>Bigger possibilities.</h2><p>Interesting projects, thoughtful conversations, and useful things built together.</p></div><div className="contact-grid reveal">{['Email','LinkedIn','GitHub'].map(name=><div key={name}><h2>{name} ↗</h2><p>Link awaiting confirmation</p></div>)}</div><p className="draft-note reveal">Contact channels will be connected after the public links are confirmed.</p></>}
          </div>
        </main>}
        {screen !== WELCOME && <><aside className="identity reveal"><p>LUCKY RAMADHAN</p><span>Software Developer</span><div className="identity-stats"><div><small>ARCANA</small><strong>Developer</strong></div><div><small>CHAPTER</small><strong>{String(active+1).padStart(2,'0')}</strong></div><p>Building a better<br/>tomorrow, one line<br/>at a time.</p></div></aside>
        </>}
      </div>
      <footer className="controls"><div className="audio-controls"><button className="motion-control" aria-pressed={reduced} onClick={()=>{transition.current?.progress(1);setReduced(!reduced);}}>{reduced ? 'MOTION: REDUCED' : 'MOTION: FULL'}</button><button className="motion-control" aria-pressed={music} onClick={()=>setMusic(!music)}>{music ? 'MUSIC: ON' : 'MUSIC: OFF'}</button></div>{screen >= 0 && <nav ref={sectionNav} aria-label="Sections" className="section-nav">{sections.map((name,i)=><button key={name} aria-current={screen===i?'page':undefined} onClick={event=>navigate(i, false, event.currentTarget.querySelector<HTMLElement>('span') ?? undefined)}><span>{name}</span></button>)}</nav>}<div className="key-hints">{screen === WELCOME ? <span><kbd>↑</kbd><kbd>↓</kbd> Select <kbd>↵</kbd> Confirm</span> : screen < 0 ? <><button onClick={()=>navigate(WELCOME)}><kbd>Esc</kbd> Title</button><span className="move-hint"><kbd>↑</kbd><kbd>↓</kbd> Select</span><button onClick={()=>navigate(selected)}><kbd>↵</kbd> Confirm</button></> : <button onClick={()=>navigate(-1)}><kbd>Esc</kbd> Back</button>}</div></footer>
      <div className="transition-wipe" ref={wipe} aria-hidden="true"><span>MAKE YOUR CHOICE.</span></div>
      <span className="section-title-flight" ref={titleFlight} aria-hidden="true">{selected === 3 ? 'SKILL' : sections[selected]}<span className="title-flight-suffix">{selected === 3 ? 'S' : ''}</span><span className="title-flight-extra">{selected === 0 ? ' ME' : selected === 3 ? ' TREE' : ''}</span></span>
    </div>
    <dialog ref={dialog} onClose={()=>setProject(null)} onClick={e=>{if(e.target===dialog.current)setProject(null);}} className="project-dialog">{project !== null && <><p className="eyebrow">PROJECT FILE / 0{project+1}</p><h2>{projects[project].name}</h2><p>{projects[project].detail}</p><p className="draft-note">Preview / final case study pending</p><button autoFocus onClick={()=>setProject(null)}><kbd>Esc</kbd> Close entry</button></>}</dialog>
    <dialog ref={configDialog} className="config-dialog" aria-labelledby="config-title"><p className="eyebrow">YOUR EXPERIENCE</p><h2 id="config-title">CONFIG</h2><label className="config-option"><span><strong>Reduced motion</strong><small>Keep transitions simple and pause ambient movement.</small></span><input type="checkbox" checked={reduced} onChange={e=>{transition.current?.progress(1);setReduced(e.target.checked);}}/></label><label className="config-option"><span><strong>Button sounds</strong><small>Play a short sound when a button is activated.</small></span><input type="checkbox" checked={sound} onChange={e=>setSound(e.target.checked)}/></label><label className="config-option"><span><strong>Soundtrack</strong><small>Blue Hour · Original JRPG-inspired instrumental</small></span><input type="checkbox" checked={music} onChange={e=>{musicUnlocked.current=true;setMusic(e.target.checked);}}/></label><label className="config-option music-volume"><span><strong>Music volume</strong><small>{Math.round(musicVolume*100)}%</small></span><input type="range" min="0" max="100" value={Math.round(musicVolume*100)} onChange={e=>setMusicVolume(Number(e.target.value)/100)}/></label><p className="config-help">Navigate with ↑ / ↓ or W / S. Press Enter to confirm, Escape to go back.</p><form method="dialog"><button>DONE <kbd>Esc</kbd></button></form></dialog>
    <audio ref={soundtrack} src="/assets/blue-hour.wav" loop preload="none"/>
  </div>;
}

createRoot(document.getElementById('root')!).render(<App/>);
