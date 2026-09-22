import './welcome-students.css';

export function WelcomeStudents() {
  return <div className="welcome-students" aria-hidden="true">
    {(['standing', 'leaning', 'seated'] as const).map(pose =>
      <div className={`welcome-student welcome-student--${pose}`} key={pose}>
        <div className="welcome-student-depth">
          <img src={`/assets/welcome-student-${pose}.png`} alt="" width="1024" height="1536" draggable={false} decoding="async"/>
        </div>
      </div>
    )}
  </div>;
}
