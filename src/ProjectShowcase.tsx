import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { projects } from './content';
import { wrap } from './navigation.mjs';

export function ProjectShowcase({ reduced, disabled, onDetails }: { reduced: boolean; disabled: boolean; onDetails: (index: number) => void }) {
  const [index, setIndex] = useState(0);
  const direction = useRef(1);
  const root = useRef<HTMLElement>(null);
  const project = projects[index];
  const number = String(index + 1).padStart(2, '0');

  function move(step: number) {
    if (disabled) return;
    direction.current = step;
    setIndex(previous => wrap(previous + step, projects.length));
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || document.querySelector('dialog[open]') ||
        (event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable]'))) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        move(event.key === 'ArrowLeft' ? -1 : 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled]);

  useLayoutEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      gsap.timeline()
        .from('.project-art', { x: direction.current * 140, rotation: direction.current * 8, opacity: 0, duration: .65, ease: 'power4.out' })
        .from('.project-dossier', { x: direction.current * -50, opacity: 0, duration: .45, ease: 'power3.out' }, .08)
        .from('.project-summary', { y: 24, opacity: 0, duration: .4, ease: 'power3.out' }, .18);
    }, root);
    return () => context.revert();
  }, [index, reduced]);

  return <section ref={root} className="project-showcase reveal" aria-label="Selected projects" aria-roledescription="carousel" data-project={index}>
    <div className="project-switcher" role="group" aria-label="Change project">
      <button disabled={disabled} onClick={() => move(-1)} aria-label="Previous project"><b aria-hidden="true">‹</b><span>PREV</span><kbd>←</kbd></button>
      <span className="project-counter">{number}<span> / {String(projects.length).padStart(2, '0')}</span></span>
      <button disabled={disabled} onClick={() => move(1)} aria-label="Next project"><kbd>→</kbd><span>NEXT</span><b aria-hidden="true">›</b></button>
    </div>
    <div className="project-stage" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${projects.length}: ${project.name}`}>
      <div className="project-dossier">
        <div className="project-nameplate"><small>PROJECT FILE</small><h2>{project.name}</h2></div>
        <div className="project-classification"><div><small>DOMAIN</small><p>{project.category}</p></div><strong aria-hidden="true">{number}</strong></div>
      </div>
      <div className="project-art" aria-hidden="true"><div className="project-art-frame"><img src="/assets/project-arcana.png" alt="" width="1024" height="1536"/><span className="project-art-number">{number}</span><div className="project-art-name">{project.name}</div></div></div>
      <div className="project-summary"><p>{project.description}</p><button className="project-open" disabled={disabled} onClick={() => onDetails(index)}>OPEN PROJECT <span aria-hidden="true">↗</span></button><small>Concept cover · Case study in progress</small></div>
    </div>
    <div className="project-pagination" role="group" aria-label="Choose a project">{projects.map((item, i) => <button key={item.name} disabled={disabled} aria-label={`Show ${item.name}`} aria-current={i === index ? 'true' : undefined} onClick={() => { direction.current = i > index ? 1 : -1; setIndex(i); }}>{String(i + 1).padStart(2, '0')}</button>)}</div>
    <p className="sr-only" role="status" aria-atomic="true">Project {index + 1} of {projects.length}: {project.name}. {project.description}</p>
  </section>;
}
