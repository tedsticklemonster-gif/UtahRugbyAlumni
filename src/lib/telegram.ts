const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alumni.utah-rugby.com";
const APP_FOOTER = `\n\n—\n<a href="${APP_URL}">Utah Rugby Alumni App</a>`;

/**
 * Post a message to the Utah Rugby Alumni Telegram channel.
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars.
 * Failures are logged but never throw — feed posting should not break if Telegram is down.
 *
 * Every message includes a permanent footer linking to the app.
 */
export async function postToTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return; // silently skip if not configured

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text + APP_FOOTER,
          parse_mode: "HTML",
          link_preview_options: { is_disabled: true },
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
