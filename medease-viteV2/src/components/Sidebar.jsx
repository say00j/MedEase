import { NavLink } from 'react-router-dom'

export default function Sidebar({ role }) {
  return (
    <aside className="sidebar">
      {role === 'doctor' && (
        <>
          <NavLink to="/doctor/home" className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')}>
            🏠 Home
          </NavLink>
          <NavLink to="/doctor/patients" className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')}>
            📋 Patient List
          </NavLink>
          <NavLink to="/doctor/analytics" className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')}>
            📊 Analytics
          </NavLink>
        </>
      )}
      {role === 'patient' && (
        <>
          <NavLink to="/patient/home" className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')}>
            🏠 Home
          </NavLink>
          <NavLink to="/patient/details" className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')}>
            📄 Patient Details
          </NavLink>
        </>
      )}
    </aside>
  )
}
