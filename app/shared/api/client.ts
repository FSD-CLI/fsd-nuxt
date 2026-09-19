type ApiResponse<T> = { data: T };
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(
  method: Method,
  pathname: string,
  payload?: unknown,
): Promise<ApiResponse<T>> {
  const runtimeConfig = useRuntimeConfig();
  const data = await $fetch<T>(pathname, {
    baseURL: runtimeConfig.public.apiBase,
    method,
    body: payload as Record<string, unknown> | undefined,
  });

  return { data };
}

export const apiClient = {
  get: <T>(pathname: string) => request<T>("GET", pathname),
  post: <T>(pathname: string, payload?: unknown) =>
    request<T>("POST", pathname, payload),
  put: <T>(pathname: string, payload?: unknown) =>
    request<T>("PUT", pathname, payload),
  patch: <T>(pathname: string, payload?: unknown) =>
    request<T>("PATCH", pathname, payload),
  delete: <T>(pathname: string) => request<T>("DELETE", pathname),
};
