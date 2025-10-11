"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { studentExamApi } from "@/lib/exam-api";
import { ExamType } from "@/types/exam";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Image from "next/image";
import { Check, ChevronRight } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
      return;
    }

    // Load exam types for students (public)
    loadExamTypes();
  }, [isAuthenticated, isLoading, router]);

  const loadExamTypes = async () => {
    try {
      setLoading(true);
      const response = await studentExamApi.getExamTypes();
      if (response.success && response.data) {
        setExamTypes(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load exam types");
    } finally {
      setLoading(false);
    }
  };

  const handleExamTypeClick = (examTypeId: string) => {
    router.push(`/exam-types/${examTypeId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                Excel in Your
                <span className="gradient-text block">Examinations</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Access comprehensive COC exam study materials, practice
                questions, and exam resources all in one place. Prepare smarter,
                not harder.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => router.push("/auth/register")}
                  className="bg-primary hover:cursor-pointer hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Start Learning Today
                </button>
                <button
                  onClick={() => {
                    document
                      .getElementById("exam-types")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="border border-primary text-primary hover:cursor-pointer hover:bg-primary hover:text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                  Browse Exam Types
                </button>
              </div>
              <div className="mt-6 flex items-center justify-center lg:justify-start space-x-4">
                <div className="text-center border p-4 space-y-1 rounded-lg shadow-xl">
                  <div className="text-4xl font-bold text-primary/90">500+</div>
                  <div className="text-sm text-muted-foreground">
                    Study Materials
                  </div>
                </div>
                <div className="text-center border p-4 space-y-1 rounded-lg shadow-xl">
                  <div className="text-4xl font-bold text-primary/90">
                    {examTypes.length}+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Exam Types
                  </div>
                </div>
                <div className="text-center border p-4 space-y-1 rounded-lg shadow-xl">
                  <div className="text-4xl font-bold text-primary/90">
                    1000+
                  </div>
                  <div className="text-base font-medium text-muted-foreground">
                    Practice Questions
                  </div>
                </div>
              </div>
            </div>
            <div className="relative flex flex-col justify-center items-center w-full">
              <Image
                src="/hero-decor.png"
                alt="Hero Image"
                width={500}
                height={500}
                className="z-[1000] mx-auto ml-10"
              />
              <div className="relative w-full max-w-md  z-10 -mt-10 ml-20 bg-white mx-auto rounded-2xl shadow-2xl p-8 transform rotate-0 hover:rotate-5 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-primary/50 rounded-full"></div>
                    <div className="h-3 bg-gray-200 rounded flex-1"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-primary/50 rounded-full"></div>
                    <div className="h-3 bg-gray-200 rounded flex-1"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-primary/50 rounded-full"></div>
                    <div className="h-3 bg-gray-200 rounded flex-1 max-w-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 right-0 -z-0 size-[570px] bg-primary/10 shadow-lg rounded-full animate-pulse-slow"></div>
              {/* <div className="absolute bottom-14 left-4 z-0 w-32 h-32 bg-accent/20 rounded-full animate-float"></div> */}
            </div>
          </div>
        </div>
      </section>

      {/* What Our System Contains */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and resources
              you need for effective exam preparation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "📚",
                title: "Study Materials",
                description:
                  "Access comprehensive PDFs, documents, and study guides organized by department and exam type.",
                features: [
                  "PDF Downloads",
                  "Organized Content",
                  "Latest Updates",
                ],
              },
              {
                icon: "❓",
                title: "Practice Questions",
                description:
                  "Test your knowledge with multiple-choice questions and detailed explanations.",
                features: [
                  "MCQ Practice",
                  "Detailed Solutions",
                  "Progress Tracking",
                ],
              },
              {
                icon: "🏛️",
                title: "Department-wise Content",
                description:
                  "Find materials specific to your department and academic level.",
                features: [
                  "Multiple Departments",
                  "Organized Curriculum",
                  "Easy Navigation",
                ],
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                description:
                  "Monitor your preparation progress and identify areas for improvement.",
                features: [
                  "Performance Analytics",
                  "Study Statistics",
                  "Goal Setting",
                ],
              },
              {
                icon: "🎯",
                title: "Exam-focused Content",
                description:
                  "Materials specifically curated for different types of examinations.",
                features: [
                  "Targeted Content",
                  "Exam Patterns",
                  "Time Management",
                ],
              },
              {
                icon: "🔄",
                title: "Regular Updates",
                description:
                  "Stay current with the latest syllabus changes and new content additions.",
                features: [
                  "Fresh Content",
                  "Syllabus Updates",
                  "New Materials",
                ],
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card border relative border-primary/50 rounded-xl p-6 shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 group">
                <div className="absolute -top-20 -right-12 h-32 w-60 bg-violet-500/20 rotate-[30deg] "></div>
                <div className="absolute -top-14 -right-40 h-40 w-[400px] bg-violet-500/10 rotate-[30deg] "></div>
                <div className="border-primary text-primary bg-violet-500/30 absolute group-hover:scale-110 group-hover:translate-x-24 transition-transform duration-300 aspect-square right-6 size-14 font-extrabold text-2xl flex items-center justify-center p-3 rounded-full border-4">
                  {index + 1}
                </div>
                <div className="border-primary text-primary bg-violet-500/20 absolute group-hover:scale-110 -translate-x-24 group-hover:translate-x-1 transition-transform duration-300 aspect-square left-6 size-14 font-extrabold text-2xl flex items-center justify-center p-3 rounded-full border-4">
                  {index + 1}
                </div>
                {/* <div className="absolute group-hover:scale-110  transition-transform duration-500 aspect-square left-6 size-14 font-extrabold text-2xl flex items-center justify-center p-3 rounded-full border-4">
                  {index}
                </div> */}
                <div className="flex justify-between">
                  <div className="text-4xl mb-4 group-hover:scale-110 group-hover:-translate-x-20 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <div className="text-4xl right-0 mb-4 group-hover:scale-110 translate-x-20 group-hover:-translate-x-2 transition-transform duration-500">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-card-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-sm text-muted-foreground">
                      <Check className="size-5 mr-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Exam Types */}
      <section
        id="exam-types"
        className="py-20 bg-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Available Exam Types
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose from our comprehensive collection of exam preparation
              materials
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-1">
              <div className="text-destructive mb-4">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Failed to load exam types
              </h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <button
                onClick={loadExamTypes}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium">
                Try Again
              </button>
            </div>
          ) : examTypes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No exam types available
              </h3>
              <p className="text-muted-foreground">
                Check back later for new exam types and study materials.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 items-center justify-center">
              {examTypes.map((examType) => (
                <div
                  key={examType.id}
                  onClick={() => handleExamTypeClick(examType.id)}
                  className="relative bg-card border overflow-hidden rounded-xl min-w-1/3 p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl border-primary/50 group">
                  <div className="absolute -bottom-20 -right-10 h-60 w-32 bg-primary/20 rotate-45 "></div>
                  <div className="absolute -bottom-14 -right-10 h-40 w-20 bg-primary/40 rotate-45 "></div>
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 rounded-lg p-3 mr-4 group-hover:bg-primary/20 transition-colors">
                      <svg
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                        {examType.name}
                      </h3>
                      {examType.description && (
                        <p className="opacity-80 text-sm mt-1">
                          {examType.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-80 font-bold">
                      {examType.departments?.length || 0} Departments
                    </span>
                    <div className="rounded-full bottom-3 flex items-center justify-center absolute right-5 p-2 size-12 bg-primary text-primary-foreground group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="size-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose COC Exam Portal?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're committed to providing the best exam preparation experience
              with proven results and student satisfaction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4">
            {[
              {
                icon: "🎯",
                title: "Targeted Content",
                description:
                  "Carefully curated materials that align perfectly with exam requirements and syllabi.",
              },
              {
                icon: "✅",
                title: "Verified Quality",
                description:
                  "All content is reviewed and verified by subject matter experts and educators.",
              },
              {
                icon: "📱",
                title: "Mobile Friendly",
                description:
                  "Study anywhere, anytime with our responsive design that works on all devices.",
              },
              {
                icon: "🔒",
                title: "Secure Platform",
                description:
                  "Your data and progress are protected with industry-standard security measures.",
              },
              {
                icon: "📈",
                title: "Track Progress",
                description:
                  "Monitor your improvement with detailed analytics and performance insights.",
              },
              {
                icon: "💬",
                title: "Community Support",
                description:
                  "Connect with fellow students and get help when you need it most.",
              },
              {
                icon: "⚡",
                title: "Fast Loading",
                description:
                  "Optimized for speed so you can focus on learning without technical interruptions.",
              },
              {
                icon: "🆓",
                title: "Free Access",
                description:
                  "Quality education should be accessible to everyone. Core features are completely free.",
              },
            ].map((reason, index) => (
              <div
                key={index}
                className="text-center group border p-4 space-y-1 hover:border-primary/80 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="text-4xl mb-4 group-hover:scale-140 transition-transform duration-300">
                  {reason.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {reason.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute h-full aspect-square top-0 translate-x-1/2 rounded-full bg-white/15 right-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have successfully prepared for their
            exams with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/auth/register")}
              className="bg-white text-primary hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
              Create Free Account
            </button>
            <button
              onClick={() => router.push("/auth/login")}
              className="border-2 border-white text-primary-foreground hover:bg-white hover:text-primary px-8 py-4 rounded-lg text-lg font-semibold transition-all">
              Login to Continue
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
