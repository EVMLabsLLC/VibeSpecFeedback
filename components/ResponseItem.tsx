"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponseWithAuthor } from "@/lib/types";
import { getAdminDisplayName } from "@/lib/admin";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { MessageCircle, ChevronRight, ChevronDown } from "lucide-react";
import ResponseForm from "@/components/ResponseForm";

interface ResponseItemProps {
  response: ResponseWithAuthor;
  depth?: number;
  onResponseSubmit?: () => void;
}

export default function ResponseItem({ 
  response, 
  depth = 0, 
  onResponseSubmit 
}: ResponseItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  
  const hasReplies = response.replies && response.replies.length > 0;
  const maxDepth = 3; // Limit nesting depth to prevent UI issues
  const canReply = depth < maxDepth;

  const formatTimeAgo = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onResponseSubmit?.();
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-muted pl-4' : ''}`}>
      <Card className="w-full mb-3">
        <CardContent className="pt-4">
          {/* Response Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {response.author.address ? 
                  `${response.author.address.slice(0, 6)}...${response.author.address.slice(-4)}` :
                  'Anonymous'
                }
              </Badge>
              
              {/* Admin Badge */}
              {response.author.address && getAdminDisplayName(response.author.address) && (
                <Badge
                  variant="default"
                  className="text-xs bg-purple-100 text-purple-800 border-purple-200"
                >
                  {getAdminDisplayName(response.author.address)}
                </Badge>
              )}
              
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(response.createdAt)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-xs"
                >
                  {showReplies ? (
                    <ChevronDown className="w-3 h-3 mr-1" />
                  ) : (
                    <ChevronRight className="w-3 h-3 mr-1" />
                  )}
                  {response.replies?.length} {response.replies?.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}
              
              {user && canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          </div>

          {/* Response Content */}
          <div className="text-sm leading-relaxed mb-3">
            {response.content}
          </div>

          {/* Reply Form */}
          {showReplyForm && user && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <ResponseForm
                feedbackId={response.feedbackId}
                parentId={response.id}
                onSubmit={handleReplySuccess}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`Reply to ${response.author.address ? response.author.address.slice(0, 6) + '...' : 'user'}`}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nested Replies */}
      {hasReplies && showReplies && (
        <div className="space-y-2">
          {response.replies?.map((reply) => (
            <ResponseItem
              key={reply.id}
              response={reply}
              depth={depth + 1}
              onResponseSubmit={onResponseSubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
} 