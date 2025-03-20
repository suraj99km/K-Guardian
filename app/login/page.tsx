"use client"

import { useState } from "react";
import Image from "next/image";
import supabase from "@/lib/db/supabaseClient";

export default function LoginPage() {
  const [loading, setLoading] = useState<boolean>(false);

  const signInWithProvider = async () => {
    setLoading(true);

    const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}`;
    console.log(process.env.NEXT_PUBLIC_BASE_URL);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black to-gray-900 text-white p-6">
      {/* K-Guardian Logo */}
      <Image src="/k-guardian-logo-white.png" alt="K-Guardian Logo" width={200} height={200} className="mb-6" />

      {/* Login Box */}
      <div className="bg-gray-800 shadow-xl rounded-lg p-10 max-w-md w-full text-center">
        {/* Welcome Text */}
        <h1 className="text-3xl font-bold tracking-wide">Welcome to <br/><span className="italic font-black text-4xl">K-Guardian</span></h1>


        {/* Google Sign-In Button */}
        <button 
          onClick={signInWithProvider}
          className="mt-6 px-8 py-3 bg-white text-black font-semibold rounded-lg transition duration-300 hover:bg-blue-500 shadow-lg w-full"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>

      <p className="text-lg mt-3 text-gray-300 italic">"Your Safety, Our Priority."</p>
    </div>
  );
}
