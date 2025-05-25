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
  const [hasDeposited, setHasDeposited] = useState(false);
  const [canStartTask, setCanStartTask] = useState(true);
  const [timer, setTimer] = useState(0);
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
  }, [isAuthenticated, getToken]);

  // Timer countdown
  useEffect(() => {
    if (!canStartTask && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 1000 ? prev - 1000 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [canStartTask, timer]);

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
            <>
              {/* Start Task or Deposit Button (Desktop) */}
              {!hasDeposited ? (
                <button
                  onClick={() => router.push("/deposit")}
                  className="px-4 py-2 rounded font-semibold transition bg-yellow-500 text-white hover:bg-yellow-400"
                >
                  Deposit
                </button>
              ) : (
                <button
                  onClick={() => canStartTask && router.push("/video_route")}
                  className={`px-4 py-2 rounded font-semibold transition ${
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
                      )}h ${Math.floor(
                        (timer / (1000 * 60)) % 60
                      )}m ${Math.floor((timer / 1000) % 60)}s`}
                </button>
              )}
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
            </>
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
              {/* Start Task or Deposit Button */}
              {!hasDeposited ? (
                <button
                  onClick={() => router.push("/deposit")}
                  className="px-4 py-2 rounded font-semibold transition bg-yellow-500 text-white hover:bg-yellow-400"
                >
                  Deposit
                </button>
              ) : (
                <button
                  onClick={() => canStartTask && router.push("/video_route")}
                  className={`px-4 py-2 rounded font-semibold transition ${
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
                      )}h ${Math.floor(
                        (timer / (1000 * 60)) % 60
                      )}m ${Math.floor((timer / 1000) % 60)}s`}
                </button>
              )}
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
