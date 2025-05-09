'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

// Add this global declaration
declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletContext = createContext({
  account: undefined as string | undefined,
  error: undefined as string | undefined,
  connect: () => {},
})

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isEthereumExists = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
  }

  const checkWalletConnect = async () => {
    if (isEthereumExists()) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        })
        if (accounts.length > 0) {
          setAccount(accounts[0])
        }
      } catch (err: any) {
        setError(err.message)
      }
    }
  }

  const connect = async () => {
    setError('')
    if (isEthereumExists()) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        setAccount(accounts[0])
      } catch (err: any) {
        setError(err.message)
      }
    } else {
      setError('Please install MetaMask.')
    }
  }

  useEffect(() => {
    checkWalletConnect()
  }, [])

  return (
    <WalletContext.Provider value={{ account: account ?? undefined, connect, error: error ?? undefined }}>
      {children}
    </WalletContext.Provider>
  )
}

const useWallet = () => useContext(WalletContext)

export default useWallet