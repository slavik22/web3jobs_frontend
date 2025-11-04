import { useState } from 'react'
import { Bitcoin, Wallet2 } from 'lucide-react'
import PasswordInput from '../components/PasswordInput'
import Toast from '../components/Toast'
import { Link, useNavigate } from 'react-router-dom'
import { apiBase } from '../config'
import { saveTokens, saveUser } from '../lib/auth'
import { signInWithWallet } from '../lib/siwe';
import GoogleButton from '../components/GoogleButton'


export default function RegisterPage({ onAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [wallet, setWallet] = useState('')
  const [agree, setAgree] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const navigate = useNavigate()

  const validAddress = wallet === '' || /^0x[a-fA-F0-9]{40}$/.test(wallet)

  async function onSubmit(e) {
    e.preventDefault()
    if (!agree) return setToast({ message: 'Підтвердь умови користування', type: 'error' })
    if (!validAddress) return setToast({ message: 'Невірна wallet-адреса (очікується 0x…40 hex)', type: 'error' })
    try {
      setSubmitting(true)
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, wallet_address: wallet }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Помилка реєстрації');
      saveTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
      saveUser(data.user);

      if (onAuth) onAuth(data.user);  // <- повідомляємо App


      setToast({ message: 'Реєстрація успішна!', type: 'success' })
      setTimeout(() => navigate('/'), 600)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  async function onWalletRegister() {
    try {
      setSubmitting(true)
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask не встановлено. Будь ласка, встановіть MetaMask або інший Web3 гаманець.')
      }

      setToast({ message: 'Підключення до гаманця...', type: 'success' })

      // Use the signInWithWallet helper - it handles both registration and login
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

      setToast({ message: 'Реєстрація через гаманець успішна!', type: 'success' })
      setTimeout(() => navigate('/'), 600)
    } catch (err) {
      console.error('Wallet registration error:', err)
      setToast({ 
        message: err.message || 'Помилка підключення гаманця', 
        type: 'error' 
      })
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <div className="mx-auto max-w-xl">
      <Toast {...toast} onClose={() => setToast({ message: '' })} />
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold">Створити акаунт</h2>
        <p className="text-gray-500">Приєднуйся до Web3 спільноти</p>
      </div>

      <form onSubmit={onSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email адреса</label>
          <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label className="label" htmlFor="password">Пароль</label>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Мінімум 6 символів" required />
        </div>

        <div>
          <label className="label" htmlFor="role">Роль</label>
          <select id="role" className="input" value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="user">Кандидат (шукаю роботу)</option>
            <option value="recruiter">Рекрутер (публікую вакансії)</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="wallet">
            <span className="inline-flex items-center gap-2"><Wallet2 className="h-4 w-4" /> Wallet адреса (опціонально)</span>
          </label>
          <input id="wallet" className="input" placeholder="0x..." value={wallet} onChange={(e) => setWallet(e.target.value)} />
          <p className={`mt-1 text-xs ${validAddress ? 'text-gray-500' : 'text-red-600'}`}>
            Для Web3 автентифікації та криптовалютних виплат
          </p>
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>Я погоджуюсь з умовами використання та політикою конфіденційності</span>
        </label>

        <button className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Завантаження…' : 'Зареєструватися'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Вже є акаунт? <Link to="/login" className="underline">Увійти</Link>
        </p>

        <div className="border-t pt-3 text-center">
          <p className="mb-2 text-sm text-gray-500">Або увійти через</p>
                    <GoogleButton
            desiredRole={role}
            onSuccess={(user) => {
              if (onAuth) onAuth(user);
              setTimeout(() => navigate('/'), 300);
            }}
            className="flex justify-center"
          />
          {/* <div className="grid grid-cols-2 gap-2"> */}
            {/* <button type="button" className="btn btn-outline w-full" onClick={onWalletRegister}><Wallet2 className="mr-2 h-4 w-4" /> MetaMask / інший гаманець </button> */}
            {/* <button type="button" disabled className="btn btn-outline w-full"><Bitcoin className="mr-2 h-4 w-4" /> WalletConnect (soon)</button> */}
          {/* </div> */}
        </div>
      </form>
    </div>
  )
}
