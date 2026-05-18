export type ApiClientError = {
  status: number;
  detail: string;
};

export type ApiClientOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {}, signal } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  const init: RequestInit = {
    method,
    headers: finalHeaders,
    credentials: "include",
    cache: "no-store",
    signal,
  };

  if (body !== undefined && method !== "GET") {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(path, init);

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const errorBody = await res.json();
      if (errorBody?.detail) {
        detail = Array.isArray(errorBody.detail)
          ? errorBody.detail.map((d: { msg?: string }) => d?.msg ?? "").join("; ")
          : String(errorBody.detail);
      }
    } catch {
    }
    const err: ApiClientError = { status: res.status, detail };
    throw err;
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
}

export const apiGet = <T>(path: string, opts?: Omit<ApiClientOptions, "method" | "body">) =>
  apiClient<T>(path, { ...opts, method: "GET" });

export const apiPost = <T>(
  path: string,
  body?: unknown,
  opts?: Omit<ApiClientOptions, "method" | "body">,
) => apiClient<T>(path, { ...opts, method: "POST", body });

export const apiPut = <T>(
  path: string,
  body?: unknown,
  opts?: Omit<ApiClientOptions, "method" | "body">,
) => apiClient<T>(path, { ...opts, method: "PUT", body });

export const apiPatch = <T>(
  path: string,
  body?: unknown,
  opts?: Omit<ApiClientOptions, "method" | "body">,
) => apiClient<T>(path, { ...opts, method: "PATCH", body });

export const apiDelete = <T>(
  path: string,
  opts?: Omit<ApiClientOptions, "method" | "body">,
) => apiClient<T>(path, { ...opts, method: "DELETE" });

export function isApiClientError(value: unknown): value is ApiClientError {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "detail" in value
  );
}