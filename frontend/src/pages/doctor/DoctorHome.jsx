import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

export default function DoctorHome() {
  return (
    <>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar role="doctor" />
        <div style={{ padding: "20px" }}>
          <h2>Doctor Dashboard</h2>
        </div>
      </div>
    </>
  );
}
