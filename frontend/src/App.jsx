import React from "react";

export default function Dashboard() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Doctor Dashboard</h1>
        <p style={styles.subtitle}>
          Manage patient records efficiently and securely
        </p>

        <div style={styles.cardContainer}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>View Patients</h2>
            <p style={styles.cardText}>
              Access patient list, review medical summaries, and manage records.
            </p>
            <button style={styles.primaryBtn}>View Patients</button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Add Patient</h2>
            <p style={styles.cardText}>
              Register a new patient and securely store medical details.
            </p>
            <button style={styles.secondaryBtn}>Add Patient</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f9",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    textAlign: "center",
    maxWidth: "900px",
    width: "100%",
    padding: "40px",
  },

  title: {
    fontSize: "36px",
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "50px",
  },

  cardContainer: {
    display: "flex",
    gap: "40px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  card: {
    background: "white",
    padding: "40px",
    borderRadius: "15px",
    width: "320px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    transition: "0.3s",
  },

  cardTitle: {
    fontSize: "22px",
    marginBottom: "15px",
  },

  cardText: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "25px",
  },

  primaryBtn: {
    padding: "12px 25px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
    fontSize: "15px",
  },

  secondaryBtn: {
    padding: "12px 25px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#28a745",
    color: "white",
    cursor: "pointer",
    fontSize: "15px",
  },
};
