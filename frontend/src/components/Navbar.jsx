export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2>MedEase</h2>
    </nav>
  );
}

const styles = {
  nav: {
    background: "#d32f2f",
    color: "white",
    padding: "15px 40px",
    fontWeight: "bold",
    fontSize: "20px",
  },
};
