export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    const name = data.name
      ?.trim()
      .replace(/\s+/g, " ");

    const attendance = data.attendance;
    const menu = data.menu || null;
    const food = data.food?.trim() || null;
    const message = data.message?.trim() || null;
    const song = data.song?.trim() || null;

    // Grundlegende Prüfung
    if (!name || !["yes", "no"].includes(attendance)) {
      return Response.json(
        {
          success: false,
          message: "Bitte Name und Zu- oder Absage angeben."
        },
        { status: 400 }
      );
    }

    // Bei Zusage muss ein Menü gewählt werden
    const allowedMenus = [
      "spaetzle-geschnetzeltes",
      "kartoffelgratin-steak"
    ];

    if (
      attendance === "yes" &&
      !allowedMenus.includes(menu)
    ) {
      return Response.json(
        {
          success: false,
          message: "Bitte wähle ein Menü aus."
        },
        { status: 400 }
      );
    }

    // Bei Absage wird kein Menü gespeichert
    const savedMenu =
      attendance === "yes" ? menu : null;

    // Prüfen, ob für diesen Namen bereits eine Antwort existiert
    const existing = await context.env.DB
      .prepare(
        "SELECT id FROM rsvp WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1"
      )
      .bind(name)
      .first();

    if (existing) {
      // Bestehende Antwort aktualisieren
      await context.env.DB
        .prepare(
          "UPDATE rsvp SET attendance = ?, menu = ?, food = ?, song = ?, message = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?"
        )
        .bind(
  attendance,
  savedMenu,
  attendance === "yes" ? food : null,
  attendance === "yes" ? song : null,
  message,
  existing.id
)
        .run();

    } else {
      // Neue Antwort speichern
      await context.env.DB
        .prepare(
          "INSERT INTO rsvp (name, attendance, menu, food, song, message) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(
  name,
  attendance,
  savedMenu,
  attendance === "yes" ? food : null,
  attendance === "yes" ? song : null,
  message
)
        .run();
    }

    return Response.json({
      success: true,
      message: "Vielen Dank für deine Rückmeldung!"
    });

  } catch (error) {
    console.error("RSVP error:", error);

    return Response.json(
      {
        success: false,
        message:
          "Die Rückmeldung konnte leider nicht gespeichert werden."
      },
      { status: 500 }
    );
  }
}
