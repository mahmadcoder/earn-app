"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AccountsPage() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [hasDeposited, setHasDeposited] = useState(false);
  const [canStartTask, setCanStartTask] = useState(true);
  const [timer, setTimer] = useState(0);

  // Check if user has deposited
  useEffect(() => {
    const fetchPlanProgress = async () => {
      if (!user || !getToken()) return;
      try {
        const res = await fetch(`/api/plan/all-progress`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (
          res.ok &&
          data.success &&
          data.progresses &&
          data.progresses.length > 0
        ) {
          setHasDeposited(true);
          // Check if user can start a new task (after 12am)
          const lastRoundDate = data.progresses[0].lastRoundDate;
          if (lastRoundDate) {
            const lastRound = new Date(lastRoundDate);
            const now = new Date();
            // Next eligible time is next 12am after lastRound
            const next12am = new Date(lastRound);
            next12am.setHours(24, 0, 0, 0);
            if (now < next12am) {
              setCanStartTask(false);
              setTimer(next12am.getTime() - now.getTime());
            } else {
              setCanStartTask(true);
              setTimer(0);
            }
          } else {
            setCanStartTask(true);
            setTimer(0);
          }
        } else {
          setHasDeposited(false);
        }
      } catch {
        setHasDeposited(false);
      }
    };
    fetchPlanProgress();
  }, [user, getToken]);

  // Timer countdown
  useEffect(() => {
    if (!canStartTask && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 1000 ? prev - 1000 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [canStartTask, timer]);

  return (
    <section className="bg-gray-900 min-h-screen py-12 px-6">
      <div className="container mx-auto">
        {/* Page Heading */}
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Crypto Wallet Account
        </h1>
        <p className="text-center text-white max-w-3xl mx-auto mb-12">
          Securely manage your cryptocurrency with Binance. Fast, reliable, and
          global.
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
              Binance is the worlds leading cryptocurrency exchange, offering
              secure and fast crypto transactions.
            </p>

            {/* Start Task or Deposit Button */}
            {!hasDeposited ? (
              <button
                onClick={() => router.push("/deposit")}
                className="block w-full text-center bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-400 transition"
              >
                Deposit
              </button>
            ) : (
              <button
                onClick={() => canStartTask && router.push("/video_route")}
                className={`block w-full text-center px-4 py-2 rounded transition font-semibold ${
                  canStartTask
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
                disabled={!canStartTask}
              >
                {canStartTask
                  ? "Start Task"
                  : `Start Task after ${Math.floor(
                      timer / (1000 * 60 * 60)
                    )}h ${Math.floor((timer / (1000 * 60)) % 60)}m ${Math.floor(
                      (timer / 1000) % 60
                    )}s`}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
