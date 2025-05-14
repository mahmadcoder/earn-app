'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function WithdrawConfirmWrapper() {
  return (
    <ProtectedRoute>
      <WithdrawConfirmPage />
    </ProtectedRoute>
  );
}

function WithdrawConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Get withdrawal details from URL params
  const amount = searchParams.get('amount') || '';
  const currency = searchParams.get('currency') || 'USDT';
  const recipientAddress = searchParams.get('address') || '';
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Validate that we have all required parameters
  useEffect(() => {
    if (!amount || !currency || !recipientAddress) {
      setError('Missing withdrawal information. Please go back and try again.');
    }
  }, [amount, currency, recipientAddress]);

  const handleConfirmWithdrawal = async () => {
    if (!user?.id) {
      setError('You must be logged in to confirm a withdrawal');
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/withdrawals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientAddress,
          amount,
          currency
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Withdrawal request failed');
      
      setMessage(data.message || 'Withdrawal request submitted successfully!');
      
      // Clear form after successful submission
      setTimeout(() => {
        router.push('/withdraw?success=true');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <button 
          onClick={handleCancel}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Withdraw
        </button>
        
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Confirm Withdrawal</h1>
          
          {error ? (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <div className="flex items-center text-red-400">
                <AlertCircle className="mr-2" />
                {error}
              </div>
              <button
                onClick={handleCancel}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
              >
                Return to withdraw page
              </button>
            </div>
          ) : message ? (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg">
              <div className="flex items-center text-green-400">
                <CheckCircle className="mr-2" />
                {message}
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Redirecting you to the withdraw page...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-4">Withdrawal Details</h2>
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Amount</p>
                    <p className="text-xl font-bold">{amount} {currency}</p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Recipient Address</p>
                    <p className="text-sm font-medium break-all">{recipientAddress}</p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Estimated Processing Time</p>
                    <p className="text-md font-medium">24 hours</p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-yellow-400 mb-6 p-4 bg-yellow-900/30 border border-yellow-800 rounded-lg">
                <p className="mb-2 font-medium">⚠️ Important</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  <li>Please verify that the recipient address is correct</li>
                  <li>Withdrawals cannot be reversed once processed</li>
                  <li>Network fees will be deducted from the withdrawal amount</li>
                </ul>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 border border-gray-600 text-gray-300 hover:bg-gray-700 py-3 rounded font-medium"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleConfirmWithdrawal}
                  disabled={loading}
                  className={`flex-1 ${loading ? "bg-blue-800" : "bg-blue-600 hover:bg-blue-700"} text-white py-3 rounded font-medium flex items-center justify-center`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Processing...
                    </>
                  ) : (
                    <>Confirm Withdrawal</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
