import './menu-emblem.css';

const symbols = [
  <g key="identity"><path d="M280 166 365 280 280 394 195 280Z"/><path d="M280 166V394M280 204 337 280 280 356"/><path className="emblem-highlight" d="m220 272 34-45M226 296l28-38"/><path className="emblem-solid" d="m280 267 10 13-10 13-10-13Z"/></g>,
  <g key="journey"><path d="M197 364h65l-39-79h106l-44-91h78"/><path className="emblem-highlight" d="m346 179 17 15-17 15"/>{[[197,364],[223,285],[285,194]].map(([x,y]) => <circle key={y} cx={x} cy={y} r="9" className="emblem-node"/>)}</g>,
  <g key="projects"><path className="emblem-muted" d="m184 250 96-55 96 55-96 55Z"/><path d="m184 280 96-55 96 55-96 55Z"/><path className="emblem-highlight" d="m184 311 96-55 96 55-96 55Z"/><path d="M184 311v20l96 55 96-55v-20M280 366v20"/></g>,
  <g key="skills"><path d="M280 208v51M207 310v-51h146v51M207 310v54M353 310v54"/><path className="emblem-highlight" d="M280 259v69"/><circle cx="280" cy="194" r="17" className="emblem-node"/><circle cx="207" cy="310" r="13" className="emblem-node"/><circle cx="353" cy="310" r="13" className="emblem-node"/><path className="emblem-solid" d="m280 328 12 17-12 17-12-17Z"/><path d="m207 364-10 15h20ZM353 364l-10 15h20Z"/></g>,
  <g key="achievements"><path className="emblem-highlight" d="m280 187 22 65 68 8-52 43 15 67-53-37-53 37 15-67-52-43 68-8Z"/><path d="M251 390c-57-13-92-61-81-126M309 390c57-13 92-61 81-126M182 327l-27-8 5-25M197 354l-29 1-4-26M220 376l-26 10-12-24M378 327l27-8-5-25M363 354l29 1 4-26M340 376l26 10 12-24"/></g>,
  <g key="contact"><path d="M231 216a80 80 0 0 0 0 128M329 216a80 80 0 0 1 0 128"/><path className="emblem-muted" d="M209 186a117 117 0 0 0 0 188M351 186a117 117 0 0 1 0 188"/><path className="emblem-highlight" d="m280 248 24 32-24 32-24-32Z"/><path d="M280 312v59M259 371h42"/></g>,
];

export function MenuEmblem({ selected, reduced }: { selected: number; reduced: boolean }) {
  return <div className="menu-emblem" data-theme={selected} data-reduced={reduced} aria-hidden="true">
    <svg viewBox="0 0 560 560" fill="none" focusable="false">
      <circle className="emblem-halo" cx="280" cy="280" r="150"/>
      <g className="emblem-orbit">
        <circle className="emblem-orbit-line" cx="280" cy="280" r="227"/>
        <path className="emblem-highlight" d="M280 53a227 227 0 0 1 196.6 113.5M280 507A227 227 0 0 1 83.4 393.5"/>
        <path className="emblem-solid" d="m280 44 9 9-9 9-9-9ZM280 498l9 9-9 9-9-9Z"/>
      </g>
      <g className="emblem-frame">
        <path className="emblem-facet" d="M280 86 474 280 280 474 86 280Z"/>
        <path className="emblem-outline" d="m280 104 176 176-176 176L104 280Z"/>
        <path className="emblem-corners" d="m249 117 31-31 31 31M443 249l31 31-31 31M311 443l-31 31-31-31M117 311l-31-31 31-31"/>
      </g>
      <g className="emblem-symbols">{symbols.map((symbol, i) => <g key={i} className={`emblem-symbol${selected === i ? ' is-active' : ''}`}>{symbol}</g>)}</g>
      <g className="emblem-satellites"><path d="m280 16 7 10-7 10-7-10ZM280 524l7 10-7 10-7-10Z"/><path d="M16 280h20M26 270v20M524 280h20M534 270v20"/></g>
    </svg>
  </div>;
}
