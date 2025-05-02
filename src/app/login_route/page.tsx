'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://watch-and-earn-production.up.railway.app";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('authToken', data.token);
        setMessage('Login successful!');
        setTimeout(() => {
          router.push(formData.email === 'admin@gmail.com' ? '/dashboard' : '/video_route');
        }, 700);
      } else {
        setMessage(data.message || 'Login failed. Please check your email and password.');
      }
    } catch (error) {
      console.error('API Error:', error);
      setMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Geist+Mono:wght@100..900&display=swap"
        />
      </Head>
      <div className="min-h-screen flex justify-center items-center bg-black py-12 px-4">
        <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-extrabold text-center text-white">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {message && <p className="text-center mt-4 text-sm text-white">{message}</p>}

          <p className="text-center text-white mt-4">
            Don’t have an account?{' '}
            <Link href="/registrationfom" className="text-indigo-500">
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
