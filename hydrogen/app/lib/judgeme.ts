const JUDGEME_BASE = "https://judge.me/api/v1";

export interface JudgemeReviewer {
  name: string;
}

export interface JudgemeReview {
  id: number;
  title: string;
  body: string;
  rating: number;
  reviewer: JudgemeReviewer;
  created_at: string;
  verified: "verified_buyer" | "unverified" | string;
  pictures: { urls: { original: string; small: string } }[];
}

export interface JudgemeReviewsResponse {
  reviews: JudgemeReview[];
  current_page: number;
  per_page: number;
  total_count?: number;
  rating?: number;
}

export interface JudgemeRatingSummary {
  average: number;
  count: number;
  /** Distribution: index 0 = 1-star count … index 4 = 5-star count */
  histogram: [number, number, number, number, number];
}

export async function fetchJudgemeReviews(
  handle: string,
  shopDomain: string,
  apiToken: string | undefined,
  page = 1,
  perPage = 10,
  externalId?: string,
): Promise<JudgemeReviewsResponse> {
  if (!apiToken) return emptyResponse(page, perPage);
  let url =
    `${JUDGEME_BASE}/reviews?api_token=${encodeURIComponent(apiToken)}` +
    `&shop_domain=${encodeURIComponent(shopDomain)}` +
    `&handle=${encodeURIComponent(handle)}` +
    `&page=${page}&per_page=${perPage}`;
  if (externalId) {
    url += `&product_external_id=${encodeURIComponent(externalId)}`;
  }
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return emptyResponse(page, perPage);
    const data = (await res.json()) as JudgemeReviewsResponse;
    // JudgMe omits total_count when the product isn't indexed — that means the
    // returned reviews are shop-wide, not product-specific. Discard them.
    if (data.total_count === undefined || data.total_count === null) {
      return emptyResponse(page, perPage);
    }
    return data;
  } catch {
    return emptyResponse(page, perPage);
  }
}

export async function fetchJudgemeRating(
  shopifyProductGid: string,
  shopDomain: string,
  apiToken: string | undefined,
): Promise<JudgemeRatingSummary> {
  if (!apiToken) return emptySummary();
  // Judge.me uses the numeric Shopify product ID as external_id
  const externalId = shopifyProductGid.split("/").pop() ?? "";
  const url =
    `${JUDGEME_BASE}/products/${externalId}` +
    `?api_token=${apiToken}&shop_domain=${shopDomain}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return emptySummary();
    const data = (await res.json()) as {
      product?: { average_rating?: number; reviews_count?: number };
    };
    return {
      average: data.product?.average_rating ?? 0,
      count: data.product?.reviews_count ?? 0,
      histogram: [0, 0, 0, 0, 0],
    };
  } catch {
    return emptySummary();
  }
}

/**
 * Build a JudgemeRatingSummary from a reviews API response.
 * Uses the `rating` field from the response for the average (most accurate),
 * and computes the histogram from the loaded reviews.
 */
export function buildRatingSummary(
  data: JudgemeReviewsResponse
): JudgemeRatingSummary {
  const histogram: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  let ratingSum = 0;
  for (const r of data.reviews) {
    ratingSum += r.rating;
    const idx = Math.min(Math.max(Math.round(r.rating) - 1, 0), 4);
    histogram[idx]++;
  }
  const computedAvg =
    data.reviews.length > 0 ? ratingSum / data.reviews.length : 0;
  const average = data.rating != null && data.rating > 0 ? data.rating : computedAvg;
  return { average, count: data.total_count ?? 0, histogram };
}

function emptyResponse(page: number, perPage: number): JudgemeReviewsResponse {
  return { reviews: [], current_page: page, per_page: perPage, total_count: undefined };
}

function emptySummary(): JudgemeRatingSummary {
  return { average: 0, count: 0, histogram: [0, 0, 0, 0, 0] };
}
