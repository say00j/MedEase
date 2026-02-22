import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

export default function Analytics() {
  return (
    <>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar role="doctor" />
        <div style={{ padding: "20px" }}>
          <h2>Analytics</h2>
        </div>
      </div>
    </>
  );
}
