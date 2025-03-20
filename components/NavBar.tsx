"use client"

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import supabase from "@/lib/db/supabaseClient"; // Import Supabase
import { Home, LogOut, List, FilePlus, LayoutDashboard, Menu, X } from "lucide-react"; // Import logout icon and Lucide icons
import { User } from "@supabase/supabase-js";
import { toast } from "sonner"; // Import toast

export default function NavBar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.setItem("logoutSuccess", "true"); // Set logout flag
    window.location.href = "/"; // Redirect to home
  };

  // Show toast on the home page
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("logoutSuccess") === "true") {
      toast.success("Logged out successfully!", {
        style: { backgroundColor: "white", border: "1px solid black", color: "black" },
      });
      localStorage.removeItem("logoutSuccess"); // Clear flag after showing toast
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <>
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 w-full bg-black text-white shadow-md flex items-center p-2 z-50">
        {/* Sidebar Toggle Button */}
        <button onClick={toggleSidebar} className="text-white text-2xl ml-2">
          <Menu size={24} />
        </button>

        {/* Centered Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/">
            <Image src="/k-guardian-logo-white.png" alt="K-Guardian Logo" width={180} height={180} className="cursor-pointer" />
          </Link>
        </div>
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 bg-black text-white shadow-lg transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-80"} transition-transform duration-300 ease-in-out z-50 flex flex-col justify-start p-6`}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/20">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={toggleSidebar} className="text-white">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow space-y-6 mt-6">
          {/* Auth Button */}
          <div className="flex justify-start">
            <AuthButton />
          </div>

          {/* Navigation */}
          <div className="border-t border-white/20 pt-6 flex flex-col space-y-6">
            <Link
              href="/"
              className="flex items-center gap-4 text-lg hover:text-gray-400"
              onClick={toggleSidebar}
            >
              <Home size={24} />
              Home
            </Link>
            <Link
              href="/report"
              className="flex items-center gap-4 text-lg hover:text-gray-400"
              onClick={toggleSidebar}
            >
              <FilePlus size={24} />
              Report Incident
            </Link>

            {/* Show only if user is logged in */}
            {user && (
              <>
                <Link
                  href="/incident-logs"
                  className="flex items-center gap-4 text-lg hover:text-gray-400"
                  onClick={toggleSidebar}
                >
                  <List size={24} />
                  Incident Logs
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-4 text-lg hover:text-gray-400"
                  onClick={toggleSidebar}
                >
                  <LayoutDashboard size={24} />
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Logout Button (only if user is logged in) */}
        {user && (
          <div className="mt-auto w-full border-t border-gray-700 pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 text-lg text-white font-semibold hover:bg-gray-800 transition"
            >
              <LogOut size={24} />
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
