"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, user, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  // Redirect if already logged in
  if (!loading && user) {
    router.push("/dashboard");
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setLocalError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError("");
    setIsLoading(true);

    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setLocalError(err.message || "Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neon-blue border-r-transparent"></div>
          <p className="mt-2 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Sign In</h1>
          <p className="text-gray-400 mt-2">Welcome to Solar AI Platform</p>
        </div>

        {(error || localError) && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
            {error || localError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-neon-blue hover:bg-neon-blue/90 text-black font-semibold"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          variant="outline"
          className="w-full border-gray-700 text-white hover:bg-gray-800"
        >
          Sign in with Google
        </Button>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-neon-blue hover:text-neon-blue/80"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
