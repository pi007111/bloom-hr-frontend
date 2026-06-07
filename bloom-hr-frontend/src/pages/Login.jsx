import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🌸</div>
        <h1 style={styles.title}>Bloom HR</h1>
        <p style={styles.subtitle}>ระบบบริหารพนักงาน</p>
        <form onSubmit={handleLogin} style={styles.form}>
          <input style={styles.input} type="email" placeholder="อีเมล"
            value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="รหัสผ่าน"
            value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center',
               minHeight:'100vh', background:'#fce4f0' },
  card: { background:'#fff', padding:'40px', borderRadius:'16px',
          boxShadow:'0 4px 24px rgba(233,30,140,0.15)', width:'340px', textAlign:'center' },
  logo: { fontSize:'48px', marginBottom:'8px' },
  title: { margin:'0', color:'#e91e8c', fontSize:'28px' },
  subtitle: { color:'#888', marginBottom:'24px' },
  form: { display:'flex', flexDirection:'column', gap:'12px' },
  input: { padding:'12px', borderRadius:'8px', border:'1px solid #ddd',
           fontSize:'16px', outline:'none' },
  btn: { padding:'12px', background:'#e91e8c', color:'#fff', border:'none',
         borderRadius:'8px', fontSize:'16px', cursor:'pointer', fontWeight:'bold' },
  error: { color:'#e53935', fontSize:'14px', margin:'0' }
}
