"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Calendar, TrendingUp, AlertCircle, ChevronDown } from "lucide-react";

type SortOption = 'newest' | 'oldest' | 'most-upvotes' | 'least-upvotes' | 'status';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions = [
  { value: 'newest' as SortOption, label: 'Newest First', icon: Calendar, description: 'Most recent feedback' },
  { value: 'oldest' as SortOption, label: 'Oldest First', icon: Calendar, description: 'Oldest feedback first' },
  { value: 'most-upvotes' as SortOption, label: 'Most Upvotes', icon: TrendingUp, description: 'Highest upvoted first' },
  { value: 'least-upvotes' as SortOption, label: 'Least Upvotes', icon: TrendingUp, description: 'Lowest upvoted first' },
  { value: 'status' as SortOption, label: 'By Status', icon: AlertCircle, description: 'Group by status' },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = sortOptions.find(option => option.value === value) || sortOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: SortOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[140px] justify-between"
      >
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="h-4 w-4" />
          <span className="text-sm">{currentOption.label}</span>
        </div>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] bg-background border rounded-md shadow-lg z-50">
          <div className="py-1">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={`w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center space-x-2 transition-colors ${
                    value === option.value ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                  {value === option.value && (
                    <div className="w-2 h-2 bg-purple-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 