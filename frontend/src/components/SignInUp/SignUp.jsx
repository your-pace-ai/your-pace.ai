import "./SignUp.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signup } from "../../api/api"

export const SignUp = () => {
    const navigate = useNavigate()
    const [showPassword, setshowPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")

    const handleSubmit = async (e) => {
      e.preventDefault()

      try {
        await signup(email, password)
        navigate("/login")
      } catch (error) {
        throw new Error(error)
      }
    }

    return (
        <div className="sign-up-bg">
          <nav className="sign-up-navbar">
            <div className="sign-up-logo-area">
              <svg className="lp-logo-svg" width="32" height="32" fill="none" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="6" className="lp-logo-rect1" />
                <rect x="8" y="12" width="5" height="12" rx="2" className="lp-logo-rect2" />
                <rect x="15" y="6" width="5" height="18" rx="2" className="lp-logo-rect2" />
                <rect x="22" y="18" width="5" height="6" rx="2" className="lp-logo-rect2" />
              </svg>
              <span className="sign-up-logo-text">your-pace.com</span>
            </div>
          </nav>
          <div className="sign-up-form-container">
            <div className="sign-up-form">
              <svg className="sign-up-form-logo" width="42" height="42" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="6" className="lp-logo-rect1" />
                <rect x="8" y="12" width="5" height="12" rx="2" className="lp-logo-rect2" />
                <rect x="15" y="6" width="5" height="18" rx="2" className="lp-logo-rect2" />
                <rect x="22" y="18" width="5" height="6" rx="2" className="lp-logo-rect2" />
              </svg>
              <h2 className="sign-up-form-title">Get Started</h2>
              <p className="sign-up-form-subtitle">Let's start your learning journey.</p>
              <button className="sign-up-google-btn">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/250px-Google_Favicon_2025.svg.png" alt="G" className="google-icon" />
                Signup with Google
              </button>
              <div className="sign-up-or-row">
                <div className="sign-up-or-line" />
                <span className="sign-up-or-text">or signup with</span>
                <div className="sign-up-or-line" />
              </div>
              <form onSubmit={handleSubmit}>

                <input
                  className="sign-up-input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="username"
                />

                <div className="sign-up-password-row">
                  <input
                    className="sign-up-input-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <span
                    className="sign-up-eye"
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
                <button className="sign-up-signin-btn" type="submit">
                  Sign Up
                </button>
              </form>
            </div>
          </div>
        </div>
      );
}
