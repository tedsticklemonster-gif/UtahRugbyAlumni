const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alumni.utah-rugby.com";

/**
 * Post a message to the Utah Rugby Alumni Telegram channel.
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars.
 * Failures are logged but never throw.
 *
 * Links are passed as plain-text URLs which Telegram auto-detects and renders
 * as clickable hyperlinks — no parse_mode tricks, no inline keyboard buttons,
 * no special bot permissions needed.
 *
 * @param text     Message body (may include HTML bold/italic via parse_mode HTML)
 * @param actionUrl  Primary action URL (e.g. post or event link). Shown as a
 *                   clickable line at the bottom, auto-hyperlinked by Telegram.
 */
export async function postToTelegram(
  text: string,
  actionUrl?: string
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  // Build the full message: body + action URL (if any) + permanent app link
  const parts = [text];
  if (actionUrl) parts.push(actionUrl);
  parts.push(APP_URL);
  const fullText = parts.join("\n\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: fullText,
          parse_mode: "HTML",
          disable_web_page_preview: true,
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
