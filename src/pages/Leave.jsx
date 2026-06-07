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

const LEAVE_TYPES = [
  { value: 'ลาป่วย', label: '🤒 ลาป่วย' },
  { value: 'ลากิจ', label: '📋 ลากิจ' },
  { value: 'ลาพักร้อน', label: '🌴 ลาพักร้อน' },
  { value: 'ลาคลอด', label: '👶 ลาคลอด' },
]

export default function Leave() {
  const [leaves, setLeaves] = useState([])
  const [form, setForm] = useState({ leave_type:'ลาป่วย', start_date:'', end_date:'', reason:'' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const loadLeaves = () => apiCall('/leave/my').then(setLeaves)
  useEffect(() => { loadLeaves() }, [])

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setMsg('')
    const res = await apiCall('/leave/request', 'POST', form)
    if (res.detail) setMsg('❌ ' + res.detail)
    else { setMsg(`✅ ส่งคำขอลาสำเร็จ (${res.total_days} วัน)`); loadLeaves() }
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>📋 ขอลาหยุด</h2>

      <div style={styles.card}>
        <h3 style={styles.sub}>ยื่นคำขอลา</h3>
        <form onSubmit={submit} style={styles.form}>
          <select style={styles.input} value={form.leave_type}
            onChange={e => setForm({...form, leave_type: e.target.value})}>
            {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>วันที่เริ่ม</label>
              <input style={styles.input} type="date" required
                value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>วันที่สิ้นสุด</label>
              <input style={styles.input} type="date" required
                value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
            </div>
          </div>
          <input style={styles.input} type="text" placeholder="เหตุผล (ไม่บังคับ)"
            value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'กำลังส่ง...' : 'ส่งคำขอลา'}
          </button>
        </form>
        {msg && <div style={styles.msg}>{msg}</div>}
      </div>

      <div style={styles.card}>
        <h3 style={styles.sub}>ประวัติการลา</h3>
        {leaves.length === 0 ? <p style={styles.empty}>ยังไม่มีประวัติการลา</p> : (
          <div style={styles.list}>
            {leaves.map(l => (
              <div key={l.id} style={styles.item}>
                <div>
                  <strong>{l.type}</strong>
                  <span style={styles.dateText}> {l.start_date} → {l.end_date} ({l.days} วัน)</span>
                </div>
                <span style={{...styles.badge, background: statusColor(l.status)}}>
                  {statusLabel(l.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function statusLabel(s) {
  return { pending:'รอพิจารณา', approved:'อนุมัติ', rejected:'ไม่อนุมัติ' }[s] || s
}
function statusColor(s) {
  return { pending:'#ff9800', approved:'#4caf50', rejected:'#f44336' }[s] || '#9e9e9e'
}

const styles = {
  page: { padding:'24px', maxWidth:'700px', margin:'0 auto' },
  heading: { color:'#333' },
  card: { background:'#fff', borderRadius:'12px', padding:'20px',
          boxShadow:'0 2px 12px rgba(0,0,0,0.08)', marginBottom:'20px' },
  sub: { color:'#e91e8c', margin:'0 0 16px' },
  form: { display:'flex', flexDirection:'column', gap:'12px' },
  row: { display:'flex', gap:'12px' },
  col: { flex:1, display:'flex', flexDirection:'column', gap:'4px' },
  label: { fontSize:'13px', color:'#666' },
  input: { padding:'10px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'15px' },
  btn: { padding:'12px', background:'#e91e8c', color:'#fff', border:'none',
         borderRadius:'8px', fontSize:'15px', cursor:'pointer', fontWeight:'bold' },
  msg: { marginTop:'12px', padding:'12px', background:'#f5f5f5', borderRadius:'8px' },
  list: { display:'flex', flexDirection:'column', gap:'10px' },
  item: { display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'12px', background:'#fafafa', borderRadius:'8px' },
  dateText: { color:'#666', fontSize:'13px' },
  badge: { padding:'3px 10px', borderRadius:'12px', color:'#fff', fontSize:'13px', fontWeight:'bold' },
  empty: { color:'#aaa', textAlign:'center', padding:'20px 0' }
}
