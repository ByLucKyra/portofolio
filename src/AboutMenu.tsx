import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import gsap from 'gsap';
import { sections, wrap } from './navigation.mjs';

const topics = [
  { name: 'PROFILE', title: 'Lucky Ramadhan', line: 'There’s still so much I want to learn. But that’s what makes it exciting, right?' },
  { name: 'STORY', title: 'A work in progress.', line: 'Every idea starts with a question. Every project gives me something new to learn.' },
  { name: 'INTERESTS', title: 'Beyond the code.', line: 'Different interests. Different perspectives. There’s always something new to discover.' },
  { name: 'VALUES', title: 'What drives me.', line: 'A better tomorrow, through ideas and code. That’s the direction I want to keep moving in.' },
  { name: 'EXTRA', title: 'Another perspective.', line: 'Small steps. Big progress. Sometimes that’s all the reminder you need.' },
];
const interests = [
  { name: 'Coding', text: 'An idea becomes much more interesting when you can turn it into something useful.' },
  { name: 'Learning', text: 'There’s always another question to ask, another skill to explore, and another way to improve.' },
  { name: 'Games', text: 'A good interaction can make a whole world feel alive. This portfolio explores that idea.' },
  { name: 'Music', text: 'Rhythm, mood, and a different way to experience a moment.' },
  { name: 'Travel', text: 'New places offer new perspectives — and plenty of things to be curious about.' },
  { name: 'Anime & arts', text: 'Expressive worlds, bold compositions, and stories told through their visual details.' },
];
const values = [
  ['Curiosity', 'Keep asking.', 'Stay curious about technology, people, and the problems worth solving.'],
  ['Purpose', 'Make it useful.', 'Build things that create opportunities, connect people, or solve a real problem.'],
  ['Growth', 'Keep learning.', 'Treat each project as a chance to learn, improve, and try again.'],
];

