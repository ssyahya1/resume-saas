const SENSITIVE_FIELD = /password|token|authorization|cookie|secret|api[_-]?key|service[_-]?role/i;

const redactString = (value) =>
  value
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED]")
    .replace(/\beyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[REDACTED JWT]")
    .replace(/\bAIza[0-9A-Za-z_-]{20,}\b/g, "[REDACTED API KEY]")
    .replace(/\bsb_secret_[A-Za-z0-9_-]+\b/g, "[REDACTED SECRET KEY]")
    .replace(
      /\b(password|token|access[_-]?token|refresh[_-]?token|id[_-]?token|authorization|cookie|set-cookie|secret|api[_-]?key|service[_-]?role)\s*[:=]\s*("[^"]*"|'[^']*'|[^,\s;]+)/gi,
      "$1=[REDACTED]"
    );

const sanitizeLogValue = (value, key = "") => {
  if (SENSITIVE_FIELD.test(key)) {
    return "[REDACTED]";
  }

  if (typeof value === "string") {
    return redactString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        sanitizeLogValue(entryValue, entryKey),
      ])
    );
  }

  return value;
};

const formatMessage = (level, message, meta = {}) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level: sanitizeLogValue(level),
    message: sanitizeLogValue(message),
    ...sanitizeLogValue(meta),
  });
};

export const logger = {
  info(message, meta = {}) {
    console.log(formatMessage("info", message, meta));
  },

  warn(message, meta = {}) {
    console.warn(formatMessage("warn", message, meta));
  },

  error(message, meta = {}) {
    console.error(formatMessage("error", message, meta));
  },
};