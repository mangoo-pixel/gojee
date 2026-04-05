import Link from "next/link";
import "./welcome.css";

export default function WelcomePage() {
  return (
    <div className="gj-page">
      <header className="gj-header">
        <div className="gj-logo">
          <div className="gj-logo-top">
            <span className="gj-logo-icon">explore</span>
            <span className="gj-logo-name">Gojee</span>
          </div>
          <span className="gj-logo-tagline">Your travel made simple</span>
        </div>
      </header>

      <main className="gj-main">
        <div className="gj-top">
          <div className="gj-illustration">
            <div className="gj-illustration-glow" />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuATnBXJCQ1ms1CQVceO8Ugjccc1fmiRXOq1O9TUlG_zFlMsCPCj7BF7aa_M2rNKGFSKjJpRyJWy_v40BWr1NbppxldPafP05SMeIDT6BURgFuBhtgSXsvEKxRlixFpIdvlqluT4fcIPXiZPnzlSqwUyEw6qaqeLIx6AebsoNrPFbo5sHYH02KxXsmEmlMazc2sZwCUdVLMW7CKH9h5Qu7745U6rQD31j46NaiwezmmSfJ0y8m5Fbo5eEH2s_qp1EKASBGMRpJD4zI_D"
              alt="Gojee travel illustration"
            />
          </div>

          <div className="gj-text">
            <h2>Travel made simple, anywhere.</h2>
            <p>Save spots from Instagram. Plan your trip. Travel safely.</p>
          </div>

          <div className="gj-features">
            <div className="gj-feature">
              <div className="gj-feature-icon orange">location_on</div>
              <span>Save any spot</span>
            </div>
            <div className="gj-feature">
              <div className="gj-feature-icon teal">map</div>
              <span>Plan your route</span>
            </div>
            <div className="gj-feature">
              <div className="gj-feature-icon red">shield_with_heart</div>
              <span>Stay safe</span>
            </div>
          </div>
        </div>

        <div className="gj-buttons">
          <Link href="/" className="gj-btn-primary">
            Get Started
          </Link>
          <Link href="/" className="gj-btn-outline">
            Log In
          </Link>
        </div>
      </main>

      <footer className="gj-footer">
        <p>By continuing, you agree to our Terms and Privacy Policy.</p>
      </footer>
    </div>
  );
}
