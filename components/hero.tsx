"use client"

import { useEffect, useState } from "react";
import { toast } from "sonner";
import supabase from "@/lib/db/supabaseClient";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center">
      
      {/* Background Hero Image with Dark Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <Image
          src="/iimk-aerial-view.jpg"
          alt="IIMK Aerial View"
          layout="fill"
          objectFit="cover"
          className="opacity-70"
        />
      </div>

      {/* Overlay Content */}
      <div className="relative flex flex-col items-center text-center px-6 text-white">
        <h1 className="text-5xl font-extrabold mt-4 tracking-tight">Ensuring Safety at IIM Kozhikode</h1>
        <p className="text-lg mt-4 max-w-2xl font-semibold bg-black/20 rounded-xl p-4 shadow-lg">
          Report incidents instantly and keep the campus secure.
        </p>
        <Link
          href="/report"
          className="mt-6 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg transition duration-300 hover:bg-gray-700"
        >
          Report an Incident
        </Link>
      </div>

      <p className="absolute bottom-6 text-sm font-medium tracking-wide italic text-gray-300">
        "Vigilance, Safety, Action."
      </p>
    </div>
  );
}
