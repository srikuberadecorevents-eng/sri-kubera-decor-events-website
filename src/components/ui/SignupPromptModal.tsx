"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, Sparkles, LogIn, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPromptModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    
    // Check if user has already seen and dismissed the prompt
    if (localStorage.getItem("hasSeenSignupPrompt") === "true") {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const checkAuthAndSchedule = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // If not logged in, schedule the popup for 2 minutes (120000ms)
        if (!session) {
          timeoutId = setTimeout(() => {
            setIsOpen(true);
          }, 120000); 
        }
      } catch (e) {
        console.error("Auth check failed", e);
      }
    };

    checkAuthAndSchedule();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [supabase.auth]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenSignupPrompt", "true");
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: "rgba(6, 38, 30, 0.6)",
        backdropFilter: "blur(6px)"
      }}
    >
      <div 
        className="relative w-full max-w-lg bg-ivory-100 rounded-[2rem] shadow-2xl overflow-hidden border border-ivory-300 animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-prompt-title"
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C9A24B] via-[#f4df95] to-[#C9A24B]" />
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-navy-400 hover:text-navy-900 bg-white hover:bg-ivory-200 rounded-full transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-10 text-center relative">
          <div className="w-16 h-16 mx-auto bg-[#C9A24B]/10 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="text-[#C9A24B]" size={32} />
          </div>
          
          <h2 
            id="signup-prompt-title"
            className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome to Sri Kubera
          </h2>
          
          <p className="text-navy-600 text-sm sm:text-base leading-relaxed mb-8">
            Create an account to save your favorite designs, track your event enquiries, and receive personalized decoration recommendations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link 
              href="/signup" 
              onClick={handleClose}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-navy-900 text-white rounded-full font-bold text-sm tracking-wide shadow-md hover:bg-navy-800 transition-colors"
            >
              <UserPlus size={18} />
              Create Account
            </Link>
            
            <Link 
              href="/login"
              onClick={handleClose}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-navy-900 border border-ivory-300 rounded-full font-bold text-sm tracking-wide shadow-sm hover:border-[#C9A24B] hover:text-[#C9A24B] transition-colors"
            >
              <LogIn size={18} />
              Sign In
            </Link>
          </div>
          
          <button 
            onClick={handleClose}
            className="mt-6 text-xs text-navy-400 hover:text-navy-600 font-medium underline underline-offset-4 transition-colors"
          >
            Maybe later, I just want to browse
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
