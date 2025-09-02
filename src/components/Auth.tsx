import React from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { SkeletonBox, SkeletonText, SkeletonCircle } from "./Skeleton";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

export const Auth: React.FC = () => {
  const { user, loading, signInWithGoogle, logout } = useAuth();

  if (loading) {
    return (
  <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="mb-6">
                <SkeletonCircle size={64} />
              </div>
              <SkeletonText width="80%" className="mb-4 mx-auto" />
              <SkeletonText width="60%" className="mb-8 mx-auto" />
              <SkeletonBox className="w-full h-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
  <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="bg-[#0A0A0A] hover:bg-[#131313] border border-[#222222] p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
          <User className="w-16 h-16 mx-auto mb-6 text-[#606060]" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Invoice Generator
          </h1>
          <p className="text-gray-400 mb-8 text-lg">
            Sign in with Google to create and manage your freelance invoices
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full bg-[#0A0A0A] hover:bg-[#131313] border border-[#222222] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3 text-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="rgba(255,255,255,1)"
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z"></path>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-8 md:px-10 px-4 py-2 border-b border-[#333]">
      {/* Logo */}
        <Link to="/">
         <h1 className="text-extrabold text-2xl text-white">Invoicify</h1>
        </Link>

      {/* User Profile Dropdown */}
      <div className="ml-auto relative z-10 group">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="md:w-10 w-8 md:h-10 h-8 rounded-full overflow-hidden cursor-pointer border-2 border-gray-600"
          />
        )}

        {/* Dropdown */}
        <div className="absolute right-0 mt-2 w-56 bg-[#131313] text-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <div className="px-4 py-3 border-b border-[#222222] overflow-hidden">
            <p className="font-semibold">{user.displayName}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 hover:bg-[#333] hover: flex items-center gap-2 overflow-hidden"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};
