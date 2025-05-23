"use client";
import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import ProtectedRoute from "../components/ProtectedRoute";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

export type UserPlanProgress = {
  planAmount: number;
  profit: number;
  roundCount: number;
  canWithdraw: boolean;
  lastRoundDate?: string;
};

const Videos = () => {
  const router = useRouter();
  const { user, getToken } = useAuth();

  const videoUrls = [
    // "https://www.youtube.com/watch?v=LXb3EKWsInQ",
    "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    // "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    // "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
  ];

  const [currentVideo, setCurrentVideo] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [progress, setProgress] = useState<UserPlanProgress | null>(null);
  const [currentPlan, setCurrentPlan] = useState<UserPlanProgress | null>(null);
  const [lastProfit, setLastProfit] = useState<number>(0);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Fetch user's active plan on component mount
  useEffect(() => {
    const fetchActivePlan = async () => {
      try {
        const response = await fetch("/api/plan/all-progress", {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        if (data.success && data.progresses && data.progresses.length > 0) {
          // Get the first active plan (most recent)
          const activePlan = data.progresses[0];
          setCurrentPlan(activePlan);
          console.log("Active plan loaded:", activePlan);
        } else {
          toast.error("No active plan found. Please make a deposit first.");
          router.push("/staking");
        }
      } catch (error) {
        console.error("Error fetching active plan:", error);
        toast.error("Failed to load your plan. Please try again.");
      }
    };

    if (user && getToken()) {
      fetchActivePlan();
    }
  }, [user, getToken, router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!currentPlan || !currentPlan.lastRoundDate) {
      setTimeLeft(0);
      return;
    }
    const lastRound = new Date(currentPlan.lastRoundDate);
    const nextTime = new Date(lastRound.getTime() + 24 * 60 * 60 * 1000);
    const update = () => {
      const now = new Date();
      const diff = nextTime.getTime() - now.getTime();
      setTimeLeft(diff > 0 ? diff : 0);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [currentPlan]);

  // Update the completeRound function in video_route.tsx
  const completeRound = async () => {
    if (!currentPlan) {
      toast.error("No active plan found");
      return;
    }
    try {
      setLastProfit(currentPlan.profit);
      console.log(
        "[COMPLETE ROUND] Sending request for planAmount:",
        currentPlan.planAmount
      );
      const response = await fetch("/api/plan/complete-round", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          planAmount: currentPlan.planAmount,
        }),
      });
      const data = await response.json();
      console.log("[COMPLETE ROUND] Response status:", response.status);
      console.log("[COMPLETE ROUND] Response data:", data);
      if (!response.ok) {
        throw new Error(data.error || "Failed to complete round");
      }
      setProgress(data.progress);
      setCurrentPlan(data.progress);
      setRoundCompleted(true);
      toast.success(`Earned $${data.profitEarned} from watching videos!`);
      // Dispatch event with the new total profit
      window.dispatchEvent(
        new CustomEvent("profitUpdated", {
          detail: { totalProfit: data.totalProfit },
        })
      );
      // Force refetch of all-progress to update Navbar and Withdraw
      await fetch("/api/plan/all-progress", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
      setShowMessage(true);
    } catch (error: unknown) {
      console.error("[COMPLETE ROUND] Error:", error);
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message
          : "Failed to complete round";
      toast.error(errorMessage || "Failed to complete round");
      setShowMessage(true);
    }
  };

  const nextVideo = async () => {
    if (!isVideoEnded) return;

    // If this is the last video, complete the round
    if (currentVideo >= videoUrls.length - 1) {
      await completeRound();
      return;
    }

    // Otherwise, go to next video
    setCurrentVideo(currentVideo + 1);
    setIsVideoEnded(false);
  };

  const handleVideoEnd = () => {
    setIsVideoEnded(true);
  };

  const startNextRound = () => {
    setShowMessage(false);
    setCurrentVideo(0);
    setIsVideoEnded(false);
    setRoundCompleted(false);
  };

  const goToWithdraw = () => {
    router.push("/withdraw");
  };

  // If not client-side yet, show loading
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If user is not eligible for next round, show timer and block content
  if (currentPlan && currentPlan.lastRoundDate && timeLeft > 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black py-10 px-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">
            ⏳ Next Round Locked
          </h2>
          <p className="text-white mb-2">
            You can watch the next round after 24 hours from your last round.
          </p>
          <div className="text-blue-400 text-lg font-mono mb-4">
            {`${Math.floor(timeLeft / (1000 * 60 * 60))}h ${Math.floor(
              (timeLeft / (1000 * 60)) % 60
            )}m ${Math.floor((timeLeft / 1000) % 60)}s`}
          </div>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black py-10 px-4">
      {/* Header with current progress */}
      {currentPlan && (
        <div className="w-full max-w-2xl mb-6 bg-gray-900 p-4 rounded-lg">
          <div className="flex justify-between items-center text-white">
            <div>
              <h3 className="text-lg font-semibold">
                Plan: ${currentPlan.planAmount}
              </h3>
              <p className="text-sm text-gray-400">
                {(() => {
                  const roundNumber =
                    currentPlan.roundCount + (roundCompleted ? 0 : 1);
                  // If round just completed, show next round as 'active after 24 hours'
                  if (roundCompleted) {
                    return `Round: ${roundNumber} (active after 24 hours)`;
                  }
                  return `Round: ${roundNumber}`;
                })()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-yellow-400 font-bold">
                Profit: ${currentPlan.profit || 0}
              </p>
              <p className="text-sm text-gray-400">
                Video {currentVideo + 1} of {videoUrls.length}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl">
        {!showMessage ? (
          <div className="relative">
            <ReactPlayer
              url={videoUrls[currentVideo]}
              playing={true}
              controls={false}
              width="100%"
              height="250px"
              onEnded={handleVideoEnd}
              config={{
                youtube: {
                  playerVars: {
                    disablekb: 1,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    controls: 0,
                    fs: 0,
                  },
                },
              }}
            />
            {!isVideoEnded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-white text-center">
                  <p className="text-lg mb-2">
                    Please watch the video to continue
                  </p>
                  <p className="text-sm text-gray-300">Video will auto-play</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-white text-xl font-bold text-center p-6 bg-gray-900 rounded-lg">
            {roundCompleted &&
            progress &&
            progress.canWithdraw &&
            progress.profit > 0 ? (
              <div className="space-y-4">
                <div className="text-2xl text-green-400">
                  🎉 Round Complete!
                </div>
                <p>
                  You have earned ${progress.profit - lastProfit} from this
                  round!
                </p>
                <p className="text-yellow-400">
                  Total Profit: ${progress.profit}
                </p>
                <p className="text-sm text-gray-400">
                  You can now withdraw your earnings or start a new round.
                </p>
                <button
                  onClick={goToWithdraw}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition"
                >
                  💰 Withdraw ${progress.profit}
                </button>
              </div>
            ) : (
              <p>Round processing... Please wait.</p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col space-y-4 w-full max-w-2xl">
        {!showMessage ? (
          <button
            onClick={nextVideo}
            className={`py-3 px-6 rounded-lg font-medium transition ${
              !isVideoEnded
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-yellow-500 text-black hover:bg-yellow-400"
            }`}
          >
            {currentVideo >= videoUrls.length - 1
              ? "Complete Round"
              : "Next Video"}
          </button>
        ) : roundCompleted && progress ? (
          <div className="space-y-3">
            <button
              onClick={goToWithdraw}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition"
            >
              💰 Withdraw ${progress.profit}
            </button>
            <button
              onClick={startNextRound}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition"
            >
              Start Next Round
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={startNextRound}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition"
            >
              Try Again
            </button>
          </div>
        )}

        <Link
          href="/dashboard"
          className="text-center text-gray-400 hover:text-white text-sm mt-4 block"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

// Wrap the component with ProtectedRoute to ensure only authenticated users can access it
const VideoPage = () => {
  return (
    <ProtectedRoute>
      <Videos />
    </ProtectedRoute>
  );
};

export default VideoPage;
