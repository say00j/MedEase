import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Loading from "./pages/Loading";
import RoleSelect from "./pages/RoleSelect";

import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorRegister from "./pages/doctor/DoctorRegister";
import DoctorHome from "./pages/doctor/DoctorHome";
import PatientList from "./pages/doctor/PatientList";
import Analytics from "./pages/doctor/Analytics";
import AddPatient from "./pages/doctor/AddPatient";
import PatientDataSummary from "./pages/doctor/PatientDataSummary";
import PatientSummary from "./pages/doctor/PatientSummary";
import FinalEvaluation from "./pages/doctor/FinalEvaluation";
import TestReview from "./pages/doctor/TestReview";
import TestResultsPage from "./pages/doctor/TestResultsPage";
import MedicineResultsPage from "./pages/doctor/MedicineResultsPage";
import PostUploadReview from "./pages/doctor/PostUploadReview";
import MedicineSelectPage from "./pages/doctor/MedicineSelectPage";
import DoctorPatientView from "./pages/doctor/DoctorPatientView";

import PatientLogin from "./pages/patient/PatientLogin";
import PatientRegister from "./pages/patient/PatientRegister";
import PatientHome from "./pages/patient/PatientHome";
import PatientDetails from "./pages/patient/PatientDetails";
import PatientRequests from "./pages/patient/PatientRequests";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Loading />} />
        <Route path="/login" element={<RoleSelect />} />

        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />
        <Route path="/doctor/home" element={<DoctorHome />} />
        <Route path="/doctor/patients" element={<PatientList />} />
        <Route path="/doctor/add-patient" element={<AddPatient />} />
        <Route path="/doctor/patient-data-summary" element={<PatientDataSummary />} />
        <Route path="/doctor/patient-summary" element={<PatientSummary />} />
        <Route path="/doctor/final-evaluation" element={<FinalEvaluation />} />
        <Route path="/doctor/test-review" element={<TestReview />} />
        <Route path="/doctor/test-results" element={<TestResultsPage />} />
        <Route path="/doctor/medicine-results" element={<MedicineResultsPage />} />
        <Route path="/doctor/post-upload-review" element={<PostUploadReview />} />
        <Route path="/doctor/medicine-select" element={<MedicineSelectPage />} />
        <Route path="/doctor/patient-view" element={<DoctorPatientView />} />
        <Route path="/doctor/analytics" element={<Analytics />} />

        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/register" element={<PatientRegister />} />
        <Route path="/patient/home" element={<PatientHome />} />
        <Route path="/patient/details" element={<PatientDetails />} />
        <Route path="/patient/requests" element={<PatientRequests />} />
      </Routes>
    </Router>
  );
}

export default App;
