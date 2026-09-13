import { requirePermission } from "@/lib/permissions";
import { sendEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { testEmailSchema } from "@/lib/validation/settings";
import { ApiError, withApiErrors } from "@/lib/api-response";

export async function POST(req: Request) {
  return withApiErrors(async () => {
    const actingUserId = await requirePermission("settings", "edit");
    const body = testEmailSchema.parse(await req.json());

    try {
      await sendEmail({
        from: body.senderEmail,
        to: body.recipientEmails,
        subject: "Test email from Report Manager",
        html: "<p>This is a test email confirming your notification email settings are working correctly.</p>",
      });
    } catch (err) {
      throw new ApiError(502, "EMAIL_SEND_FAILED", err instanceof Error ? err.message : "Could not send test email.");
    }

    await logAudit(actingUserId, "settings.test_email_sent", `Sent test email to ${body.recipientEmails.join(", ")}`);
    return { success: true };
  });
}
