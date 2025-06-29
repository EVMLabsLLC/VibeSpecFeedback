"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeedbackForm from "@/components/FeedbackForm";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Users, Zap } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFeedbackSubmit = () => {
    // Close the modal after successful submission
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-gradient py-12 sm:py-16 lg:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-6 sm:space-y-8 animate-fade-in">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Welcome to{" "}
                  <span className="gradient-text">feedback.vibespec</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
                  Share your feedback, request features, and help us build something amazing together. 
                  Join our community and make your voice heard.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 px-4">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  size="lg"
                  className="button-glow text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-6 h-auto w-full sm:w-auto"
                >
                  <MessageSquarePlus className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                  Share Your Feedback
                </Button>
                <Link href="/feedback">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-6 h-auto glass-effect w-full sm:w-auto"
                  >
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Explore Community
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center space-y-3 sm:space-y-4 animate-slide-in">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <MessageSquarePlus className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">Easy Feedback</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Share your thoughts, report bugs, or request features with our simple and intuitive interface.
                </p>
              </div>
              
              <div className="text-center space-y-3 sm:space-y-4 animate-slide-in" style={{ animationDelay: '0.1s' }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">Community Driven</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Upvote and discuss feedback from the community. Your voice helps prioritize what matters most.
                </p>
              </div>
              
              <div className="text-center space-y-3 sm:space-y-4 animate-slide-in sm:col-span-2 md:col-span-1" style={{ animationDelay: '0.2s' }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">Fast Response</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Track the status of your feedback and get updates when we implement your suggestions.
                </p>
              </div>
            </div>
          </div>
        </section>


      </main>

      <Footer />
      
      {/* Feedback Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Share Your Feedback"
      >
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <MessageSquarePlus className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Help us improve by sharing your thoughts, reporting bugs, or requesting new features. 
              Your feedback drives our development priorities.
            </p>
          </div>
          <FeedbackForm onSubmit={handleFeedbackSubmit} />
        </div>
      </Modal>
    </div>
  );
}
