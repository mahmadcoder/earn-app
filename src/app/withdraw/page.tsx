'use client';
import { useState } from 'react';

export default function WithdrawButton() {
  const [loading, setLoading] = useState(false);
  const [binanceAddress, setBinanceAddress] = useState("");

  const handleWithdraw = async () => {
    if (!binanceAddress) {
      alert("Please enter your Binance address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cryptomus/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 10, // The amount user is withdrawing (USD)
          userBinanceAddress: binanceAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      alert("Withdrawal successful!");
    } catch (error) {
      console.error('Error during withdrawal:', error.message);
      alert("Error during withdrawal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Binance Address"
        value={binanceAddress}
        onChange={(e) => setBinanceAddress(e.target.value)}
        className="border p-2 rounded mb-4 w-full"
      />
      <button
        onClick={handleWithdraw}
        disabled={loading}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? 'Processing...' : 'Withdraw to Binance'}
      </button>
    </div>
  );
}
