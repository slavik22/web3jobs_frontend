import { useState } from 'react'
import { LogIn } from 'lucide-react'
import PasswordInput from '../components/PasswordInput'
import Toast from '../components/Toast'
import { Link, useNavigate } from 'react-router-dom'
import { apiBase } from '../config'
import { saveTokens, saveUser } from '../lib/auth'
import { signInWithWallet } from '../lib/siwe';
import { Wallet2 } from 'lucide-react';
import GoogleButton from '../components/GoogleButton'

export default function LoginPage({ onAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const navigate = useNavigate()


  async function onSubmit(e) {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Невірний email або пароль');

      saveTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
      saveUser(data.user);

      if (onAuth) onAuth(data.user);  // <- повідомляємо App

      setToast({ message: 'Ласкаво просимо!', type: 'success' })
      setTimeout(() => navigate('/'), 600)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

    async function onWalletLogin() {
    try {
      setSubmitting(true)
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask не встановлено. Будь ласка, встановіть MetaMask або інший Web3 гаманець.')
      }

      setToast({ message: 'Підключення до гаманця...', type: 'success' })

      // Use the signInWithWallet helper from siwe library
      const result = await signInWithWallet()

      if (!result.ok) {
        throw new Error(result.message || 'Помилка автентифікації через гаманець')
      }

      // Save tokens and user data
      saveTokens({ 
        access_token: result.access_token, 
        refresh_token: result.refresh_token 
      })
      saveUser(result.user)

      if (onAuth) onAuth(result.user)

      setToast({ message: 'Успішний вхід через гаманець!', type: 'success' })
      setTimeout(() => navigate('/'), 600)
    } catch (err) {
      console.error('Wallet login error:', err)
      setToast({ 
        message: err.message || 'Помилка підключення гаманця', 
        type: 'error' 
      })
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <div className="mx-auto max-w-lg">
      <Toast {...toast} onClose={() => setToast({ message: '' })} />
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold">Вхід в систему</h2>
        <p className="text-gray-500">Раді бачити тебе знову!</p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div>
          <label className="label" htmlFor="email">Email адреса</label>
          <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="password">Пароль</label>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>Запам'ятати мене</span>
        </label>

        <button className="btn btn-primary w-full" disabled={submitting}>
          <LogIn className="mr-2 h-4 w-4" /> {submitting ? 'Завантаження…' : 'Увійти'}
        </button>

        {
                <GoogleButton
          desiredRole="user"
          onSuccess={(user) => {
            if (onAuth) onAuth(user);
            setTimeout(() => navigate('/'), 300);
          }}
        />
        /* <button type="button" disa className="btn btn-outline w-full" onClick={onWalletLogin}>
  <Wallet2 className="mr-2 h-4 w-4" /> Увійти через MetaMask / гаманець
</button> */}

        <p className="text-center text-sm text-gray-500">
          Немає акаунту? <Link to="/register" className="underline">Зареєструватися</Link>
        </p>
      </form>
    </div>
  )
}
