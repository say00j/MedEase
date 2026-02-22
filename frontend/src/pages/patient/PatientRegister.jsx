import { useState } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function PatientRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    mobile_number: "",
    password: "",
    medical_data: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/add-patient", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Patient Registered Successfully");
      navigate("/patient/login");
    } else {
      alert("Registration failed");
    }
  };

  return (
    <>
      <Navbar />
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Patient Register</h2>

        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          placeholder="Mobile Number"
          value={form.mobile_number}
          onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <textarea
          placeholder="Initial Medical Information (Optional)"
          value={form.medical_data}
          onChange={(e) => setForm({ ...form, medical_data: e.target.value })}
          rows="4"
        />

        <button>Register</button>
      </form>
    </>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "320px",
    margin: "100px auto",
  },
};
