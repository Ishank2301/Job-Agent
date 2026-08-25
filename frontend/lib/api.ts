export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export function withQuery(path: string, params?: QueryParams): string {
  if (!params) return path;

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  if (!queryString) return path;

  return `${path}?${queryString}`;
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = response.statusText;
    
    try {
      // FIX: Read as text FIRST. A Response body can only be consumed once.
      const text = await response.text(); 
      
      try {
        // Attempt to parse the text as JSON
        const json = JSON.parse(text);
        detail = json.detail ?? json.message ?? JSON.stringify(json);
      } catch {
        // If it's not valid JSON (e.g. HTML error page or plain text), use the raw text
        detail = text;
      }
    } catch (e) {
      detail = "Failed to read error response";
    }

    throw new ApiError(response.status, detail);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  // Safe to parse as JSON here since we haven't touched the body yet on success
  const text = await response.text();
  if (!text) return undefined as T;
  
  return JSON.parse(text) as T;
}

export const endpoints = {
  health: "/health",
  jobs: "/jobs",
  scrapeJobs: "/jobs/scrape",
  applications: "/applications",
  applicationStatus: (id: string) => `/applications/${id}/status`,
  runAgent: (id: string) => `/applications/${id}/run-agent`,
  recruiters: "/recruiters",
  findRecruiter: "/recruiters/find",
  tailorResume: "/resumes/tailor",
  atsCheck: "/ats/check",
  emailDraft: "/emails/draft",
  approveEmail: (id: string) => `/emails/${id}/approve`,
  sendEmail: (id: string) => `/emails/${id}/send`,
  settings: "/settings",
  autofillSessions: "/autofill/sessions",
  autofillConfirmation: (id: string) => `/autofill/confirmations/${id}`,
  approveAutofill: (id: string) => `/autofill/confirmations/${id}/approve`,
} as const;