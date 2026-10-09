import assert from "node:assert/strict";
import test from "node:test";
import api from "./api.js";

test("bodyless requests omit the JSON content type", async (t) => {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (_url, requestOptions) => {
    requests.push(requestOptions);
    return new Response("{}", {
      headers: { "content-type": "application/json" },
    });
  });

  await api("/api/resource");
  await api("/api/resource", { body: null });

  assert.equal(requests[0].headers["Content-Type"], undefined);
  assert.equal(requests[1].headers["Content-Type"], undefined);
});

test("JSON body requests keep the JSON content type", async (t) => {
  let options;
  t.mock.method(globalThis, "fetch", async (_url, requestOptions) => {
    options = requestOptions;
    return new Response("{}", {
      headers: { "content-type": "application/json" },
    });
  });

  await api("/api/resource", {
    method: "POST",
    body: JSON.stringify({ value: true }),
  });

  assert.equal(options.headers["Content-Type"], "application/json");
});
