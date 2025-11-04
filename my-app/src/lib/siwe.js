import { apiBase } from '../config'

/**
 * Sign-In with Ethereum (SIWE) helper functions
 */

export async function signInWithWallet() {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error('MetaMask не встановлено')
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })

    if (!accounts || accounts.length === 0) {
      throw new Error('Не вдалося отримати доступ до гаманця')
    }

    const address = accounts[0]

    // Get current chain ID
    const chainId = await window.ethereum.request({
      method: 'eth_chainId'
    })
    const chainIdDecimal = parseInt(chainId, 16)

    // Get nonce from backend
    const nonceRes = await fetch(`${apiBase}/auth/wallet/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: address.toLowerCase() })
    })

    const nonceData = await nonceRes.json()
    
    if (!nonceRes.ok || !nonceData.ok) {
      throw new Error(nonceData.message || 'Помилка отримання nonce')
    }

    const { nonce } = nonceData

    // Create SIWE message following EIP-4361 standard
    const domain = window.location.hostname
    const origin = window.location.origin
    const statement = 'Увійдіть через свій Ethereum гаманець на Web3Jobs платформі'
    const issuedAt = new Date().toISOString()

    // Format message according to EIP-4361
    const message = [
      `${domain} wants you to sign in with your Ethereum account:`,
      address,
      '',
      statement,
      '',
      `URI: ${origin}`,
      `Version: 1`,
      `Chain ID: ${chainIdDecimal}`,
      `Nonce: ${nonce}`,
      `Issued At: ${issuedAt}`
    ].join('\n')

    console.log('SIWE Message:', message)

    // Request signature from MetaMask
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address]
    })

    // Verify signature on backend
    const verifyRes = await fetch(`${apiBase}/auth/wallet/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, signature })
    })

    const verifyData = await verifyRes.json()

    if (!verifyRes.ok || !verifyData.ok) {
      throw new Error(verifyData.message || 'Помилка верифікації підпису')
    }

    return verifyData

  } catch (error) {
    console.error('SIWE Error:', error)
    
    // Handle specific MetaMask errors
    if (error.code === 4001) {
      throw new Error('Ви відхилили запит на підпис')
    }
    
    if (error.code === -32002) {
      throw new Error('Запит вже очікує підтвердження в MetaMask')
    }

    throw error
  }
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled() {
  return typeof window.ethereum !== 'undefined'
}

/**
 * Get current connected wallet address
 */
export async function getCurrentWalletAddress() {
  if (!window.ethereum) return null
  
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    })
    return accounts[0]?.toLowerCase() || null
  } catch (error) {
    console.error('Error getting wallet address:', error)
    return null
  }
}

/**
 * Switch to a specific network
 */
export async function switchNetwork(chainId) {
  if (!window.ethereum) {
    throw new Error('MetaMask не встановлено')
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }]
    })
  } catch (error) {
    // Handle network not added to MetaMask
    if (error.code === 4902) {
      throw new Error('Мережа не додана до MetaMask')
    }
    throw error
  }
}

/**
 * Listen for account changes
 */
export function onAccountsChanged(callback) {
  if (!window.ethereum) return

  window.ethereum.on('accountsChanged', (accounts) => {
    callback(accounts[0]?.toLowerCase() || null)
  })
}

/**
 * Listen for chain changes
 */
export function onChainChanged(callback) {
  if (!window.ethereum) return

  window.ethereum.on('chainChanged', (chainId) => {
    callback(parseInt(chainId, 16))
  })
}