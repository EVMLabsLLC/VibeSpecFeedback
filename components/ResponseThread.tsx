"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { MessageCircle, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { ResponseWithAuthor } from "@/lib/types";
import ResponseItem from "./ResponseItem";
import ResponseForm from "./ResponseForm";

interface ResponseThreadProps {
  feedbackId: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function ResponseThread({ 
  feedbackId, 
  isExpanded = false, 
  onToggle 
}: ResponseThreadProps) {
  const { user } = useAuth();
  const [responses, setResponses] = useState<ResponseWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/feedback/${feedbackId}/responses`);
      const data = await response.json();
      
      if (data.success) {
        setResponses(data.data);
      } else {
        console.error('Failed to fetch responses:', data.error);
        setResponses([]);
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = () => {
    setShowResponseForm(false);
    fetchResponses(); // Refresh responses after new submission
  };

  useEffect(() => {
    if (isExpanded) {
      fetchResponses();
    }
  }, [isExpanded, feedbackId]);

  const responseCount = responses.reduce((count, response) => {
    const countReplies = (replies: ResponseWithAuthor[]): number => {
      return replies.reduce((total, reply) => 
        total + 1 + countReplies(reply.replies || []), 0
      );
    };
    return count + 1 + countReplies(response.replies || []);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-sm"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 mr-2" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2" />
          )}
          <MessageCircle className="w-4 h-4 mr-2" />
          {responseCount > 0 ? (
            <>
              {responseCount} {responseCount === 1 ? 'response' : 'responses'}
            </>
          ) : (
            'Start a discussion'
          )}
        </Button>

        {/* Add Response Button */}
        {user && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResponseForm(!showResponseForm)}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Add Response
          </Button>
        )}
      </div>

      {/* Expanded Thread Content */}
      {isExpanded && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Response Form */}
            {showResponseForm && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <ResponseForm
                  feedbackId={feedbackId}
                  onSubmit={handleResponseSubmit}
                  onCancel={() => setShowResponseForm(false)}
                  placeholder="Share your thoughts on this feedback..."
                />
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Responses */}
            {!loading && responses.length > 0 && (
              <div className="space-y-3">
                {responses.map((response) => (
                  <ResponseItem
                    key={response.id}
                    response={response}
                    onResponseSubmit={handleResponseSubmit}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && responses.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No responses yet. Be the first to share your thoughts!
                </p>
                {user && !showResponseForm && (
                  <Button
                    onClick={() => setShowResponseForm(true)}
                    variant="outline"
                  >
                    Start Discussion
                  </Button>
                )}
                {!user && (
                  <p className="text-xs text-muted-foreground">
                    Sign in to participate
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 