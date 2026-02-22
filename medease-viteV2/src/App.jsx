import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Loading from './pages/Loading'
import RoleSelect from './pages/RoleSelect'

import DoctorLogin from './pages/doctor/DoctorLogin'
import DoctorRegister from './pages/doctor/DoctorRegister'
import DoctorHome from './pages/doctor/DoctorHome'
import PatientList from './pages/doctor/PatientList'
import Analytics from './pages/doctor/Analytics'

import PatientLogin from './pages/patient/PatientLogin'
import PatientRegister from './pages/patient/PatientRegister'
import PatientHome from './pages/patient/PatientHome'
import PatientDetails from './pages/patient/PatientDetails'

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
        <Route path="/doctor/analytics" element={<Analytics />} />

        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/register" element={<PatientRegister />} />
        <Route path="/patient/home" element={<PatientHome />} />
        <Route path="/patient/details" element={<PatientDetails />} />
      </Routes>
    </Router>
  )
}

export default App
