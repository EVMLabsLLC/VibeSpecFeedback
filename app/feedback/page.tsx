"use client";

import Header from "@/components/Header";
import FeedbackForm from "@/components/FeedbackForm";
import FeedbackList from "@/components/FeedbackList";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";

export default function FeedbackPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFeedbackSubmit = () => {
    // Trigger a refresh of the feedback list
    setRefreshTrigger(prev => prev + 1);
    // Close the modal after successful submission
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Feedback List Section */}
        <section className="py-12 sm:py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <FeedbackList 
              refreshTrigger={refreshTrigger} 
              onOpenModal={() => setIsModalOpen(true)}
            />
          </div>
        </section>
      </main>
      
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