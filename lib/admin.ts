// Admin utilities for FeedbackHub
// Defines admin emails and provides helper functions for admin functionality

export const ADMIN_EMAILS = [
  "admin@vibespec.com", // Primary Vibespec Team admin
  "evmlabsllc@gmail.com", // Add your admin email addresses here
] as const;

export const FEEDBACK_STATUSES = [
  "open",
  "planned", 
  "in-progress",
  "completed",
  "rejected"
] as const;

export type FeedbackStatus = typeof FEEDBACK_STATUSES[number];

export const STATUS_LABELS: Record<FeedbackStatus, string> = {
  "open": "Open",
  "planned": "Planned", 
  "in-progress": "In Progress",
  "completed": "Completed",
  "rejected": "Rejected"
};

export const STATUS_COLORS: Record<FeedbackStatus, string> = {
  "open": "bg-gray-100 text-gray-800 border-gray-200",
  "planned": "bg-blue-100 text-blue-800 border-blue-200", 
  "in-progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "completed": "bg-green-100 text-green-800 border-green-200",
  "rejected": "bg-red-100 text-red-800 border-red-200"
};

/**
 * Check if a user email is an admin
 */
export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase() as any);
}

/**
 * Get admin display name for a user email
 */
export function getAdminDisplayName(email: string): string | null {
  if (!isAdmin(email)) return null;
  return "Vibespec Team";
}

/**
 * Check if user can update feedback status
 */
export function canUpdateStatus(email: string | undefined): boolean {
  return isAdmin(email);
} 