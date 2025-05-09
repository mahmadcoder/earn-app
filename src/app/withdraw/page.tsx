'use client';
import { useState } from 'react';

export default function WithdrawPage() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('BTC');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleWithdraw = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, amount, asset }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Withdraw failed');
      setMessage(data.message || 'Withdrawal successful!');
      setAddress('');
      setAmount('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-6">Withdraw Funds</h1>

      <div className="bg-gray-800 p-6 rounded w-full max-w-md">
        <label className="block mb-2 text-sm font-medium">Asset</label>
        <select
          value={asset}
          onChange={e => setAsset(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
        >
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
        </select>

        <label className="block mb-2 text-sm font-medium">Recipient Address</label>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          placeholder="Enter wallet address"
        />

        <label className="block mb-2 text-sm font-medium">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          placeholder="Enter amount"
        />

        <button
          onClick={handleWithdraw}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Withdraw'}
        </button>

        {message && <p className="text-green-400 mt-4">{message}</p>}
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
}
