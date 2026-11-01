import { isAdmin, cookieHeader } from "./_shared.mjs";

const response = (status, data, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });

export default async function handler(event) {
  try {
    if (event.httpMethod === "DELETE") {
      return response(
        200,
        { ok: true },
        { "Set-Cookie": cookieHeader("", 0) }
      );
    }

    if (event.httpMethod !== "POST") {
      return response(405, { error: "Method not allowed" }, {
        Allow: "POST, DELETE",
      });
    }

    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return response(400, { error: "Invalid JSON body" });
    }

    const password = body?.password;

    if (!process.env.ADMIN_PASSWORD) {
      return response(500, { error: "ADMIN_PASSWORD is not configured" });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return response(401, { error: "Invalid password" });
    }

    return response(
      200,
      { ok: true },
      { "Set-Cookie": cookieHeader(true) }
    );
  } catch (error) {
    console.error("admin-auth function error:", error);
    return response(500, { error: "Internal server error" });
  }
}
