import { useState } from 'react'
import { LogIn } from 'lucide-react'
import PasswordInput from '../components/PasswordInput'
import Toast from '../components/Toast'
import { Link, useNavigate } from 'react-router-dom'
import { apiBase } from '../config'
import { saveTokens, saveUser } from '../lib/auth'
import { Wallet2 } from 'lucide-react';
import GoogleButton from '../components/GoogleButton'
import { SiweMessage } from 'siwe'
import { ethers } from 'ethers'

export default function LoginPage({ onAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const navigate = useNavigate()

  
  async function loginWithWallet() {
    try {
      if (!window.ethereum) {
        setToast({ message: 'Не знайдено крипто-гаманець (MetaMask, Rabby тощо)', type: 'error' });
        return;
      }

      setSubmitting(true);

      // 1. Попросити доступ до акаунта
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = ethers.getAddress(accounts[0]);  // <- робить EIP-55 checksum

      // 2. Отримати nonce з бекенду (з сесією!)
      const nonceRes = await fetch(`${apiBase}/auth/siwe/nonce`, {
        method: 'GET',
        credentials: 'include', // обовʼязково для Flask session
      });
      const nonceData = await nonceRes.json();
      if (!nonceRes.ok || !nonceData.ok) {
        throw new Error(nonceData.message || 'Не вдалося отримати nonce');
      }
      const nonce = nonceData.nonce;

      // 3. Зібрати SIWE message
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const domain = window.location.hostname;
      const origin = window.location.origin;

      const siweMessage = new SiweMessage({
        domain,
        address,
        statement: 'Sign in to web3jobs with your wallet',
        uri: origin,
        version: '1',
        chainId,
        nonce,
      });

      const messageToSign = siweMessage.prepareMessage();

      // 4. Підписати повідомлення
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(messageToSign);

      // 5. Відправити на бекенд для верифікації + отримати JWT
      const verifyRes = await fetch(`${apiBase}/auth/siwe/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // на всяк випадок, щоб сесія збіглася
        body: JSON.stringify({
          message: messageToSign,
          signature,
          role: 'user', // або 'recruiter', якщо це форма для рекрутера
        }),
      });

      const data = await verifyRes.json();
      if (!verifyRes.ok || !data.ok) {
        throw new Error(data.message || 'Не вдалося увійти через гаманець');
      }

      // 6. Зберегти JWT і користувача — так само, як при звичайному логіні
      saveTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
      saveUser(data.user);

      if (onAuth) onAuth(data.user);

      setToast({ message: 'Увійдено через гаманець!', type: 'success' });
      setTimeout(() => navigate('/'), 600);
    } catch (err) {
      console.error(err);
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }


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
        
        /* <button type="button" className="btn btn-outline w-full">
  <Wallet2 className="mr-2 h-4 w-4" /> Увійти через MetaMask / гаманець
</button> */}

<button
          type="button"
          className="btn btn-outline w-full mt-2"
          onClick={loginWithWallet}
          disabled={submitting}
        >
          <Wallet2 className="mr-2 h-4 w-4" /> Увійти через MetaMask / гаманець
        </button>

        <p className="text-center text-sm text-gray-500">
          Немає акаунту? <Link to="/register" className="underline">Зареєструватися</Link>
        </p>
      </form>
    </div>
  )
}
