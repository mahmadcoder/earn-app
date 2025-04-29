'use client';
import { useState } from 'react';

export default function DepositButton() {
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cryptomus/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 10,  // USD main
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);

      if (data && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Payment URL not returned');
      }
    } catch (error) {
      console.error('Error creating payment:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDeposit}
      disabled={loading}
      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
    >
      {loading ? 'Processing...' : 'Deposit with Cryptomus'}
    </button>
  );
}
