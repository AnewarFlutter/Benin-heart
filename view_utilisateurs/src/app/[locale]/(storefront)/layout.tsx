"use client";

import { Navbar02 } from "@/components/ui/shadcn-io/navbar-02";
import Navbar from "../_components/navbar";
import FooterSection from "../_components/footer_section";
import ChatbotWidget from "@/components/chatbot/chatbot-widget";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <Navbar />
      {/* <Navbar02 /> */}
      <main className="w-full min-h-screen">{children}</main>

      {/* Footer */}
      <FooterSection />

      {/* Dark Mode Toggle - Circle Avatar (caché sur mobile) */}
      {mounted && (
        <div className="hidden md:block fixed bottom-6 right-6 z-50">
          {/* Anneau pulsant */}
          <div className="absolute inset-0 w-14 h-14 rounded-full bg-primary/30 dark:bg-white/30 animate-ping" />

          {/* Anneau brillant */}
          <div className="absolute inset-0 w-14 h-14 rounded-full bg-gradient-to-tr from-primary/50 to-primary/20 dark:from-white/50 dark:to-white/20 blur-sm animate-pulse" />

          {/* Bouton principal */}
          <button
            onClick={toggleTheme}
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 dark:from-white dark:via-gray-50 dark:to-gray-100 backdrop-blur-md text-white dark:text-black shadow-2xl hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex items-center justify-center hover:scale-110 hover:rotate-12 border-2 border-white/20 dark:border-black/10"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <Sun className="w-6 h-6 drop-shadow-lg" />
            ) : (
              <Moon className="w-6 h-6 drop-shadow-lg" />
            )}
          </button>
        </div>
      )}

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </>
  );
}
