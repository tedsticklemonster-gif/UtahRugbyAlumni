const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alumni.utah-rugby.com";

export interface TelegramButton {
  text: string;
  url: string;
}

/**
 * Post a message to the Utah Rugby Alumni Telegram channel.
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars.
 * Failures are logged but never throw — feed posting should not break if Telegram is down.
 *
 * Links are sent as inline keyboard buttons (not HTML anchors) — this is the
 * most reliable way to get clickable links in Telegram channels regardless of
 * channel permissions or parse_mode quirks.
 *
 * An "Open App" button linking to the homepage is always appended automatically.
 */
export async function postToTelegram(
  text: string,
  buttons: TelegramButton[] = []
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return; // silently skip if not configured

  // Always append the permanent app link as the last button
  const allButtons: TelegramButton[] = [
    ...buttons,
    { text: "Open App", url: APP_URL },
  ];

  // Build a single row of buttons (Telegram supports multiple buttons in a row)
  const inlineKeyboard = [allButtons.map((b) => ({ text: b.text, url: b.url }))];

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          link_preview_options: { is_disabled: true },
          reply_markup: { inline_keyboard: inlineKeyboard },
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("[telegram] sendMessage failed:", res.status, body);
    }
  } catch (err) {
    console.error("[telegram] sendMessage error:", err);
  }
}
