import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import gsap from 'gsap';
import { abilities } from './content';
import { wrap } from './navigation.mjs';

export function SkillTree({ reduced, disabled }: { reduced: boolean; disabled: boolean }) {
  const [branch, setBranch] = useState(-1);
  const [selection, setSelection] = useState({ group: 0, skill: 0 });
  const root = useRef<HTMLElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const group = abilities[selection.group];
  const skill = group.skills[selection.skill];
  const filters = ['All', ...abilities.map(item => item.name)];

  function chooseBranch(index: number) {
    if (disabled) return;
    setBranch(index);
    if (index >= 0) setSelection({ group: index, skill: 0 });
  }

  function onTabKey(event: KeyboardEvent) {
    if (disabled || event.altKey || event.ctrlKey || event.metaKey) return;
    let next: number;
    if (event.key === 'ArrowRight') next = wrap(branch + 2, filters.length);
    else if (event.key === 'ArrowLeft') next = wrap(branch, filters.length);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = filters.length - 1;
    else return;
    event.preventDefault();
    chooseBranch(next - 1);
    tabs.current?.querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();
  }

  useLayoutEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      gsap.timeline()
        .fromTo('.skill-connector', { opacity: 0 }, { opacity: 1, duration: .6, stagger: .025, ease: 'power2.out', clearProps: 'opacity' })
        .from('.skill-node', { scale: .65, opacity: 0, duration: .4, stagger: .035, ease: 'back.out(1.3)' }, .1);
    }, root);
    return () => context.revert();
  }, [branch, reduced]);

  useLayoutEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      gsap.from('.skill-detail-copy', { x: -20, opacity: 0, duration: .3, ease: 'power3.out' });
    }, root);
    return () => context.revert();
  }, [selection, reduced]);

  return <section ref={root} className="skill-tree reveal" aria-label="Interactive skill tree">
    <div className="skill-affinities" role="tablist" aria-label="Skill branches" ref={tabs} onKeyDown={onTabKey}>
      {filters.map((name, i) => <button key={name} id={`skill-tab-${i}`} role="tab" aria-selected={branch === i - 1} aria-controls="skill-branches" tabIndex={branch === i - 1 ? 0 : -1} disabled={disabled} onClick={() => chooseBranch(i - 1)} style={{ '--branch-color': i === 0 ? '#effaff' : abilities[i - 1].color } as CSSProperties}>
        <span className="affinity-symbol" aria-hidden="true">{i === 0 ? '✦' : abilities[i - 1].mark}</span><span>{name}</span><b className="affinity-pointer" aria-hidden="true">!</b>
      </button>)}
    </div>
    <div className="skill-tree-layout">
      <aside id="skill-detail" className="skill-detail" style={{ '--branch-color': group.color } as CSSProperties} aria-label="Selected skill details">
        <div className="skill-detail-copy"><span className="skill-detail-symbol" aria-hidden="true">{skill.mark}</span><p className="skill-detail-category">{group.name}</p><h2>{skill.name}</h2><p className="skill-detail-description">{skill.description}</p><div className="skill-related"><h3>IN THIS BRANCH</h3>{group.skills.map((item, i) => <button key={item.name} disabled={disabled} aria-pressed={selection.skill === i} onClick={() => setSelection({ group: selection.group, skill: i })}>{item.name}<span aria-hidden="true">↗</span></button>)}</div></div>
        <p className="skill-draft">Technology map from the project brief.<br/>Proficiency levels are not assigned.</p>
      </aside>
      <div id="skill-branches" role="tabpanel" aria-labelledby={`skill-tab-${branch + 1}`} className={`skill-branches ${branch >= 0 ? 'is-focused' : ''}`}>
        {abilities.map((item, groupIndex) => (branch < 0 || branch === groupIndex) && <section className="skill-branch" key={item.name} aria-label={`${item.name} branch`} style={{ '--branch-color': item.color } as CSSProperties}>
          <h2>{item.name}<span>{String(item.skills.length).padStart(2, '0')} NODES</span></h2>
          <div className="skill-graph" data-compact={item.skills.length <= 2}>
            <svg className="skill-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {item.skills.map((node, skillIndex) => {
                // ponytail: two rows cover the current 2–4 skills; derive rows when a branch grows.
                const x = skillIndex % 2 === 0 ? 22 : 78;
                const y = skillIndex < 2 ? 48 : 83;
                return <path key={node.name} className={`skill-connector ${selection.group === groupIndex && selection.skill === skillIndex ? 'is-active' : ''}`} d={`M 50 14 V ${y - 13} L ${x} ${y}`}/>;
              })}
            </svg>
            <div className="skill-root" aria-hidden="true">{item.mark}</div>
            {item.skills.map((node, skillIndex) => <button className="skill-node" key={node.name} aria-label={`${node.name}, ${item.name}`} aria-pressed={selection.group === groupIndex && selection.skill === skillIndex} aria-controls="skill-detail" disabled={disabled} onClick={() => setSelection({ group: groupIndex, skill: skillIndex })} style={{ left: `${skillIndex % 2 === 0 ? 22 : 78}%`, top: `${skillIndex < 2 ? 48 : 83}%` }}><span className="skill-node-mark" aria-hidden="true">{node.mark}</span><span className="skill-node-label">{node.name}</span></button>)}
          </div>
        </section>)}
      </div>
    </div>
    <p id="skill-selected-status" className="sr-only" role="status" aria-atomic="true">{group.name}: {skill.name}. {skill.description}</p>
    <p className="skill-tree-hint"><span>SELECT A NODE TO EXPLORE</span><span>Branch tabs: <kbd>←</kbd> <kbd>→</kbd> · <kbd>Tab</kbd> Browse nodes</span></p>
  </section>;
}
