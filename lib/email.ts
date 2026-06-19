export async function sendEmail({ to, subject, body }: { to: string, subject: string, body: string }) {
  // In a real application, this would integrate with Resend, SendGrid, Amazon SES, etc.
  // Because it's a server-side module, credentials stay secure.
  console.log(`[EMAIL DISPATCHED] To: ${to} | Subject: ${subject}`)
  console.log(`Body: ${body}`)
  return { success: true }
}
