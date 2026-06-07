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

  // Put externalId first — it's the most reliable key Judge.me uses.
  let url =
    `${JUDGEME_BASE}/reviews?api_token=${encodeURIComponent(apiToken)}` +
    `&shop_domain=${encodeURIComponent(shopDomain)}` +
    `&page=${page}&per_page=${perPage}`;
  if (externalId) url += `&product_external_id=${encodeURIComponent(externalId)}`;
  url += `&handle=${encodeURIComponent(handle)}`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return emptyResponse(page, perPage);
    const data = (await res.json()) as JudgemeReviewsResponse;

    // Without externalId, Judge.me may return shop-wide reviews when the
    // product is not indexed (total_count will be absent). Discard those.
    // When externalId IS provided the response is always product-specific.
    if (!externalId && (data.total_count === undefined || data.total_count === null)) {
      return emptyResponse(page, perPage);
    }

    // Normalise: if total_count is still null/undefined, fall back to the
    // length of the reviews array so the UI never silently hides real reviews.
    if (data.total_count == null) {
      data.total_count = data.reviews?.length ?? 0;
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

export async function fetchJudgemeStoreReviews(
  shopDomain: string,
  apiToken: string | undefined,
  page = 1,
  perPage = 10,
): Promise<JudgemeReviewsResponse> {
  if (!apiToken) return emptyResponse(page, perPage);
  const url =
    `${JUDGEME_BASE}/reviews?api_token=${encodeURIComponent(apiToken)}` +
    `&shop_domain=${encodeURIComponent(shopDomain)}` +
    `&page=${page}&per_page=${perPage}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return emptyResponse(page, perPage);
    const data = (await res.json()) as JudgemeReviewsResponse;
    return data;
  } catch {
    return emptyResponse(page, perPage);
  }
}

export async function fetchJudgemeShopStats(
  shopDomain: string,
  apiToken: string | undefined,
): Promise<{ average: number; count: number }> {
  if (!apiToken) return { average: 0, count: 0 };
  const url =
    `${JUDGEME_BASE}/shops/judgeme_widgets?api_token=${encodeURIComponent(apiToken)}` +
    `&shop_domain=${encodeURIComponent(shopDomain)}&_type=site_reviews&per_page=0`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return { average: 0, count: 0 };
    const data = (await res.json()) as any;
    return {
      average: data?.rating ?? data?.average ?? 0,
      count: data?.total_count ?? data?.count ?? 0,
    };
  } catch {
    return { average: 0, count: 0 };
  }
}

function emptyResponse(page: number, perPage: number): JudgemeReviewsResponse {
  return { reviews: [], current_page: page, per_page: perPage, total_count: undefined };
}

function emptySummary(): JudgemeRatingSummary {
  return { average: 0, count: 0, histogram: [0, 0, 0, 0, 0] };
}
