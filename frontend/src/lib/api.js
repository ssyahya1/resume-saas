const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

export const getApiUrl = () => API_URL;

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : {};
  }

  if (!response.ok) {
    const message = response.status >= 500
      ? "The service is temporarily unavailable. Please try again."
      : data.message || "Something went wrong";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
};

const api = async (endpoint, options = {}) => {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Unable to reach the service. Check your connection and try again.");
  }

  return parseResponse(response);
};

export const uploadFile = (endpoint, formData) =>
  api(endpoint, {
    method: "POST",
    body: formData,
  });

export default api;