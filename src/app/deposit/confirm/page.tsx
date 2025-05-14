'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function ConfirmDepositPage() {
  return (
    <ProtectedRoute>
      <ConfirmDeposit />
    </ProtectedRoute>
  );
}

function ConfirmDeposit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [transactionHash, setTransactionHash] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Get deposit details from URL params
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  
  // Handle file selection for payment proof
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }
    
    setPaymentProof(file);
    setError('');
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionHash) {
      setError('Please enter the transaction hash');
      return;
    }
    
    if (!paymentProof) {
      setError('Please upload a screenshot of your payment');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('transactionHash', transactionHash);
      formData.append('paymentProof', paymentProof);
      formData.append('amount', amount || '0');
      formData.append('currency', currency || 'USDT');
      formData.append('userId', user?.id.toString() || '');
      
      // Send to API
      const response = await fetch('/api/deposits/confirm', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to confirm deposit');
      }
      
      setSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/deposit?success=true');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Confirm Your Deposit</h2>
        
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Amount:</span>
            <span className="font-semibold">{amount} {currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Status:</span>
            <span className="text-yellow-400">Pending Confirmation</span>
          </div>
        </div>
        
        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Transaction Hash</label>
              <input
                type="text"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="Enter transaction hash/ID"
                className="w-full p-3 rounded bg-gray-700 text-white"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                The transaction hash/ID from your wallet or exchange
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 font-semibold">
                Payment Screenshot
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                {previewUrl ? (
                  <div className="mb-2">
                    <img
                      src={previewUrl}
                      alt="Payment proof"
                      className="max-h-40 mx-auto rounded"
                    />
                  </div>
                ) : (
                  <Upload className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                )}
                
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="payment-proof"
                  accept="image/*"
                />
                <label
                  htmlFor="payment-proof"
                  className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded inline-block"
                >
                  {previewUrl ? 'Change Image' : 'Upload Screenshot'}
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  Upload a screenshot of your transaction (Max: 5MB)
                </p>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded font-semibold flex items-center justify-center ${
                loading
                  ? 'bg-blue-800 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Processing...
                </>
              ) : (
                'Confirm Deposit'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Deposit Submitted!</h3>
            <p className="text-gray-300 mb-4">
              Your deposit has been submitted for verification. We will inform you manually as soon as possible.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to deposit history...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
