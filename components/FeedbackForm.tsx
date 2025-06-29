"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { User, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { feedbackSchema, FeedbackFormData } from "@/lib/validation";
import { showSuccess, showError, ToastMessages } from "@/lib/toast";
import { FEEDBACK_TAGS } from "@/lib/types";

interface FeedbackFormProps {
  onSubmit?: () => void;
}

export default function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: []
    },
    mode: 'onChange' // Enable real-time validation
  });

  const watchedTags = watch('tags') || [];

  const handleTagToggle = (tag: string) => {
    const tagValue = tag as "Feature Request" | "Bug" | "Issue" | "General";
    const currentTags = watchedTags || [];
    const newTags = currentTags.includes(tagValue)
      ? currentTags.filter(t => t !== tagValue)
      : [...currentTags, tagValue];
    setValue('tags', newTags, { shouldValidate: true });
  };

  const onFormSubmit = async (data: FeedbackFormData) => {
    if (!user || loading) return;

    setLoading(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          tags: data.tags && data.tags.length > 0 ? data.tags : ['General'],
          authorId: user.id,
        }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        showSuccess(ToastMessages.FEEDBACK_SUBMITTED, ToastMessages.FEEDBACK_SUBMITTED_DESC);
        reset(); // Reset form using React Hook Form
        onSubmit?.(); // Call parent callback to refresh list
      } else {
        showError(ToastMessages.FEEDBACK_ERROR, responseData.error || ToastMessages.FEEDBACK_ERROR_DESC);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showError(ToastMessages.NETWORK_ERROR, ToastMessages.NETWORK_ERROR_DESC);
    } finally {
      setLoading(false);
    }
  };

  // If no user is logged in, show login prompt
  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Sign In Required</CardTitle>
          <CardDescription className="text-sm">
            You need to sign in to submit feedback and participate in the community.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 py-6 sm:py-8 px-4 sm:px-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <p className="text-center text-muted-foreground text-sm">
            Please use the "Sign In" button in the header to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Share Your Feedback</CardTitle>
        <CardDescription className="text-sm">
          Help us improve by sharing your thoughts, reporting bugs, or requesting new features.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 sm:space-y-6">
          <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            Signed in as: <span className="font-medium">{user.username}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm">Feedback Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Brief description of your feedback..."
              className={`w-full h-11 ${errors.title ? 'border-red-500' : ''}`}
              disabled={loading}
            />
            {errors.title && (
              <div className="flex items-center space-x-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.title.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Provide more details about your feedback..."
              className={`min-h-[100px] w-full resize-y ${errors.description ? 'border-red-500' : ''}`}
              disabled={loading}
            />
            {errors.description && (
              <div className="flex items-center space-x-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.description.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Category (optional)</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {FEEDBACK_TAGS.map((tag: string) => (
                <Badge
                  key={tag}
                  variant={watchedTags.includes(tag as any) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs sm:text-sm px-2 sm:px-3 py-1 touch-target"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {watchedTags.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No category selected - will default to "General"
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 text-sm" 
            size="lg" 
            disabled={loading || !isValid}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 