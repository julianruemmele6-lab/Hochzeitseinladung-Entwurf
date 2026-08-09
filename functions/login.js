async function createToken(password, secret) {
  const data = new TextEncoder().encode(
    `${password}:${secret}`
  );

  const digest = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}


export async function onRequestPost(context) {
  const formData = await context.request.formData();

  const password =
    String(formData.get("password") || "");

  const expectedPassword =
    context.env.ACCESS_PASSWORD;

  if (
    !expectedPassword ||
    password !== expectedPassword
  ) {
    return Response.redirect(
      new URL("/?error=1", context.request.url),
      303
    );
  }

  const token = await createToken(
    expectedPassword,
    context.env.SESSION_SECRET
  );

  return new Response(null, {
    status: 303,

    headers: {
      "Location": "/",

      "Set-Cookie":
        `wedding_access=${token}; ` +
        `Path=/; ` +
        `HttpOnly; ` +
        `Secure; ` +
        `SameSite=Lax; ` +
        `Max-Age=2592000`
    }
  });
}
