import { useState, useEffect } from 'react'
import { auth } from '../firebase'

const API = import.meta.env.VITE_API_URL

const toThai24 = (t) => {
  if (!t) return '-'
  const d = new Date(t)
  return new Date(d.getTime() + 7*3600*1000).toISOString().slice(11,16)
}

async function apiCall(path, method = 'GET', body = null) {
  const token = await auth.currentUser?.getIdToken()
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : null
  })
  return res.json()
}

export default function Attendance() {
  const [status, setStatus] = useState(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const loadStatus = () => apiCall('/attendance/today').then(setStatus)
  useEffect(() => { loadStatus() }, [])

  const checkIn = async () => {
    setLoading(true); setMsg('')
    try {
      if (!navigator.geolocation) throw new Error('GPS ไม่รองรับ')
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const res = await apiCall('/attendance/check-in', 'POST', {
          method: 'gps', latitude: pos.coords.latitude, longitude: pos.coords.longitude
        })
        if (res.detail) setMsg('❌ ' + res.detail)
        else { setMsg('✅ ลงเวลาเข้างานสำเร็จ เวลา ' + toThai24(res.time)); loadStatus() }
        setLoading(false)
      }, () => { setMsg('❌ ไม่สามารถรับ GPS ได้'); setLoading(false) })
    } catch (e) { setMsg('❌ ' + e.message); setLoading(false) }
  }

  const checkOut = async () => {
    setLoading(true); setMsg('')
    const res = await apiCall('/attendance/check-out', 'POST')
    if (res.detail) setMsg('❌ ' + res.detail)
    else { setMsg('✅ ออกงานสำเร็จ เวลา ' + toThai24(res.time) + ' (ทำงาน ' + res.worked_hours?.toFixed(1) + ' ชม.)'); loadStatus() }
    setLoading(false)
  }

  const statusLabel = (s) => ({
    checked_in: '✅ เข้างานแล้ว', checked_out: '✅ ออกงานแล้ว', not_checked_in: '⏰ ยังไม่ได้ลงเวลา'
  }[s] || s)

  const sty = {
    page: { minHeight: '100vh', background: '#fff0f6', padding: '20px', fontFamily: 'sans-serif' },
    heading: { color: '#e91e8c', fontSize: '1.4rem', marginBottom: '16px' },
    card: { background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(233,30,140,0.1)' },
    sub: { color: '#e91e8c', fontSize: '1rem', marginBottom: '8px' },
    info: { lineHeight: 2 },
    btnRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    btn: { flex: 1, padding: '14px', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' },
    msg: { marginTop: '16px', padding: '12px', borderRadius: '8px', background: '#fff0f6', color: '#333', textAlign: 'center' }
  }

  return (
    <div style={sty.page}>
      <h2 style={sty.heading}>⏰ ลงเวลาทำงาน</h2>
      <div style={sty.card}>
        <h3 style={sty.sub}>สถานะวันนี้</h3>
        {status ? (
          <div style={sty.info}>
            <p>สถานะ: <strong>{statusLabel(status.status)}</strong></p>
            <p>เข้างาน: <strong>{toThai24(status.check_in_at)}</strong></p>
            <p>ออกงาน: <strong>{toThai24(status.check_out_at)}</strong></p>
          </div>
        ) : <p>กำลังโหลด...</p>}
      </div>
      <div style={sty.btnRow}>
        <button style={{...sty.btn, background:'#4caf50'}} onClick={checkIn} disabled={loading || status?.checked_in}>
          {loading ? '...' : '🟢 ลงเวลาเข้างาน'}
        </button>
        <button style={{...sty.btn, background:'#f44336'}} onClick={checkOut} disabled={loading || !status?.checked_in || status?.checked_out}>
          {loading ? '...' : '🔴 ลงเวลาออกงาน'}
        </button>
      </div>
      {msg && <div style={sty.msg}>{msg}</div>}
    </div>
  )
          }
