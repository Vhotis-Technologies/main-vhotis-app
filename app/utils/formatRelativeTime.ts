/**
 * Human-readable relative time (e.g. "2 hours ago", "a day ago", "a week ago").
 */
export function formatRelativeTime(
  input: Date | string | undefined | null
): string {
  if (!input) return "";

  const then = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(then.getTime())) return "";

  const diffMs = Date.now() - then.getTime();
  if (diffMs < 0) return "Just now";

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) {
    return diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return diffDays === 1 ? "a day ago" : `${diffDays} days ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) {
    return diffWeeks === 1 ? "a week ago" : `${diffWeeks} weeks ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return diffMonths === 1 ? "a month ago" : `${diffMonths} months ago`;
  }

  return then.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
