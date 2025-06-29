"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { responseSchema, ResponseFormData } from "@/lib/validation";
import { showSuccess, showError, ToastMessages } from "@/lib/toast";
import { Loader2, Send, X, AlertCircle } from "lucide-react";

interface ResponseFormProps {
  feedbackId: string;
  parentId?: string | null;
  onSubmit?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export default function ResponseForm({
  feedbackId,
  parentId = null,
  onSubmit,
  onCancel,
  placeholder = "Write your response..."
}: ResponseFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      content: ''
    },
    mode: 'onChange'
  });

  const watchedContent = watch('content');

  const onFormSubmit = async (data: ResponseFormData) => {
    if (!user || loading) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/feedback/${feedbackId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: data.content,
          authorId: user.id,
          parentId: parentId,
        }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        showSuccess(ToastMessages.RESPONSE_SUBMITTED, ToastMessages.RESPONSE_SUBMITTED_DESC);
        reset();
        onSubmit?.();
      } else {
        showError(ToastMessages.RESPONSE_ERROR, responseData.error || ToastMessages.RESPONSE_ERROR_DESC);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      showError(ToastMessages.NETWORK_ERROR, ToastMessages.NETWORK_ERROR_DESC);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          Sign in to participate in the discussion
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Responding as: {user.username}
      </div>
      
      <Textarea
        {...register('content')}
        placeholder={placeholder}
        className={`min-h-[80px] text-sm ${errors.content ? 'border-red-500' : ''}`}
        disabled={loading}
      />
      
      {errors.content && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="w-3 h-3" />
          <span>{errors.content.message}</span>
        </div>
      )}
      
      <div className="flex items-center justify-end space-x-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
        
        <Button
          type="submit"
          size="sm"
          disabled={!watchedContent?.trim() || loading || !isValid}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-1" />
              Reply
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 