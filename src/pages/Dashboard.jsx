import { useState, useEffect } from 'react'
import { auth } from '../firebase'

const API = import.meta.env.VITE_API_URL

async function apiCall(path) {
  const token = await auth.currentUser?.getIdToken()
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

export default function Dashboard() {
  const [today, setToday] = useState(null)
  const [payroll, setPayroll] = useState(null)
  const user = auth.currentUser

  useEffect(() => {
    apiCall('/attendance/today').then(setToday)
    const now = new Date()
    apiCall(`/payroll/my?year=${now.getFullYear()}&month=${now.getMonth()+1}`).then(setPayroll)
  }, [])

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>สวัสดี {user?.email?.split('@')[0]} 👋</h2>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📅 สถานะวันนี้</h3>
          {today ? (
            <>
              <StatusBadge status={today.status} />
              <p>เข้างาน: {today.check_in_at || '-'}</p>
              <p>ออกงาน: {today.check_out_at || '-'}</p>
            </>
          ) : <p style={styles.loading}>กำลังโหลด...</p>}
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>💰 เงินเดือนเดือนนี้</h3>
          {payroll ? (
            <>
              <p style={styles.bigNum}>฿{payroll.net?.toLocaleString()}</p>
              <p style={styles.small}>เงินเดือนพื้นฐาน: ฿{payroll.base?.toLocaleString()}</p>
              {payroll.ot_pay > 0 && <p style={styles.small}>OT: ฿{payroll.ot_pay?.toLocaleString()}</p>}
              {payroll.diligence > 0 && <p style={styles.green}>เบี้ยขยัน: ฿{payroll.diligence?.toLocaleString()}</p>}
            </>
          ) : <p style={styles.loading}>กำลังโหลด...</p>}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    present: { label: 'มาทำงาน', color: '#4caf50' },
    late: { label: 'มาสาย', color: '#ff9800' },
    absent: { label: 'ขาดงาน', color: '#f44336' },
    not_checked_in: { label: 'ยังไม่ได้ลงเวลา', color: '#9e9e9e' },
  }
  const s = map[status] || map.not_checked_in
  return <span style={{...styles.badge, background: s.color}}>{s.label}</span>
}

const styles = {
  page: { padding:'24px', maxWidth:'900px', margin:'0 auto' },
  heading: { color:'#333', marginBottom:'24px' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px,1fr))', gap:'20px' },
  card: { background:'#fff', borderRadius:'12px', padding:'20px',
          boxShadow:'0 2px 12px rgba(0,0,0,0.08)' },
  cardTitle: { margin:'0 0 16px', color:'#e91e8c', fontSize:'16px' },
  bigNum: { fontSize:'32px', fontWeight:'bold', color:'#333', margin:'8px 0' },
  small: { color:'#666', margin:'4px 0', fontSize:'14px' },
  green: { color:'#4caf50', margin:'4px 0', fontSize:'14px' },
  badge: { display:'inline-block', padding:'4px 12px', borderRadius:'20px',
           color:'#fff', fontWeight:'bold', fontSize:'14px', marginBottom:'12px' },
  loading: { color:'#aaa' }
}
