"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, Loader2, MessageCircle, Clock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { FeedbackWithVotes } from "@/lib/types";
import { getAdminDisplayName, STATUS_LABELS, STATUS_COLORS, FeedbackStatus, canUpdateStatus } from "@/lib/admin";
import { showSuccess, showError, ToastMessages } from "@/lib/toast";
import ResponseThread from "./ResponseThread";
import AdminStatusControl from "./AdminStatusControl";
import FilterBar from "./FilterBar";
import SearchBar from "./SearchBar";
import SortDropdown from "./SortDropdown";

type SortOption = 'newest' | 'oldest' | 'most-upvotes' | 'least-upvotes' | 'status';

interface FeedbackListProps {
  refreshTrigger?: number;
  onOpenModal?: () => void;
}

export default function FeedbackList({ refreshTrigger, onOpenModal }: FeedbackListProps) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/feedback', window.location.origin);
      if (user?.id) {
        url.searchParams.set('userId', user.id);
      }
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data.success) {
        setFeedback(data.data);
      } else {
        console.error('Failed to fetch feedback:', data.error);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (feedbackId: string) => {
    if (!user) {
      showError("Sign in required", "Please sign in to vote on feedback.");
      return;
    }
    
    setVotingStates(prev => ({ ...prev, [feedbackId]: true }));
    
    try {
      const response = await fetch(`/api/feedback/${feedbackId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the feedback in the list
        setFeedback(prev => prev.map(item => 
          item.id === feedbackId 
            ? { 
                ...item, 
                hasUserUpvoted: data.data.hasUpvoted,
                upvotes: data.data.upvotes 
              }
            : item
        ));
        
        // Show appropriate toast message
        if (data.data.hasUpvoted) {
          showSuccess(ToastMessages.VOTE_ADDED);
        } else {
          showSuccess(ToastMessages.VOTE_REMOVED);
        }
      } else {
        showError(ToastMessages.VOTE_ERROR, data.error || ToastMessages.VOTE_ERROR_DESC);
      }
    } catch (error) {
      console.error('Error toggling vote:', error);
      showError(ToastMessages.NETWORK_ERROR, ToastMessages.NETWORK_ERROR_DESC);
    } finally {
      setVotingStates(prev => ({ ...prev, [feedbackId]: false }));
    }
  };

  const toggleThread = (feedbackId: string) => {
    setExpandedThreads(prev => ({
      ...prev,
      [feedbackId]: !prev[feedbackId]
    }));
  };

  const handleStatusUpdate = (feedbackId: string, newStatus: FeedbackStatus) => {
    setFeedback(prev => prev.map(item => 
      item.id === feedbackId 
        ? { ...item, status: newStatus }
        : item
    ));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Filter feedback based on active filters and search query
  const filteredFeedback = feedback.filter(item => {
    // Tag filtering
    const passesTagFilter = activeFilters.length === 0 || 
      item.tags.some(tag => activeFilters.includes(tag));
    
    // Search filtering
    const passesSearchFilter = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return passesTagFilter && passesSearchFilter;
  });

  // Sort filtered feedback based on sort option
  const sortedFeedback = [...filteredFeedback].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'most-upvotes':
        return b.upvotes - a.upvotes;
      case 'least-upvotes':
        return a.upvotes - b.upvotes;
      case 'status':
        const statusOrder = { 'open': 0, 'planned': 1, 'in-progress': 2, 'completed': 3, 'rejected': 4 };
        const aStatus = ((a as any).status as FeedbackStatus) || 'open';
        const bStatus = ((b as any).status as FeedbackStatus) || 'open';
        return statusOrder[aStatus] - statusOrder[bStatus];
      default:
        return 0;
    }
  });

  // Calculate tag counts for filter buttons
  const tagCounts = feedback.reduce((counts, item) => {
    item.tags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return counts;
  }, {} as Record<string, number>);

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  const hasActiveSearchOrFilters = searchQuery.trim() || activeFilters.length > 0;

  useEffect(() => {
    fetchFeedback();
  }, [user?.id, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold">Community Feedback</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Search and Controls */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold">
            Community Feedback
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({sortedFeedback.length} {sortedFeedback.length === 1 ? 'item' : 'items'})
            </span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search feedback..."
            />
            <SortDropdown
              value={sortOption}
              onChange={handleSortChange}
            />
          </div>
        </div>
        
        <FilterBar
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          feedbackCounts={tagCounts}
          totalCount={feedback.length}
          onShareFeedback={onOpenModal}
        />
      </div>

      {/* Feedback Cards */}
      {sortedFeedback.length === 0 ? (
        <Card className="text-center py-8 sm:py-12">
          <CardContent className="space-y-4">
            <div className="text-4xl sm:text-6xl">📝</div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold">
                {hasActiveSearchOrFilters ? 'No feedback found' : 'No feedback yet'}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                {hasActiveSearchOrFilters 
                  ? 'Try adjusting your search or filters to find more feedback.'
                  : 'Be the first to share your thoughts and help shape the future of this platform!'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {sortedFeedback.map((item) => (
            <Card key={item.id} className="card-hover">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      {/* Vote Button */}
                      <Button
                        variant={item.hasUserUpvoted ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleVote(item.id)}
                        disabled={!user || votingStates[item.id]}
                        className="flex-col h-auto min-w-[44px] px-1.5 py-1.5 text-xs flex-shrink-0"
                      >
                        {votingStates[item.id] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ArrowUp className="h-3 w-3" />
                        )}
                        <span className="text-xs font-medium mt-0.5">
                          {item.upvotes}
                        </span>
                      </Button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg leading-tight pr-2">
                          {item.title}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm leading-relaxed mt-2 line-clamp-2 sm:line-clamp-3">
                          {item.description}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs px-2 py-0.5"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {(item as any).status && (
                    <Badge 
                      variant="outline" 
                      className={`${STATUS_COLORS[(item as any).status as FeedbackStatus]} text-xs whitespace-nowrap flex-shrink-0`}
                    >
                      {STATUS_LABELS[(item as any).status as FeedbackStatus]}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0 px-4 sm:px-6">
                {/* Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
                                     <div className="flex items-center gap-3">
                     <span className="flex items-center gap-1">
                       <Clock className="h-3 w-3" />
                       {formatTimeAgo(item.createdAt.toString())}
                     </span>
                     <span>by {item.author?.address ? getAdminDisplayName(item.author.address) : 'Unknown'}</span>
                   </div>
                  
                                     <div className="flex items-center gap-2">
                     {/* Admin Status Control */}
                     {canUpdateStatus(user?.email) && (
                       <AdminStatusControl
                         feedbackId={item.id}
                         currentStatus={(item as any).status as FeedbackStatus}
                         onStatusUpdate={(newStatus) => handleStatusUpdate(item.id, newStatus)}
                       />
                     )}
                    
                    {/* Response Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleThread(item.id)}
                      className="text-xs sm:text-sm px-2 py-1 h-auto touch-target"
                    >
                      {expandedThreads[item.id] ? (
                        <EyeOff className="h-3 w-3 mr-1" />
                      ) : (
                        <Eye className="h-3 w-3 mr-1" />
                      )}
                                             {expandedThreads[item.id] ? 'Hide' : 'Show'} Responses
                       {(item as any).responseCount > 0 && (
                         <Badge variant="secondary" className="ml-1 text-xs px-1">
                           {(item as any).responseCount}
                         </Badge>
                       )}
                    </Button>
                  </div>
                </div>

                {/* Response Thread */}
                                 {expandedThreads[item.id] && (
                   <div className="mt-4 pt-4 border-t">
                     <ResponseThread
                       feedbackId={item.id}
                       isExpanded={expandedThreads[item.id]}
                       onToggle={() => toggleThread(item.id)}
                     />
                   </div>
                 )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 