"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { canUpdateStatus, FEEDBACK_STATUSES, STATUS_LABELS, STATUS_COLORS, FeedbackStatus } from "@/lib/admin";
import { showSuccess, showError, ToastMessages } from "@/lib/toast";
import { Loader2, Settings } from "lucide-react";

interface AdminStatusControlProps {
  feedbackId: string;
  currentStatus: string;
  onStatusUpdate?: (newStatus: FeedbackStatus) => void;
}

export default function AdminStatusControl({ 
  feedbackId, 
  currentStatus, 
  onStatusUpdate 
}: AdminStatusControlProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Only show controls to admins
  if (!canUpdateStatus(user?.email)) {
    return null;
  }

  const handleStatusUpdate = async (newStatus: FeedbackStatus) => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/feedback/${feedbackId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(ToastMessages.STATUS_UPDATED, ToastMessages.STATUS_UPDATED_DESC);
        onStatusUpdate?.(newStatus);
        setShowControls(false);
      } else {
        showError(ToastMessages.STATUS_ERROR, data.error || ToastMessages.STATUS_ERROR_DESC);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showError(ToastMessages.NETWORK_ERROR, ToastMessages.NETWORK_ERROR_DESC);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowControls(!showControls)}
        className="h-6 px-2 text-xs"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Settings className="w-3 h-3" />
        )}
        <span className="ml-1">Admin</span>
      </Button>

      {showControls && (
        <div className="absolute top-full left-0 mt-1 bg-black border border-gray-700 rounded-md shadow-lg z-50 p-2 min-w-[120px]">
          <p className="text-xs text-gray-300 mb-2">Update Status:</p>
          <div className="space-y-1">
            {FEEDBACK_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={status === currentStatus || loading}
                className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-700 transition-colors ${
                  status === currentStatus ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Badge 
                  variant="outline" 
                  className={`text-xs ${STATUS_COLORS[status]} border`}
                >
                  {STATUS_LABELS[status]}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 