import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./RoleSelect.css";

export default function RoleSelect() {
  return (
    <>
      <Navbar />

      <div className="login-container">
        <div className="login-left">
          <img
            src="/img/d2.jpg"
            alt="MedEase Illustration"
            className="illustration"
          />
        </div>

        <div className="login-right">
          <h2>Welcome to MedEase</h2>
          <p>
            Your professional healthcare assistant. Please select your role to
            continue.
          </p>

          <div className="login-tabs">
            <Link to="/doctor/login" className="tab-btn">
              Login as Doctor
            </Link>

            <Link to="/patient/login" className="tab-btn">
              Login as Patient
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
