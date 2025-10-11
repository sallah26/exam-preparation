import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthDebug } from "@/components/debug/AuthDebug";
import Navbar from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exam Portal - Study Materials & Practice Questions",
  description:
    "Access study materials, practice questions, and exam preparation resources organized by exam types, departments, and academic periods.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          {children}
          {/* <AuthDebug /> */}
        </AuthProvider>
        {/* Footer */}
        <footer className="bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-20">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center space-y-2 ">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    C
                  </span>
                </div>
                <h3 className="text-xl font-bold text-card-foreground">
                  COC Exam Portal
                </h3>
              </div>
              <p className="text-muted-foreground mb-4 max-w-lg mt-2 text-center">
                Empowering students with comprehensive exam preparation
                materials and resources. Your success is our mission.
              </p>
            </div>
            <div className="border-t border-border mt-8 pt-8 text-center">
              <p className="text-muted-foreground">
                © 2024 COC Exam Portal. All rights reserved. Made with ❤️ for
                students.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
