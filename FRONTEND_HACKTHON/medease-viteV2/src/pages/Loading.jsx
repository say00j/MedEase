import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Loading() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login'), 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="loading-screen">
      <div className="animated-logo">
        <img
          src="/img/d4.jpeg"
          alt="MedEase"
          style={{ width: 120, height: 120, boxShadow: '0 8px 30px rgba(0,0,0,0.3)', objectFit: 'cover' }}
        />
        <div>MedEase</div>
      </div>
    </div>
  )
}
