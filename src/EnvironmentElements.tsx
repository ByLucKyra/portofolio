import './environment-elements.css';

const architecture = [
  <g key="about">
    <path className="element-glass" d="m1070 72 350 109-32 652-355-130Z"/>
    <path className="element-face" d="m1070 72 35-18 350 104-35 23Z"/>
    <path className="element-edge" d="m1070 72 350 109-32 652-355-130Z"/>
    <path className="element-line" d="m1100 112 284 89-25 580-285-99Z"/>
    <path className="element-reflection" d="m1279 169 69 22-193 515-63-24Z"/>
    <path className="element-line" d="m1020 797 361 132 141-77"/>
  </g>,
  <g key="experience">
    <path className="element-glass" d="m660 1010 497-621 271-124-350 745Z"/>
    <path className="element-face" d="m995 1010 274-619 76-44-230 663Z"/>
    <path className="element-edge" d="m677 996 500-594 244-135M957 1010l339-651"/>
    <path className="element-line" d="m859 792 301 43M967 654l243 34M1064 536l194 23M1144 440l154 14M1230 356l95 6"/>
    <path className="element-glass" d="M1490 186h49v708l-49 91Z"/>
    <path className="element-edge" d="M1490 186v799M1468 226h115M1468 273h115"/>
  </g>,
  <g key="projects">
    <path className="element-glass" d="m933 184 349-98 227 108-348 107Z"/>
    <path className="element-face" d="m933 184 228 117v29L933 211Z"/>
    <path className="element-edge" d="m933 184 228 117 348-107"/>
    <path className="element-glass" d="m1023 421 349-98 227 108-348 107Z"/>
    <path className="element-face" d="m1023 421 228 117v29l-228-119Z"/>
    <path className="element-edge" d="m1023 421 228 117 348-107"/>
    <path className="element-glass" d="m862 711 349-98 227 108-348 107Z"/>
    <path className="element-face" d="m862 711 228 117v29L862 738Z"/>
    <path className="element-edge" d="m862 711 228 117 348-107"/>
    <path className="element-line" d="M1161 330v141M1251 567v161M1090 857v105"/>
  </g>,
  <g key="skills">
    <path className="element-glass" d="m1330 11 43 21v717l-43 28Z"/>
    <path className="element-face" d="m1030 315 282 93v48l-282-93ZM1373 482l212-138v46l-212 139Z"/>
    <path className="element-edge" d="M1330 25v752M1330 429l-300-98V177M1330 510l255-162V154M1330 643l-190 112v154"/>
    <path className="element-line" d="M1030 244 906 194v-85M1490 410V260l-89-48"/>
    <path className="element-glass" d="m1004 154 26-15 26 15v30l-26 15-26-15ZM1559 128l26-15 26 15v30l-26 15-26-15ZM1114 909l26-15 26 15v30l-26 15-26-15Z"/>
    <path className="element-edge" d="m1004 154 26 15 26-15M1030 169v30M1559 128l26 15 26-15M1585 143v30M1114 909l26 15 26-15M1140 924v30"/>
  </g>,
  <g key="achievements">
    <path className="element-glass" d="m1015 675 72-328 73 328v319h-145ZM1215 485l81-462 84 462v509h-165ZM1450 637l76-376 76 376v357h-152Z"/>
    <path className="element-face" d="m1087 347 73 328v319h-73ZM1296 23l84 462v509h-84ZM1526 261l76 376v357h-76Z"/>
    <path className="element-edge" d="m1015 675 72-328 73 328M1215 485l81-462 84 462M1450 637l76-376 76 376"/>
    <path className="element-line" d="M1087 377v617M1296 61v933M1526 291v703M918 937h708M953 967h673"/>
    <path className="element-spark" d="m1471 42 5 27 27 5-27 5-5 27-5-27-27-5 27-5Z"/>
  </g>,
  <g key="contact">
    <path className="element-glass" d="m1199 690 109-126 109 126-40 304h-138Z"/>
    <path className="element-face" d="m1308 564 109 126-40 304h-69Z"/>
    <path className="element-edge" d="m1199 690 109-126 109 126M1308 564V284"/>
    <path className="element-line" d="M1240 419a116 116 0 1 1 136 0M1178 483a205 205 0 1 1 260 0M1117 549a296 296 0 1 1 382 0"/>
    <path className="element-face" d="m1036 881 237-102 269 84-236 117Z"/>
    <path className="element-edge" d="m1036 881 270 99 236-117"/>
    <path className="element-spark" d="m1308 268 8 16-8 16-8-16Z"/>
  </g>,
];

export function EnvironmentElements({ theme }: { theme: number }) {
  return <div className="environment-elements" data-theme={theme} aria-hidden="true">
    <div className="parallax-layer elements-far">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMaxYMid slice" focusable="false">
        <ellipse className="element-line" cx="1330" cy="350" rx="620" ry="254" transform="rotate(-31 1330 350)"/>
        <ellipse className="element-line" cx="1330" cy="350" rx="650" ry="270" transform="rotate(-31 1330 350)"/>
        <path className="element-line" d="m659 925 914-792M1422-80l-248 1140"/>
        <path className="element-spark" d="m843 422 4 17 17 4-17 4-4 17-4-17-17-4 17-4ZM1411 835l3 12 12 3-12 3-3 12-3-12-12-3 12-3Z"/>
      </svg>
    </div>
    <div className="parallax-layer elements-middle">
      <svg key={theme} className="element-architecture" viewBox="0 0 1600 1000" preserveAspectRatio="xMaxYMid slice" focusable="false">{architecture[theme] ?? architecture[0]}</svg>
    </div>
    <div className="parallax-layer elements-near">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMaxYMid slice" focusable="false">
        <path className="element-glass" d="m1558-80 153 27-197 1100-104-41Z"/>
        <path className="element-face" d="m1558-80 33 6-143 1089-38-9Z"/>
        <path className="element-edge" d="m1558-80-148 1086M1591-74l-143 1089"/>
        <path className="element-glass" d="m-105 680 171 330 383 55-297-166Z"/>
        <path className="element-edge" d="m-105 680 257 219 297 166"/>
        <path className="element-reflection" d="m1445 696 123-93-63 145-82 72Z"/>
      </svg>
    </div>
  </div>;
}
