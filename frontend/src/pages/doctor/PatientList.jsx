import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

export default function PatientList() {
  return (
    <>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar role="doctor" />
        <div style={{ padding: "20px" }}>
          <h2>Patients</h2>
        </div>
      </div>
    </>
  );
}
