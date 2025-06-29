"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FEEDBACK_TAGS } from "@/lib/types";
import { Filter, X, MessageSquarePlus } from "lucide-react";

interface FilterBarProps {
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
  feedbackCounts?: Record<string, number>;
  totalCount?: number;
  onShareFeedback?: () => void;
}

export default function FilterBar({ 
  activeFilters, 
  onFilterChange, 
  feedbackCounts = {},
  totalCount = 0,
  onShareFeedback
}: FilterBarProps) {
  
  const handleFilterToggle = (tag: string) => {
    if (activeFilters.includes(tag)) {
      // Remove filter
      onFilterChange(activeFilters.filter(f => f !== tag));
    } else {
      // Add filter
      onFilterChange([...activeFilters, tag]);
    }
  };

  const handleClearAll = () => {
    onFilterChange([]);
  };

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium text-sm sm:text-base">Filter by Category</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {activeFilters.length} active
            </Badge>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 px-2 text-xs flex-shrink-0"
          >
            <X className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {/* All Items Button */}
          <Button
            variant={!hasActiveFilters ? "default" : "outline"}
            size="sm"
            onClick={handleClearAll}
            className={`flex items-center space-x-1 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9 ${
              !hasActiveFilters 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : ''
            }`}
          >
            <span>All</span>
            <Badge 
              variant="secondary"
              className="ml-1 text-xs bg-white/20 text-inherit border-white/30 px-1"
            >
              {totalCount}
            </Badge>
          </Button>

          {/* Tag Filter Buttons */}
          {FEEDBACK_TAGS.map((tag) => {
            const isActive = activeFilters.includes(tag);
            const count = feedbackCounts[tag] || 0;
            const displayTag = tag.length > 10 ? tag.substring(0, 8) + '...' : tag;
            
            return (
              <Button
                key={tag}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterToggle(tag)}
                className={`flex items-center space-x-1 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9 ${
                  isActive 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : ''
                }`}
                disabled={count === 0}
                title={tag} // Show full tag name on hover
              >
                <span className="sm:hidden">{displayTag}</span>
                <span className="hidden sm:inline">{tag}</span>
                <Badge 
                  variant="secondary"
                  className={`ml-1 text-xs px-1 ${
                    isActive 
                      ? 'bg-white/20 text-inherit border-white/30' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Right: Share Feedback Button */}
        {onShareFeedback && (
          <div className="flex justify-center sm:justify-end">
            <Button 
              onClick={onShareFeedback}
              size="sm"
              className="button-glow text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-9 flex-shrink-0"
            >
              <MessageSquarePlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
              Share Your Feedback
            </Button>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-start space-x-2 pt-2 border-t">
          <span className="text-sm text-muted-foreground flex-shrink-0 mt-0.5">Active:</span>
          <div className="flex flex-wrap gap-1">
            {activeFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => handleFilterToggle(filter)}
              >
                {filter}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 