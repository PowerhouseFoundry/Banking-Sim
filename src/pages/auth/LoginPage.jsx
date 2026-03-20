import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import logo from "../../assets/powerhouse-logo.png";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      const loggedInUser = await login(cleanUsername, cleanPassword);

      if (loggedInUser.role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="ph-login-page"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eef3fb 0%, #dfe8f6 45%, #edf2f9 100%)",
        display: "grid",
        placeItems: "center",
        padding: "32px 20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1040px",
          display: "grid",
          gridTemplateColumns: "1fr 0.92fr",
          gap: "20px",
          alignItems: "stretch"
        }}
        className="ph-login-shell"
      >
        <div
          style={{
            position: "relative",
            borderRadius: "28px",
            overflow: "hidden",
            minHeight: "600px",
            padding: "30px",
            background:
              "linear-gradient(145deg, rgba(10,28,64,0.98) 0%, rgba(24,64,140,0.94) 52%, rgba(79,144,255,0.88) 100%)",
            boxShadow: "0 24px 60px rgba(20, 33, 61, 0.18)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
          className="ph-login-hero"
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 28%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.10), transparent 22%)",
              pointerEvents: "none"
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "block",
                marginBottom: "30px"
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    opacity: 0.88,
                    marginBottom: "4px"
                  }}
                >
                </div>
                <div style={{ fontSize: "18px", opacity: 0.9 }}>
                </div>
              </div>
            </div>

            <div style={{ maxWidth: "560px" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.82,
                  marginBottom: "14px"
                }}
              >
                Welcome
              </div>

              <h1
                style={{
                  margin: "0 0 14px",
                  fontSize: "46px",
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em"
                }}
              >
                PLC Bank Simulator
              </h1>

              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.8)",
                  marginTop: "10px"
                }}
              >
                Educational banking simulation for students. No real financial data is used.
              </p>

              <p
                style={{
                  margin: 0,
                  maxWidth: "500px",
                  fontSize: "20px",
                  lineHeight: 1.55,
                  opacity: 0.92
                }}
              >
                Check your balance, manage payments, spot fraud,
                and practise real money skills in this training bank account.
              </p>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "14px"
            }}
            className="ph-login-feature-grid"
          >
            {[
              { title: "Check payments", text: "Read account activity carefully." },
              { title: "Spot scams", text: "Learn to notice warning signs." },
              { title: "Build confidence", text: "Practise banking safely." }
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  borderRadius: "20px",
                  padding: "18px",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  backdropFilter: "blur(8px)"
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "6px" }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "14px", lineHeight: 1.45, opacity: 0.9 }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            minHeight: "600px",
            borderRadius: "28px",
            background: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(207, 216, 230, 0.95)",
            boxShadow: "0 24px 60px rgba(20, 33, 61, 0.10)",
            backdropFilter: "blur(10px)",
            padding: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden"
          }}
          className="ph-login-card-wrap"
        >
          <img
            src={logo}
            alt="PLC Bank"
            style={{
              position: "absolute",
              top: "-56px",
              left: "8px",
              width: "280px",
              height: "280px",
              objectFit: "contain",
              opacity: 0.7,
              pointerEvents: "none",
              zIndex: 1
            }}
          />

          <div
            style={{
              maxWidth: "420px",
              width: "100%",
              margin: "0 auto",
              position: "relative",
              zIndex: 2,
              paddingTop: "72px"
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#3563e9",
                  marginBottom: "10px"
                }}
              >
                Sign in
              </div>

              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: "30px",
                  lineHeight: 1.08,
                  color: "#17233c"
                }}
              >
                Access your bank account
              </h2>

              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  lineHeight: 1.55,
                  color: "#5b6b86"
                }}
              >
                Use your username and password to continue.
              </p>

              <p
                style={{
                  fontSize: "12px",
                  color: "#8a94a6",
                  marginTop: "8px"
                }}
              >
                This is a training system used in education, not a real bank.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="ph-form">
              <label className="ph-field">
                <span>Username</span>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="text"
                  style={{
                    minHeight: "58px",
                    borderRadius: "16px",
                    border: "1px solid #d7dfeb",
                    background: "white",
                    padding: "0 16px",
                    fontSize: "16px"
                  }}
                />
              </label>

              <label className="ph-field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  style={{
                    minHeight: "58px",
                    borderRadius: "16px",
                    border: "1px solid #d7dfeb",
                    background: "white",
                    padding: "0 16px",
                    fontSize: "16px"
                  }}
                />
              </label>

              {error ? (
                <div
                  className="ph-error-box"
                  style={{
                    borderRadius: "16px",
                    padding: "14px 16px"
                  }}
                >
                  {error}
                </div>
              ) : null}

              <button
                className="ph-button ph-button-primary"
                type="submit"
                disabled={loading}
                style={{
                  minHeight: "58px",
                  borderRadius: "16px",
                  fontSize: "17px",
                  fontWeight: 700,
                  boxShadow: "0 14px 28px rgba(29, 78, 216, 0.24)"
                }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .ph-login-shell {
            max-width: 960px !important;
            grid-template-columns: 1fr 0.95fr !important;
            gap: 18px !important;
          }

          .ph-login-hero,
          .ph-login-card-wrap {
            min-height: 560px !important;
            padding: 24px !important;
            border-radius: 24px !important;
          }

          .ph-login-hero h1 {
            font-size: 40px !important;
          }

          .ph-login-card-wrap h2 {
            font-size: 28px !important;
          }

          .ph-login-feature-grid {
            gap: 12px !important;
          }

          .ph-login-feature-grid > div {
            padding: 14px !important;
          }
        }

        @media (max-width: 980px) {
          .ph-login-shell {
            grid-template-columns: 1fr !important;
            max-width: 760px !important;
          }

          .ph-login-hero,
          .ph-login-card-wrap {
            min-height: auto !important;
          }

          .ph-login-feature-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .ph-login-page {
            padding: 18px 14px !important;
          }

          .ph-login-hero,
          .ph-login-card-wrap {
            padding: 22px !important;
            border-radius: 24px !important;
          }

          .ph-login-hero h1 {
            font-size: 36px !important;
          }

          .ph-login-card-wrap h2 {
            font-size: 28px !important;
          }
        }
      `}</style>
    </div>
  );
}