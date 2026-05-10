/**
 * Post a message to the Utah Rugby Alumni Telegram channel.
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars.
 * Failures are logged but never throw.
 *
 * Use HTML parse_mode — supports <b>, <i>, and <a href="URL">text</a>.
 * Escape user content with the esc() helper before embedding in the text.
 */
export async function postToTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

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
