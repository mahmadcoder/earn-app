'use client';
// components/DepositPage.jsx
import { useState } from "react";
import { CheckCircle } from "lucide-react";

export default function DepositPage() {
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const walletAddresses = {
    BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ETH: "0x1234567890abcdef1234567890abcdef12345678",
    USDT: "TLrWfYJzM6YxNkDzt9LxkJzF6s93d5cX3x",
  };

  const handleDeposit = () => {
    if (amount && selectedCoin) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Deposit Crypto</h2>

        <label className="block mb-2 font-semibold">Select Coin</label>
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="w-full p-3 rounded bg-gray-700 mb-4"
        >
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="ETH">Ethereum (ETH)</option>
          <option value="USDT">Tether (USDT)</option>
        </select>

        <label className="block mb-2 font-semibold">Deposit Amount</label>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 rounded bg-gray-700 mb-4"
        />

        <label className="block mb-2 font-semibold">Wallet Address</label>
        <div className="bg-gray-700 p-3 rounded mb-4 break-words text-sm">
          {walletAddresses[selectedCoin]}
        </div>

        <div className="text-center mb-4">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${walletAddresses[selectedCoin]}&size=150x150`}
            alt="QR Code"
            className="mx-auto rounded"
          />
        </div>

        <button
          onClick={handleDeposit}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold"
        >
          Confirm Deposit
        </button>

        {showSuccess && (
          <div className="mt-4 flex items-center text-green-400 font-semibold">
            <CheckCircle className="mr-2" />
            Deposit request submitted successfully!
          </div>
        )}
      </div>
    </div>
  );
}
