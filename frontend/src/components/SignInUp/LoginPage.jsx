import { useState, useEffect } from "react"
import "./LoginPage.css"
import { Link, useNavigate } from 'react-router-dom'
import { login } from "../../api/api"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (error) {
      throw new Error(error)
    }
  }

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
        <Link to="/login" className="login-signin-top">Sign in</Link>
      </nav>
      <div className="login-form-container">
        <div className="login-form">
          <svg className="login-form-logo" width="42" height="42" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" className="lp-logo-rect1" />
            <rect x="8" y="12" width="5" height="12" rx="2" className="lp-logo-rect2" />
            <rect x="15" y="6" width="5" height="18" rx="2" className="lp-logo-rect2" />
            <rect x="22" y="18" width="5" height="6" rx="2" className="lp-logo-rect2" />
          </svg>
          <h2 className="login-form-title">Welcome!</h2>
          <p className="login-form-subtitle">Let's start your learning journey.</p>
          <button className="login-google-btn">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/250px-Google_Favicon_2025.svg.png" alt="G" className="google-icon" />
            <a className="login-google-link" href="http://localhost:3000/auth/google">Continue with Google</a>
          </button>
          <div className="login-or-row">
            <div className="login-or-line" />
            <span className="login-or-text">or continue with</span>
            <div className="login-or-line" />
          </div>
          <form onSubmit={handleSubmit}>
            <input
              className="login-input-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="username"
            />
            <div className="login-password-row">
              <input
                className="login-input-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <span
                className="login-eye"
                onClick={() => setShowPassword((v) => !v)}
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
            <div className="login-actions-row">
              <span className="login-forgot">Forgot password?</span>
            </div>
            <button className="login-signin-btn" type="submit">
              Sign In
            </button>
          </form>
          <div className="login-signup-row">
            <span>Don't have an account? </span>
            <Link to="/signup" className="login-signup-link" href="#">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
