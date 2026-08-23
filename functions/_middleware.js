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


function getCookie(request, name) {
  const cookieHeader =
    request.headers.get("Cookie") || "";

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");

    if (key === name) {
      return value.join("=");
    }
  }

  return null;
}


function loginPage(showError = false) {
  return new Response(
    `<!DOCTYPE html>
<html lang="de">

<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>Teresa & Julian</title>

  <style>

    :root {
      --cream: #f7f3ec;
      --olive: #697457;
      --olive-dark: #4d5941;
      --lavender: #aaa0bc;
      --text: #3e4039;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;

      min-height: 100vh;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 24px;

      background: var(--cream);
      color: var(--text);

      font-family: Georgia, "Times New Roman", serif;
    }

    .login {
      width: 100%;
      max-width: 520px;

      text-align: center;
    }

    .eyebrow {
      margin-bottom: 25px;

      color: var(--olive);

      font-family: Arial, Helvetica, sans-serif;
      font-size: 0.72rem;

      letter-spacing: 0.22em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0 0 18px;

      color: var(--olive-dark);

      font-size: clamp(3rem, 12vw, 5rem);
      font-weight: 400;
      line-height: 0.95;
    }

    .ampersand {
      color: var(--lavender);
      font-style: italic;
    }

    .intro {
      margin: 30px auto 40px;

      max-width: 420px;

      line-height: 1.7;
    }

    input {
      width: 100%;

      padding: 16px 18px;

      border: 1px solid #ded8e7;
      border-radius: 999px;

      background: rgba(255,255,255,0.55);

      font: inherit;

      outline: none;
    }

    input:focus {
      border-color: var(--lavender);
    }

    button {
      width: 100%;

      margin-top: 14px;
      padding: 16px 24px;

      border: 0;
      border-radius: 999px;

      background: var(--olive);
      color: white;

      font-family: Georgia, "Times New Roman", serif;
      font-size: 1rem;

      cursor: pointer;
    }

    button:hover {
      background: var(--olive-dark);
    }

    .error {
      margin-top: 18px;

      color: #8b4d4d;

      font-size: 0.95rem;
    }

  </style>
</head>

<body>

  <main class="login">

    <p class="eyebrow">Unsere Hochzeit</p>

    <h1>
      Teresa
      <span class="ampersand">&</span>
      Julian
    </h1>

    <p class="intro">
      Schön, dass du hier bist.
      Bitte gib den Zugangscode aus unserer Einladung ein.
    </p>

    <form method="POST" action="/login">

      <input
        type="password"
        name="password"
        placeholder="Zugangscode"
        aria-label="Zugangscode"
        required
        autofocus
      >

      <button type="submit">
        Einladung öffnen
      </button>

    </form>

    ${
      showError
        ? `<p class="error">
             Der Zugangscode ist leider nicht korrekt.
           </p>`
        : ""
    }

  </main>

</body>
</html>`,
    {
      status: 200,

      headers: {
        "Content-Type":
          "text/html; charset=UTF-8",

        "Cache-Control":
          "no-store"
      }
    }
  );
}


export async function onRequest(context) {
  
  const url = new URL(context.request.url);
  const protectionEnabled =
    context.env.PASSWORD_PROTECTION === "on";

  if (!protectionEnabled) {
    return context.next();
  }
  // Login-Anfrage darf durch
  if (url.pathname === "/login") {
    return context.next();
  }

  const password =
    context.env.ACCESS_PASSWORD;

  const secret =
    context.env.SESSION_SECRET;

  if (!password || !secret) {
    return new Response(
      "Zugangsschutz ist noch nicht konfiguriert.",
      { status: 500 }
    );
  }

  const expectedToken =
    await createToken(password, secret);

  const cookie =
    getCookie(
      context.request,
      "wedding_access"
    );

  if (cookie === expectedToken) {
    return context.next();
  }

  return loginPage(
    url.searchParams.get("error") === "1"
  );
}
