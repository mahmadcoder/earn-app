"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { getToken } from "@/lib/auth";

export default function WithdrawConfirmWrapper() {
  return (
    <ProtectedRoute>
      <WithdrawConfirmPage />
    </ProtectedRoute>
  );
}

function WithdrawalPopup({
  open,
  onClose,
  status,
  amount,
  currency,
  date,
  address,
}) {
  if (!open) return null;
  const isConfirmed = status === "confirm";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>
        <div className="flex flex-col items-center mb-4">
          {isConfirmed ? (
            <CheckCircle className="w-16 h-16 text-green-400 mb-2" />
          ) : (
            <XCircle className="w-16 h-16 text-red-400 mb-2" />
          )}
          <h2
            className={`text-2xl font-bold mb-2 ${
              isConfirmed ? "text-green-400" : "text-red-400"
            }`}
          >
            Withdrawal {isConfirmed ? "Confirm" : "Reject"}
          </h2>
        </div>
        <div className="text-lg mb-2">
          <span className="font-semibold">Amount:</span> {amount} {currency}
        </div>
        <div className="text-gray-400 mb-2">
          <span className="font-semibold">Date:</span> {date}
        </div>
        {address && (
          <div className="text-gray-400 mb-2">
            <span className="font-semibold">To:</span> {address}
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function WithdrawConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, getToken: getTokenFromContext } = useAuth();
  
  // Get withdrawal details from URL params
  const amount = searchParams.get("amount") || "";
  const currency = searchParams.get("currency") || "USDT";
  const recipientAddress = searchParams.get("address") || "";
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupStatus, setPopupStatus] = useState("");
  const [popupDate, setPopupDate] = useState("");

  // Validate that we have all required parameters
  useEffect(() => {
    if (!amount || !currency || !recipientAddress) {
      setError("Missing withdrawal information. Please go back and try again.");
    }
  }, [amount, currency, recipientAddress]);

  // Show popup if latest withdrawal is confirm or rejected
  useEffect(() => {
    const fetchLatestWithdrawal = async () => {
      if (!user?.id) return;
      try {
        const token = getTokenFromContext ? getTokenFromContext() : getToken();
        const res = await fetch(`/api/withdrawals/history?userId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.withdrawals && data.withdrawals.length > 0) {
          const latest = data.withdrawals[0];
          if (latest.status === "confirm" || latest.status === "rejected") {
            setPopupStatus(latest.status);
            setPopupDate(
              new Date(latest.updatedAt || latest.createdAt).toLocaleString()
            );
            setPopupOpen(true);
            // Optionally update amount, currency, address if you want to show the latest
            // setAmount(latest.amount);
            // setCurrency(latest.currency);
            // setRecipientAddress(latest.recipientAddress);
          }
        }
      } catch {
        // ignore
      }
    };
    fetchLatestWithdrawal();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmWithdrawal = async () => {
    if (!user?.id) {
      setError("You must be logged in to confirm a withdrawal");
      setPopupStatus("rejected");
      setPopupDate(new Date().toLocaleString());
      setPopupOpen(true);
      return;
    }
    
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = getToken();
      const res = await fetch("/api/withdrawals/submit", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientAddress,
          amount,
          currency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPopupStatus("rejected");
        setPopupDate(new Date().toLocaleString());
        setPopupOpen(true);
        throw new Error(data.message || "Withdrawal request failed");
      }

      setTimeout(() => {
        setMessage(
          data.message || "Withdrawal request submitted successfully!"
        );
        setPopupStatus("confirm");
        setPopupDate(new Date().toLocaleString());
        setPopupOpen(true);
      }, 500);
    } catch (err: unknown) {
      let errorMsg = "An unknown error occurred";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as Record<string, unknown>).message === "string"
      ) {
        errorMsg = (err as { message: string }).message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWithdraw = () => {
    router.push("/withdraw");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <WithdrawalPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        status={popupStatus}
        amount={amount}
        currency={currency}
        date={popupDate}
        address={recipientAddress}
      />
      <div className="max-w-md mx-auto">
        <button 
          onClick={handleBackToWithdraw}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Withdraw
        </button>
        
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
          {error ? (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <div className="flex items-center text-red-400">
                <AlertCircle className="mr-2" />
                {error}
              </div>
              <button
                onClick={handleBackToWithdraw}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
              >
                Return to withdraw page
              </button>
            </div>
          ) : message ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/30 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">
                  Withdrawal Submitted!
                </h1>
                <p className="text-gray-400">
                  Your withdrawal request has been received
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Amount</p>
                  <p className="text-xl font-bold">
                    {amount} {currency}
                  </p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Recipient Address</p>
                  <p className="text-sm font-medium break-all">
                    {recipientAddress}
                  </p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">
                    Estimated Processing Time
                  </p>
                  <p className="text-md font-medium">24 hours</p>
                </div>
              </div>

              <div className="text-sm text-yellow-400 mb-6 p-4 bg-yellow-900/30 border border-yellow-800 rounded-lg">
                <p className="mb-2 font-medium">⚠️ Important Information</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  <li>Your withdrawal is being processed</li>
                  <li>You will receive a notification once confirmed</li>
                  <li>Please allow up to 24 hours for processing</li>
                  <li>Check withdrawal history for status updates</li>
                </ul>
              </div>

              <button
                onClick={handleBackToWithdraw}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-medium"
              >
                Return to Withdraw Page
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">
                Confirm Withdrawal
              </h1>
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-4">Withdrawal Details</h2>
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Amount</p>
                    <p className="text-xl font-bold">
                      {amount} {currency}
                    </p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Recipient Address</p>
                    <p className="text-sm font-medium break-all">
                      {recipientAddress}
                    </p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">
                      Estimated Processing Time
                    </p>
                    <p className="text-md font-medium">24 hours</p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-yellow-400 mb-6 p-4 bg-yellow-900/30 border border-yellow-800 rounded-lg">
                <p className="mb-2 font-medium">⚠️ Important</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  <li>Please verify that the recipient address is correct</li>
                  <li>Withdrawals cannot be reversed once processed</li>
                  <li>
                    Network fees will be deducted from the withdrawal amount
                  </li>
                </ul>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleBackToWithdraw}
                  className="flex-1 border border-gray-600 text-gray-300 hover:bg-gray-700 py-3 rounded font-medium"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleConfirmWithdrawal}
                  disabled={loading}
                  className={`flex-1 ${
                    loading ? "bg-blue-800" : "bg-blue-600 hover:bg-blue-700"
                  } text-white py-3 rounded font-medium flex items-center justify-center`}
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
