export const isRetryableError = (error) => {
  const status = error?.status || error?.statusCode;

  if (status === 400 || status === 401 || status === 403 || status === 404) {
    return false;
  }

  const message = error?.message?.toLowerCase() || "";

  const permanentErrors = [
    "invalid",
    "not found",
    "unauthorized",
    "forbidden",
    "usage limit",
    "validation",
  ];

  if (
    permanentErrors.some((keyword) =>
      message.includes(keyword)
    )
  ) {
    return false;
  }

  const retryableErrors = [
    "timeout",
    "timed out",
    "rate limit",
    "too many requests",
    "service unavailable",
    "temporarily unavailable",
    "network",
    "econnreset",
    "503",
    "502",
    "504",
  ];

  if (
    retryableErrors.some((keyword) =>
      message.includes(keyword)
    )
  ) {
    return true;
  }

  return true;
};
