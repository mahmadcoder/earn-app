'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- Router import

export default function AccountsPage() {
  const [showDepositInfo, setShowDepositInfo] = useState(false);
  const router = useRouter(); // <-- Router object

  const handleDepositClick = () => {
    if (!showDepositInfo) {
      setShowDepositInfo(true); // Pehli click - Info show
    } else {
      router.push('/deposit'); // Doosri click - Redirect to /deposit
    }
  };

  return (
    <section className="bg-gray-900 min-h-screen py-12 px-6">
      <div className="container mx-auto">
        {/* Page Heading */}
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Crypto Wallet Account
        </h1>
        <p className="text-center text-white max-w-3xl mx-auto mb-12">
          Securely manage your cryptocurrency with Binance. Fast, reliable, and global.
        </p>

        {/* Binance Container */}
        <div className="flex justify-center">
          <div className="bg-white shadow-md rounded-lg p-6 max-w-sm w-full transition hover:shadow-lg">
            <div className="flex justify-center mb-4">
              <Image
                src="/P7.jpg"
                alt="Binance"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            <h2 className="text-2xl font-semibold text-center text-yellow-500 mb-2">
              Binance
            </h2>
            <p className="text-gray-600 text-center text-sm sm:text-base mb-4">
              Binance is the world’s leading cryptocurrency exchange, offering secure and fast crypto transactions.
            </p>

            {/* Deposit Button */}
            <button
              onClick={handleDepositClick}
              className="block w-full text-center bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-400 transition"
            >
              {showDepositInfo ? 'Proceed to Deposit' : 'Deposit'}
            </button>

            {/* Deposit Information */}
            {showDepositInfo && (
              <div className="mt-6 bg-gray-100 p-4 rounded text-center">
                <p className="text-gray-700 text-sm mb-2">
                  <strong>Network:</strong> TRC20
                </p>
                
                <p className="text-red-500 text-xs mt-2">
                  ⚠️ Send only USDT via TRC20 network. Wrong network = funds lost!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
