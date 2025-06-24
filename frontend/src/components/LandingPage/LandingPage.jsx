import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="lp-navbar">
        <div className="lp-nav-left">
          <svg className="lp-logo-svg" width="32" height="32" fill="none" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="6" className="lp-logo-rect1" />
            <rect x="8" y="12" width="5" height="12" rx="2" className="lp-logo-rect2" />
            <rect x="15" y="6" width="5" height="18" rx="2" className="lp-logo-rect2" />
            <rect x="22" y="18" width="5" height="6" rx="2" className="lp-logo-rect2" />
          </svg>
          <span className="lp-logo-text">your-pace.ai</span>
        </div>
        <div className="lp-nav-right">
          <span className="lp-nav-link">
            Features
          </span>
          <button className="lp-get-started-nav">Get Started</button>
        </div>
      </nav>

      <main className="lp-hero">
        <h1 className="lp-hero-title">
          An AI tutor made <span className="lp-for-you">for you</span>
        </h1>
        <p className="lp-hero-desc">
          Turns your learning materials into notes, interactive chats, quizzes, and more
        </p>
        <div className="lp-hero-buttons">
          <button className="lp-see-features">See features</button>
          <button className="lp-get-started">Get Started</button>
        </div>
        <div className="lp-avatars-row">
          <span className="lp-avatars">
            <span className="lp-avatar lp-blue">A</span>
            <span className="lp-avatar lp-red">F</span>
            <span className="lp-avatar lp-orange">Z</span>
            <span className="lp-avatar lp-black">A</span>
          </span>
          <span className="lp-loved-by">Loved by 1,000,000+ learners</span>
        </div>
      </main>
    </div>
  );
}