export function AboutMenu({ reduced, disabled, onNavigate }: { reduced: boolean; disabled: boolean; onNavigate: (screen: number) => void }) {
  const [topic, setTopic] = useState(0);
  const [interest, setInterest] = useState(0);
  const [perspective, setPerspective] = useState(0);
  const [line, setLine] = useState(topics[0].line);
  const root = useRef<HTMLElement>(null);
  const tabs = useRef<HTMLDivElement>(null);

  function choose(index: number) {
    if (disabled) return;
    setTopic(index);
    setLine(topics[index].line);
  }

  function onTabKey(event: KeyboardEvent) {
    if (disabled || event.altKey || event.ctrlKey || event.metaKey) return;
    let next: number;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = wrap(topic + 1, topics.length);
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = wrap(topic - 1, topics.length);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = topics.length - 1;
    else return;
    event.preventDefault(); choose(next);
    tabs.current?.querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();
  }

  useLayoutEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      gsap.from('.about-panel-content', { x: 30, opacity: 0, duration: .4, ease: 'power3.out' });
    }, root);
    return () => context.revert();
  }, [topic, reduced]);

  useLayoutEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      gsap.from('.about-dialogue p', { y: 10, opacity: 0, duration: .3, ease: 'power2.out' });
    }, root);
    return () => context.revert();
  }, [line, reduced]);

  const interestButtons = <div className="about-interest-grid">{interests.map((item, index) => <button key={item.name} disabled={disabled} aria-pressed={interest === index} onClick={() => { setInterest(index); setLine(item.text); }}><img src={`/assets/interest-${index}.svg`} alt="" width="30" height="30"/><span>{item.name}</span></button>)}</div>;

  return <section ref={root} className="about-character-menu reveal" aria-label="About Lucky">
    <div className="about-topic-tabs" role="tablist" aria-label="About topics" aria-orientation="vertical" ref={tabs} onKeyDown={onTabKey}>
      {topics.map((item, index) => <button key={item.name} id={`about-tab-${index}`} role="tab" aria-selected={topic === index} aria-controls="about-topic-panel" tabIndex={topic === index ? 0 : -1} disabled={disabled} onClick={() => choose(index)}><span>{item.name}</span></button>)}
    </div>
    <div className="about-conversation">
      <p className="about-handnote" aria-hidden="true">Still learning.<br/><span>Always building.</span></p>
      <div className="about-questions" role="group" aria-label="Ask Lucky"><p>What do you want to know?</p>{['Tell me about your journey.', 'What are your interests?', 'What drives you?', 'Show me another perspective.'].map((question, index) => <button key={question} disabled={disabled} aria-pressed={topic === index + 1} onClick={() => choose(index + 1)}>{question}</button>)}</div>
      <div className="about-dialogue"><span className="about-speaker">Lucky</span><p role="status" aria-atomic="true">{line}</p><small>SELECT A TOPIC · KEEP THE CONVERSATION GOING</small></div>
    </div>
    <div id="about-topic-panel" className="about-topic-panel" role="tabpanel" aria-labelledby={`about-tab-${topic}`}>
      <div className="about-panel-content">
        <p className="about-panel-kicker">{String(topic + 1).padStart(2, '0')} / {topics[topic].name}</p><h2>{topics[topic].title}</h2>
        {topic === 0 && <>
          <p className="about-introduction">I’m a software developer who loves turning ideas into real, useful things. Always curious, always learning, and ready for the next challenge.</p>
          <div className="about-profile-grid"><section className="about-info-box"><h3>BASIC INFORMATION</h3><dl><dt>NAME</dt><dd>Lucky Ramadhan</dd><dt>ROLE</dt><dd>Software Developer</dd><dt>FOCUS</dt><dd>Building useful things</dd></dl></section><section className="about-info-box"><h3>APPROACH</h3>{values.map(([name, caption], index) => <button className="about-trait" key={name} disabled={disabled} onClick={() => { choose(3); setLine(values[index][2]); }}><span>0{index + 1}</span><strong>{name}</strong><small>{caption}</small></button>)}</section></div>
          <section className="about-info-box"><h3>INTERESTS <span>SELECT TO EXPLORE</span></h3>{interestButtons}</section>
          <div className="about-quote-row"><blockquote>“A better tomorrow,<br/>through ideas and code.”<cite>Lucky Ramadhan</cite></blockquote><figure><img src="/assets/about-study.png" alt="Illustrated blue study overlooking a city"/><figcaption>Small steps.<br/>Big progress.</figcaption></figure></div>
        </>}
        {topic === 1 && <><p className="about-introduction">A journey of learning, exploring, and making useful things through code.</p><ol className="about-story">{[['LEARN', 'Start with curiosity.', 'Ask questions, explore technology, and build an understanding of how things work.'], ['BUILD', 'Turn ideas into practice.', 'Experiment with applications and learn from the problems along the way.'], ['REPEAT', 'Keep moving forward.', 'Reflect, improve, and bring those lessons into the next project.']].map(([label, title, text]) => <li key={label}><span>{label}</span><h3>{title}</h3><p>{text}</p></li>)}</ol><button className="about-action" disabled={disabled} onClick={() => onNavigate(sections.indexOf('EXPERIENCE'))}>EXPLORE EXPERIENCE <span aria-hidden="true">↗</span></button></>}
        {topic === 2 && <><p className="about-introduction">Same person. Different perspectives. Pick an interest to learn a little more.</p><section className="about-info-box">{interestButtons}</section><div className="about-interest-detail"><img src={`/assets/interest-${interest}.svg`} alt="" width="64" height="64"/><h3>{interests[interest].name}</h3><p>{interests[interest].text}</p></div></>}
        {topic === 3 && <><p className="about-introduction">I want to keep building, keep learning, and contribute to solutions that make a positive impact.</p><div className="about-values">{values.map(([name, caption, text], index) => <button key={name} disabled={disabled} aria-pressed={line === text} onClick={() => setLine(text)}><span>0{index + 1}</span><div><h3>{name}</h3><strong>{caption}</strong><p>{text}</p></div></button>)}</div></>}
        {topic === 4 && <><p className="about-introduction">A few ideas to take into the next chapter.</p><blockquote className="about-perspective">“{interests[perspective].text}”</blockquote><button className="about-action" disabled={disabled} onClick={() => { const next = wrap(perspective + 1, interests.length); setPerspective(next); setLine(interests[next].text); }}>ANOTHER PERSPECTIVE <span aria-hidden="true">↻</span></button><div className="about-next"><button disabled={disabled} onClick={() => onNavigate(sections.indexOf('PROJECTS'))}>VIEW PROJECTS ↗</button><button disabled={disabled} onClick={() => onNavigate(sections.indexOf('CONTACT'))}>GET IN TOUCH ↗</button></div></>}
      </div>
      <p className="about-copy-note">PROFILE COPY / DRAFT</p>
    </div>
  </section>;
}
