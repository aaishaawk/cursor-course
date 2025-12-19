"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ToastType = "success" | "error";

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

export default function ProtectedPage() {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [noKeyFound, setNoKeyFound] = useState(false);
  const hasValidated = useRef(false);
  const router = useRouter();

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasValidated.current) return;
    hasValidated.current = true;

    const validateApiKey = async () => {
      const apiKey = sessionStorage.getItem("pending_api_key");
      
      console.log("Checking sessionStorage for pending_api_key:", apiKey);
      
      if (!apiKey) {
        // No API key found - show error instead of redirecting
        setNoKeyFound(true);
        setIsValidating(false);
        setDebugInfo("No API key found in sessionStorage. Please go back to /playground and submit a key.");
        return;
      }

      // Clear the pending key immediately after reading
      sessionStorage.removeItem("pending_api_key");

      try {
        console.log("Validating API key:", apiKey);
        
        // Check if the API key exists in Supabase
        const { data, error } = await supabase
          .from("api_keys")
          .select("id, name, key")
          .eq("key", apiKey)
          .maybeSingle();

        console.log("Supabase response:", { data, error, apiKey });
        setDebugInfo(`Searched for key: ${apiKey.substring(0, 15)}... | Found: ${data ? "Yes" : "No"} | Error: ${error?.message || "None"}`);

        if (error) {
          // Database error
          setIsValid(false);
          setNoKeyFound(false);
          setToast({
            show: true,
            message: `Database error: ${error.message}`,
            type: "error",
          });
        } else if (!data) {
          // No matching key found
          setIsValid(false);
          setNoKeyFound(false);
          setToast({
            show: true,
            message: "Invalid API key",
            type: "error",
          });
        } else {
          // Valid API key
          setIsValid(true);
          setNoKeyFound(false);
          setToast({
            show: true,
            message: "Valid API key - /protected can be accessed",
            type: "success",
          });
        }
      } catch (err) {
        console.error("Validation error:", err);
        setIsValid(false);
        setNoKeyFound(false);
        setToast({
          show: true,
          message: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
          type: "error",
        });
      } finally {
        setIsValidating(false);
      }
    };

    validateApiKey();
  }, [router]);

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        closeToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-3xl transition-colors duration-500 ${isValid ? 'bg-emerald-500/10' : isValid === false ? 'bg-red-500/5' : 'bg-purple-500/10'}`} />
        <div className={`absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full blur-3xl transition-colors duration-500 ${isValid ? 'bg-cyan-500/10' : isValid === false ? 'bg-orange-500/5' : 'bg-pink-500/10'}`} />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        {isValidating ? (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-slate-600 border-t-emerald-500 animate-spin" />
            <h2 className="text-xl font-semibold text-white mb-2">Validating API Key</h2>
            <p className="text-slate-400">Please wait while we verify your credentials...</p>
          </div>
        ) : noKeyFound ? (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 shadow-2xl">
            {/* Warning Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-3">No API Key Provided</h1>
            <p className="text-slate-400 mb-8">Please enter your API key in the playground form first.</p>
            
            {debugInfo && (
              <p className="text-xs text-slate-500 mb-6 font-mono bg-slate-900/50 p-3 rounded-lg">{debugInfo}</p>
            )}

            <Link
              href="/playground"
              className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/25"
            >
              Go to Playground
            </Link>
          </div>
        ) : isValid ? (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 shadow-2xl">
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce-once">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-3">Access Granted</h1>
            <p className="text-slate-400 mb-8">Your API key has been validated successfully. You now have access to protected resources.</p>
            
            {/* Protected content preview */}
            <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-emerald-400">Protected Zone</p>
                  <p className="text-xs text-slate-500">Full API access enabled</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-white">∞</p>
                  <p className="text-xs text-slate-500">API Calls</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-xs text-slate-500">Uptime</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-white">Pro</p>
                  <p className="text-xs text-slate-500">Tier</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboards"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/25"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/playground"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
              >
                Try Another Key
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-10 shadow-2xl">
            {/* Minimal Error Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v.01M12 9v3m9-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-semibold text-white mb-2">Invalid API Key</h1>
            <p className="text-slate-400 text-sm mb-8">The key you entered wasn&apos;t found. Please check and try again.</p>
            
            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <Link
                href="/playground"
                className="w-full py-3 px-4 bg-white text-slate-900 font-medium rounded-xl hover:bg-slate-100 transition-colors text-center"
              >
                Try Again
              </Link>
              <Link
                href="/dashboards"
                className="w-full py-3 px-4 bg-slate-700/50 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-colors text-center border border-slate-600/50"
              >
                Create New Key
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
          toast.show
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`flex items-center gap-3 px-5 py-4 text-white rounded-xl shadow-2xl ${
            toast.type === "success"
              ? "bg-emerald-500 shadow-emerald-500/30"
              : "bg-red-500 shadow-red-500/30"
          }`}
        >
          <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
            {toast.type === "success" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={closeToast}
            className="ml-2 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

