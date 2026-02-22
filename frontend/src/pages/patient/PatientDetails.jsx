import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

export default function PatientDetails() {
  return (
    <>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar role="patient" />
        <div style={{ padding: "20px" }}>
          <h2>Patient Details</h2>
        </div>
      </div>
    </>
  );
}
