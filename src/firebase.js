import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: 'AIzaSyBlBsXhEvqRrOQQEMR8Pw6RYETcv_RMksE',
    authDomain: 'bloom-hr-35ce0.firebaseapp.com',
    projectId: 'bloom-hr-35ce0',
    storageBucket: 'bloom-hr-35ce0.firebasestorage.app',
    messagingSenderId: '666135299999',
    appId: '1:666135299999:web:831ce6c20e7db1ccb6dfaa',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app
