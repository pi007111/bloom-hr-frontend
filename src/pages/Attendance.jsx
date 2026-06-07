import { useState, useEffect } from 'react'
import { auth } from '../firebase'

const API = import.meta.env.VITE_API_URL

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
          method: 'gps',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        })
        if (res.detail) setMsg('❌ ' + res.detail)
        else { setMsg('✅ ลงเวลาเข้างานสำเร็จ เวลา ' + res.time); loadStatus() }
        setLoading(false)
      }, () => { setMsg('❌ ไม่สามารถรับ GPS ได้'); setLoading(false) })
    } catch (e) { setMsg('❌ ' + e.message); setLoading(false) }
  }

  const checkOut = async () => {
    setLoading(true); setMsg('')
    const res = await apiCall('/attendance/check-out', 'POST')
    if (res.detail) setMsg('❌ ' + res.detail)
    else { setMsg(`✅ ลงเวลาออกงานสำเร็จ เวลา ${res.time} (ทำงาน ${res.worked_hours.toFixed(1)} ชม.)`); loadStatus() }
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>⏰ ลงเวลาทำงาน</h2>

      <div style={styles.card}>
        <h3 style={styles.sub}>สถานะวันนี้</h3>
        {status ? (
          <div style={styles.info}>
            <p>สถานะ: <strong>{statusLabel(status.status)}</strong></p>
            <p>เข้างาน: <strong>{status.check_in_at || '-'}</strong></p>
            <p>ออกงาน: <strong>{status.check_out_at || '-'}</strong></p>
          </div>
        ) : <p style={styles.loading}>กำลังโหลด...</p>}
      </div>

      <div style={styles.btnRow}>
        <button style={{...styles.btn, background:'#4caf50'}}
          onClick={checkIn} disabled={loading || status?.checked_in}>
          {loading ? '...' : '🟢 ลงเวลาเข้างาน'}
        </button>
        <button style={{...styles.btn, background:'#f44336'}}
          onClick={checkOut} disabled={loading || !status?.checked_in || status?.checked_out}>
          {loading ? '...' : '🔴 ลงเวลาออกงาน'}
        </button>
      </div>

      {msg && <div style={styles.msg}>{msg}</div>}
    </div>
  )
}

function statusLabel(s) {
  return { present:'มาทำงาน', late:'มาสาย', absent:'ขาดงาน', not_checked_in:'ยังไม่ลงเวลา' }[s] || s
}

const styles = {
  page: { padding:'24px', maxWidth:'600px', margin:'0 auto' },
  heading: { color:'#333' },
  card: { background:'#fff', borderRadius:'12px', padding:'20px',
          boxShadow:'0 2px 12px rgba(0,0,0,0.08)', marginBottom:'20px' },
  sub: { color:'#e91e8c', margin:'0 0 12px' },
  info: { lineHeight:'1.8', color:'#444' },
  loading: { color:'#aaa' },
  btnRow: { display:'flex', gap:'16px', flexWrap:'wrap' },
  btn: { flex:1, padding:'14px', color:'#fff', border:'none', borderRadius:'10px',
         fontSize:'16px', cursor:'pointer', fontWeight:'bold', minWidth:'160px' },
  msg: { marginTop:'16px', padding:'14px', background:'#f5f5f5',
         borderRadius:'8px', fontSize:'15px' }
}
