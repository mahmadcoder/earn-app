"use client";
import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import ProtectedRoute from "../components/ProtectedRoute";
import Link from "next/link";

const Videos = () => {
  const videoUrls = [
    "https://www.youtube.com/watch?v=LXb3EKWsInQ",
    "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
  ];

  const [currentVideo, setCurrentVideo] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [progress, setProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch plan progress after round complete
  useEffect(() => {
    if (isRoundComplete) {
      setLoadingProgress(true);
      fetch("/api/plan/all-progress")
        .then((res) => res.json())
        .then((data) => {
          if (data.progresses && data.progresses.length > 0) {
            // Use the first plan with canWithdraw true, or the first plan
            const eligible =
              data.progresses.find((p) => p.canWithdraw) || data.progresses[0];
            setProgress(eligible);
          } else {
            setProgress(null);
          }
        })
        .finally(() => setLoadingProgress(false));
    }
  }, [isRoundComplete]);

  const nextVideo = () => {
    if (!isVideoEnded) return;
    if (currentVideo < videoUrls.length - 1) {
      setCurrentVideo(currentVideo + 1);
      setIsVideoEnded(false);
    } else {
      setShowMessage(true);
      setIsRoundComplete(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    }
  };

  const handleVideoEnd = () => {
    setIsVideoEnded(true);
  };

  const nextRound = () => {
    setIsRoundComplete(false);
    setCurrentVideo(0);
    setIsVideoEnded(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black py-10 px-4">
      <div className="w-full max-w-2xl">
        {!showMessage ? (
          isClient ? (
            <ReactPlayer
              url={videoUrls[currentVideo]}
              playing={true}
              controls={false}
              width="100%"
              height="250px"
              onEnded={handleVideoEnd}
            />
          ) : (
            <p className="text-white text-center">Loading video...</p>
          )
        ) : (
          <div className="text-white text-xl font-bold text-center p-6">
            {isRoundComplete && loadingProgress && (
              <span>Checking eligibility...</span>
            )}
            {isRoundComplete &&
              !loadingProgress &&
              progress &&
              progress.canWithdraw && (
                <span>Congratulations! You can now withdraw your profit.</span>
              )}
            {isRoundComplete &&
              !loadingProgress &&
              progress &&
              !progress.canWithdraw && <span>Round complete!</span>}
          </div>
        )}
      </div>

      {!showMessage && !isRoundComplete && (
        <button
          onClick={nextVideo}
          disabled={!isVideoEnded}
          className={`mt-4 py-2 px-6 rounded-lg transition ${
            !isVideoEnded
              ? "bg-gray-500 text-gray-300 cursor-not-allowed"
              : "bg-yellow-500 text-white hover:bg-yellow-600"
          }`}
        >
          Next Video
        </button>
      )}

      {isRoundComplete && showMessage && (
        <div className="mt-4">
          {loadingProgress ? (
            <button className="bg-gray-500 text-gray-300 py-2 px-6 rounded-lg cursor-not-allowed">
              Checking...
            </button>
          ) : progress && progress.canWithdraw ? (
            <Link href="/withdraw">
              <button className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition">
                Withdraw
              </button>
            </Link>
          ) : (
            <button
              onClick={nextRound}
              className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition"
            >
              Start Next Round
            </button>
          )}
        </div>
      )}
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
