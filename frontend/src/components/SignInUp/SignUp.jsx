import "./SignUp.css"
import { useState } from "react";

export const SignUp = () => {
    const [showPassword, setshowPassword] = useState(false);

    return (
        <div className="login-bg">
          <nav className="login-navbar">
            <div className="login-logo-area">
              <svg className="lp-logo-svg" width="32" height="32" fill="none" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="6" className="lp-logo-rect1" />
                <rect x="8" y="12" width="5" height="12" rx="2" className="lp-logo-rect2" />
                <rect x="15" y="6" width="5" height="18" rx="2" className="lp-logo-rect2" />
                <rect x="22" y="18" width="5" height="6" rx="2" className="lp-logo-rect2" />
              </svg>
              <span className="login-logo-text">your-pace.com</span>
            </div>
          </nav>
          <div className="login-form-container">
            <div className="login-form">
              <svg className="login-form-logo" width="42" height="42" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="6" className="lp-logo-rect1" />
                <rect x="8" y="12" width="5" height="12" rx="2" className="lp-logo-rect2" />
                <rect x="15" y="6" width="5" height="18" rx="2" className="lp-logo-rect2" />
                <rect x="22" y="18" width="5" height="6" rx="2" className="lp-logo-rect2" />
              </svg>
              <h2 className="login-form-title">Get Started</h2>
              <p className="login-form-subtitle">Let's start your learning journey.</p>
              <button className="login-google-btn">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/250px-Google_Favicon_2025.svg.png" alt="G" className="google-icon" />
                SignUp with Google
              </button>
              <div className="login-or-row">
                <div className="login-or-line" />
                <span className="login-or-text">or signup with</span>
                <div className="login-or-line" />
              </div>
              <form>
                {/* first name */}
                <input
                  className="login-input-first-name"
                  type="text"
                  placeholder="Enter your first name"
                  autoComplete="username"
                />
                {/* last name */}
                <input
                  className="login-input-last-name"
                  type="text"
                  placeholder="Enter your last name"
                  autoComplete="username"
                />
                {/* email */}
                <input
                  className="login-input-email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="username"
                />
                {/* enter password */}
                <div className="login-password-row">
                  <input
                    className="login-input-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <span
                    className="login-eye"
                    onClick={() => setshowPassword((v) => !v)}
                    tabIndex={0}
                    role="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="3.5" stroke="#a3a3a3" strokeWidth="1.7" />
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                        stroke="#a3a3a3"
                        strokeWidth="1.7"
                        fill="none"
                      />
                    </svg>
                  </span>
                </div>
                <button className="login-signin-btn" type="submit">
                  Sign Up
                </button>
              </form>
            </div>
          </div>
        </div>
      );
}
