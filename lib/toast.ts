import { toast } from 'sonner'

// Toast utilities for consistent messaging across the app

export const showSuccess = (message: string, description?: string) => {
  return toast.success(message, {
    description,
    duration: 4000,
  })
}

export const showError = (message: string, description?: string) => {
  return toast.error(message, {
    description,
    duration: 6000, // Longer duration for errors
  })
}

export const showInfo = (message: string, description?: string) => {
  return toast.info(message, {
    description,
    duration: 4000,
  })
}

export const showWarning = (message: string, description?: string) => {
  return toast.warning(message, {
    description,
    duration: 5000,
  })
}

export const showLoading = (message: string) => {
  return toast.loading(message)
}

// Predefined messages for common actions
export const ToastMessages = {
  // Feedback messages
  FEEDBACK_SUBMITTED: "Feedback submitted!",
  FEEDBACK_SUBMITTED_DESC: "Thank you for your feedback. It has been added to the community discussion.",
  FEEDBACK_ERROR: "Failed to submit feedback",
  FEEDBACK_ERROR_DESC: "Please try again or check your connection.",
  
  // Response messages
  RESPONSE_SUBMITTED: "Response posted!",
  RESPONSE_SUBMITTED_DESC: "Your response has been added to the discussion.",
  RESPONSE_ERROR: "Failed to post response",
  RESPONSE_ERROR_DESC: "Please try again or check your connection.",
  
  // Voting messages
  VOTE_ADDED: "Upvote added!",
  VOTE_REMOVED: "Upvote removed",
  VOTE_ERROR: "Failed to update vote",
  VOTE_ERROR_DESC: "Please try again or check your connection.",
  
  // Admin messages
  STATUS_UPDATED: "Status updated!",
  STATUS_UPDATED_DESC: "Feedback status has been successfully changed.",
  STATUS_ERROR: "Failed to update status",
  STATUS_ERROR_DESC: "Please try again or check your permissions.",
  
  // Connection messages
  WALLET_REQUIRED: "Wallet connection required",
  WALLET_REQUIRED_DESC: "Please connect your wallet to perform this action.",
  
  // General messages
  LOADING: "Processing...",
  NETWORK_ERROR: "Network error",
  NETWORK_ERROR_DESC: "Please check your internet connection and try again.",
  PERMISSION_ERROR: "Permission denied",
  PERMISSION_ERROR_DESC: "You don't have permission to perform this action.",
} as const 