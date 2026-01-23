/**
 * Utility functions for handling online/offline status
 */

export interface PresenceInfo {
  isOnline: boolean;
  lastSeen: string;
}

export function formatLastSeen(lastSeen: string): string {
  if (!lastSeen) return 'Never';
  
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInSeconds = Math.floor((now.getTime() - lastSeenDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

export function getOnlineStatusText(isOnline: boolean, lastSeen: string): string {
  if (isOnline) {
    return 'Online';
  }
  return `Last seen ${formatLastSeen(lastSeen)}`;
}

export function getOnlineStatusColor(isOnline: boolean): string {
  return isOnline ? 'text-green-500' : 'text-muted-foreground';
}

export function getOnlineStatusBgColor(isOnline: boolean): string {
  return isOnline ? 'bg-green-500' : 'bg-gray-400';
}
