interface SendEmailInput {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

/** Sends an email via the Resend API. Throws with Resend's own error message on failure. */
export async function sendEmail({ from, to, subject, html }: SendEmailInput): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email sending is not configured on this server (RESEND_API_KEY is not set).");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (body && (body.message as string | undefined)) || `Email provider returned ${res.status}.`;
    throw new Error(message);
  }
  return body as { id: string };
}
