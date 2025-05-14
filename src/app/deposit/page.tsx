'use client';
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Clock, AlertCircle, ArrowRight, History, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function DepositPageWrapper() {
  return (
    <ProtectedRoute>
      <DepositPage />
    </ProtectedRoute>
  );
}

function DepositPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [depositHistory, setDepositHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("deposit"); // deposit or history
  
  // Check for success message from URL params
  const showSuccess = searchParams.get("success") === "true";
  
  const walletAddresses = {
    BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ETH: "0x1234567890abcdef1234567890abcdef12345678",
    USDT: "TJuZCvYANND2emRa4ssrWqpZswPFUaJVWQ", // Using the address from staking page
  };

  // Fetch deposit history
  useEffect(() => {
    if (user?.id) {
      fetchDepositHistory();
    }
  }, [user]);
  
  const fetchDepositHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/deposits/history?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setDepositHistory(data.deposits || []);
      }
    } catch (error) {
      console.error("Failed to fetch deposit history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    setLoading(true);
    
    // Redirect to confirmation page with deposit details
    router.push(`/deposit/confirm?amount=${amount}&currency=${selectedCoin}`);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  // Get status badge based on deposit status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="flex items-center text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center text-yellow-400 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center text-gray-400 text-sm">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Deposit</h1>
        
        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("deposit")}
            className={`py-3 px-6 font-medium ${activeTab === "deposit" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
          >
            Make Deposit
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-6 font-medium ${activeTab === "history" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
          >
            <span className="flex items-center">
              <History className="w-4 h-4 mr-2" />
              Deposit History
            </span>
          </button>
        </div>
        
        {activeTab === "deposit" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Deposit Details</h2>
              
              <label className="block mb-2 font-medium text-sm">Select Coin</label>
              <select
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT)</option>
              </select>

              <label className="block mb-2 font-medium text-sm">Deposit Amount</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {showSuccess && (
                <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-lg">
                  <div className="flex items-center text-green-400 font-medium">
                    <CheckCircle className="mr-2" />
                    Your deposit has been submitted for verification!
                  </div>
                </div>
              )}
              
              <button
                onClick={handleDeposit}
                disabled={loading}
                className={`w-full ${loading ? "bg-blue-800" : "bg-blue-600 hover:bg-blue-700"} text-white py-3 rounded font-semibold flex items-center justify-center`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Confirmation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
              
              <label className="block mb-2 font-medium text-sm">Deposit Address ({selectedCoin})</label>
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
              
              <div className="text-sm text-gray-400">
                <p className="mb-2">⚠️ Important:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Only send {selectedCoin} to this address</li>
                  <li>Minimum deposit: 10 {selectedCoin}</li>
                  <li>After sending, click "Continue to Confirmation"</li>
                  <li>You'll need to provide transaction hash and screenshot</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Your Deposit History</h2>
            
            {historyLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
              </div>
            ) : depositHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Currency</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depositHistory.map((deposit) => (
                      <tr key={deposit.id} className="border-b border-gray-700">
                        <td className="py-4">{formatDate(deposit.createdAt)}</td>
                        <td className="py-4">{deposit.amount}</td>
                        <td className="py-4">{deposit.currency}</td>
                        <td className="py-4">{getStatusBadge(deposit.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No deposit history found</p>
                <button
                  onClick={() => setActiveTab("deposit")}
                  className="mt-4 text-blue-400 hover:text-blue-300"
                >
                  Make your first deposit
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
