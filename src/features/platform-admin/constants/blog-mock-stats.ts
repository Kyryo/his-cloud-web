/**
 * TODO(blog-analytics): every number in this file is DUMMY data for the Blog admin UI.
 * The platform API does not expose blog analytics yet (views, visitors, read time,
 * shares, comments). Replace these helpers with real API data once it exists, and
 * delete this file. Nothing here is persisted or sent anywhere.
 */

export const BLOG_MOCK_DATA_NOTICE = "Sample numbers. Analytics are not connected yet.";

export type BlogOverviewMockStats = {
  viewsLast30Days: number;
  viewsChangePercent: number;
  uniqueVisitorsLast30Days: number;
  avgReadTimeMinutes: number;
};

/** TODO(blog-analytics): dummy blog-wide totals for the overview page. */
export const BLOG_OVERVIEW_MOCK_STATS: BlogOverviewMockStats = {
  viewsLast30Days: 18_420,
  viewsChangePercent: 12.4,
  uniqueVisitorsLast30Days: 11_380,
  avgReadTimeMinutes: 4.6,
};

export type BlogPostMockStats = {
  views: number;
  uniqueVisitors: number;
  avgReadTimeMinutes: number;
  shares: number;
  comments: number;
  viewsChangePercent: number;
  dailyViews: Array<{ date: string; views: number }>;
};

/** Stable pseudo-random number so a post always shows the same dummy figures. */
function seededNumber(seed: string, salt: number): number {
  let hash = 2166136261 ^ salt;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

const TREND_DAYS = 30;

/** TODO(blog-analytics): dummy per-post stats derived from the post id. */
export function getBlogPostMockStats(postId: string, referenceDate = new Date()): BlogPostMockStats {
  const views = Math.round(400 + seededNumber(postId, 1) * 9_600);
  const dailyViews = Array.from({ length: TREND_DAYS }, (_, index) => {
    const day = new Date(referenceDate);
    day.setDate(day.getDate() - (TREND_DAYS - 1 - index));
    const base = views / TREND_DAYS;
    const wave = 0.6 + seededNumber(postId, 100 + index) * 0.8;
    return { date: day.toISOString().slice(0, 10), views: Math.round(base * wave) };
  });
  return {
    views,
    uniqueVisitors: Math.round(views * (0.55 + seededNumber(postId, 2) * 0.25)),
    avgReadTimeMinutes: Math.round((2 + seededNumber(postId, 3) * 6) * 10) / 10,
    shares: Math.round(views * (0.01 + seededNumber(postId, 4) * 0.03)),
    comments: Math.round(seededNumber(postId, 5) * 40),
    viewsChangePercent: Math.round((seededNumber(postId, 6) * 40 - 12) * 10) / 10,
    dailyViews,
  };
}

/** TODO(blog-analytics): dummy view count for the posts table. */
export function getBlogPostMockViews(postId: string): number {
  return getBlogPostMockStats(postId).views;
}
