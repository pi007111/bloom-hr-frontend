import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

export default function Navbar() {
  const navigate = useNavigate()
  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>🌸 Bloom HR</div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>หน้าหลัก</Link>
        <Link to="/attendance" style={styles.link}>ลงเวลา</Link>
        <Link to="/leave" style={styles.link}>ลาหยุด</Link>
        <button onClick={handleLogout} style={styles.btn}>ออกจากระบบ</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: { display:'flex', justifyContent:'space-between', alignItems:'center',
         padding:'12px 24px', background:'#e91e8c', color:'#fff' },
  logo: { fontSize:'20px', fontWeight:'bold' },
  links: { display:'flex', gap:'16px', alignItems:'center' },
  link: { color:'#fff', textDecoration:'none', fontWeight:'500' },
  btn: { background:'rgba(255,255,255,0.2)', color:'#fff', border:'1px solid rgba(255,255,255,0.5)',
         padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }
}
