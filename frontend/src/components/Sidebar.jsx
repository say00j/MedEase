import { Link } from "react-router-dom";

export default function Sidebar({ role }) {
  return (
    <div style={styles.sidebar}>
      {role === "doctor" && (
        <>
          <Link to="/doctor/home">Home</Link>
          <Link to="/doctor/patients">Patients</Link>
          <Link to="/doctor/analytics">Analytics</Link>
        </>
      )}

      {role === "patient" && (
        <>
          <Link to="/patient/home">Home</Link>
          <Link to="/patient/details">Details</Link>
        </>
      )}
    </div>
  );
}

const styles = {
  sidebar: {
    width: "200px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    borderRight: "1px solid #ddd",
  },
};
