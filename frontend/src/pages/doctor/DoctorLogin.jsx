import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function DoctorLogin() {
  const navigate = useNavigate();
  const [license, setLicense] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/doctor-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ license_number: license, password }),
    });

    if (res.ok) navigate("/doctor/home");
    else alert("Invalid credentials");
  };

  return (
    <>
      <Navbar />
      <form onSubmit={handleLogin} style={styles.form}>
        <h2>Doctor Login</h2>
        <input
          placeholder="License Number"
          onChange={(e) => setLicense(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>Login</button>
      </form>
    </>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "300px",
    margin: "100px auto",
  },
};
