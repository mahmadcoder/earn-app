"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import React from "react";
import { useRouter } from "next/navigation";

const navbarLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout, getToken } = useAuth();
  const [profit, setProfit] = useState<number | null>(null);
  const [profitLoading, setProfitLoading] = useState(false);
  const [planProgress, setPlanProgress] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [depositLockLeft, setDepositLockLeft] = useState(0);
  const router = useRouter();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    window.location.href = "/";
  };

  // Fetch user profit
  const fetchProfit = async () => {
    if (!isAuthenticated || !getToken()) return;

    setProfitLoading(true);
    try {
      // Fetch all plan progresses for the user with authentication
      const res = await fetch(`/api/plan/all-progress`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("Fetched profit data:", data); // Debug line
      if (res.ok && data.success) {
        setProfit(data.totalProfit || 0);
      } else {
        console.error("Failed to fetch profit:", data.error);
        setProfit(0);
      }
    } catch (error) {
      console.error("Error fetching profit:", error);
      setProfit(0);
    } finally {
      setProfitLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfit();
    } else {
      setProfit(null);
    }
  }, [isAuthenticated]);

  // Listen for profitUpdated event to refresh profit
  useEffect(() => {
    const handleProfitUpdate = (e: CustomEvent) => {
      if (isAuthenticated) {
        // If event has detail with totalProfit, use that
        if (e.detail?.totalProfit !== undefined) {
          setProfit(e.detail.totalProfit);
        } else {
          // Otherwise fetch fresh data
          fetchProfit();
        }
      }
    };
    window.addEventListener(
      "profitUpdated",
      handleProfitUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "profitUpdated",
        handleProfitUpdate as EventListener
      );
    };
  }, [isAuthenticated]);

  // Fetch plan progress for timer/button
  useEffect(() => {
    const fetchPlanProgress = async () => {
      if (!isAuthenticated || !getToken()) return;
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
          // Use the most recent plan
          setPlanProgress(data.progresses[0]);
        } else {
          setPlanProgress(null);
        }
      } catch {
        setPlanProgress(null);
      }
    };
    fetchPlanProgress();
  }, [isAuthenticated, getToken]);

  // Calculate time left for next round
  useEffect(() => {
    if (!planProgress || !planProgress.lastRoundDate) {
      setTimeLeft(0);
      return;
    }
    const lastRound = new Date(planProgress.lastRoundDate);
    const nextTime = new Date(lastRound.getTime() + 24 * 60 * 60 * 1000);
    const update = () => {
      const now = new Date();
      const diff = nextTime.getTime() - now.getTime();
      setTimeLeft(diff > 0 ? diff : 0);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [planProgress]);

  // Calculate time left for 30-day deposit lock
  useEffect(() => {
    if (!planProgress || !planProgress.lastRoundDate) {
      setDepositLockLeft(0);
      return;
    }
    const lastPlan = new Date(planProgress.lastRoundDate);
    const unlockTime = new Date(lastPlan.getTime() + 30 * 24 * 60 * 60 * 1000);
    const update = () => {
      const now = new Date();
      const diff = unlockTime.getTime() - now.getTime();
      setDepositLockLeft(diff > 0 ? diff : 0);
    };
    update();
    const interval = setInterval(update, 1000 * 60); // update every minute
    return () => clearInterval(interval);
  }, [planProgress]);

  // Close profile dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".profile-menu")) {
      setIsProfileOpen(false);
    }
  };

  // Add click outside listener
  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-black p-4 fixed w-full top-0 left-0 z-10 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo + Links */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/P3.jpg"
              alt="Logo"
              width={48}
              height={48}
              className="rounded-md"
            />
            <span className="font-bold text-xl text-white">WatchEarn</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {navbarLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-white hover:text-gray-400"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Profit Display */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center space-x-2 mr-4">
            <span className="text-yellow-400 font-bold text-lg">
              {profitLoading ? "Profit: ..." : `Profit: $${profit ?? 0}`}
            </span>
          </div>
        )}

        {/* Auth Buttons or User Profile */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link
                href={depositLockLeft > 0 ? "#" : "/deposit"}
                className={`px-4 py-2 rounded font-semibold transition ${
                  depositLockLeft > 0
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-yellow-500 text-white hover:bg-yellow-400"
                }`}
                onClick={(e) => {
                  if (depositLockLeft > 0) e.preventDefault();
                }}
                tabIndex={depositLockLeft > 0 ? -1 : 0}
              >
                {depositLockLeft > 0
                  ? `Deposit after ${Math.ceil(
                      depositLockLeft / (1000 * 60 * 60 * 24)
                    )} ${
                      Math.ceil(depositLockLeft / (1000 * 60 * 60 * 24)) === 1
                        ? "day"
                        : "days"
                    }`
                  : "Deposit"}
              </Link>
              <Link
                href="/withdraw"
                className="text-white bg-green-500 px-4 py-2 rounded hover:bg-green-400"
              >
                Withdraw
              </Link>
              <div className="relative profile-menu">
                <button
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 cursor-pointer focus:outline-none"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-white text-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-white transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      {/* Next round timer/button */}
                      {planProgress && planProgress.lastRoundDate && (
                        <div className="mt-2">
                          {timeLeft > 0 ? (
                            <div className="text-xs text-blue-600">
                              Next round active in:{" "}
                              {`${Math.floor(
                                timeLeft / (1000 * 60 * 60)
                              )}h ${Math.floor(
                                (timeLeft / (1000 * 60)) % 60
                              )}m ${Math.floor((timeLeft / 1000) % 60)}s`}
                            </div>
                          ) : (
                            <button
                              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs font-medium transition"
                              onClick={() => router.push("/video_route")}
                            >
                              Go to Next Round
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 focus:outline-none"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/registrationfom"
                className="text-white bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-400"
              >
                Register
              </Link>
              <Link
                href="/login_route"
                className="text-white bg-gray-500 px-4 py-2 rounded hover:bg-gray-400"
              >
                Login
              </Link>
              <Link
                href="/admin/login"
                className="text-white bg-red-600 px-4 py-2 rounded hover:bg-red-500"
              >
                Admin
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isMobileMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black mt-4 p-4">
          {navbarLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="block text-white hover:text-gray-400 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-2 mb-2 mt-2">
                <span className="text-yellow-400 font-bold text-lg">
                  {profitLoading ? "Profit: ..." : `Profit: $${profit ?? 0}`}
                </span>
              </div>
              <Link
                href={depositLockLeft > 0 ? "#" : "/deposit"}
                className={`px-4 py-2 rounded font-semibold transition ${
                  depositLockLeft > 0
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-yellow-500 text-white hover:bg-yellow-400"
                }`}
                onClick={(e) => {
                  if (depositLockLeft > 0) e.preventDefault();
                }}
                tabIndex={depositLockLeft > 0 ? -1 : 0}
              >
                {depositLockLeft > 0
                  ? `Deposit after ${Math.ceil(
                      depositLockLeft / (1000 * 60 * 60 * 24)
                    )} ${
                      Math.ceil(depositLockLeft / (1000 * 60 * 60 * 24)) === 1
                        ? "day"
                        : "days"
                    }`
                  : "Deposit"}
              </Link>
              <Link
                href="/withdraw"
                className="block text-white hover:text-gray-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Withdraw
              </Link>
              <div className="py-2 border-t border-gray-700">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-2 py-2 text-sm text-red-400 hover:text-red-300"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/registrationfom"
                className="block text-white hover:text-gray-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
              <Link
                href="/login_route"
                className="block text-white hover:text-gray-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/admin/login"
                className="block text-white hover:text-gray-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
