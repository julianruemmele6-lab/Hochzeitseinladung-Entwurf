export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    const name = data.name?.trim();
    const attendance = data.attendance;
    const menu = data.menu || null;
    const food = data.food?.trim() || null;
    const message = data.message?.trim() || null;

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

    // Bei Absage brauchen wir kein Menü
    const savedMenu =
      attendance === "yes" ? menu : null;

    await context.env.DB
      .prepare(
        `INSERT INTO rsvp
         (name, attendance, menu, food, message)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(
        name,
        attendance,
        savedMenu,
        attendance === "yes" ? food : null,
        message
      )
      .run();

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
