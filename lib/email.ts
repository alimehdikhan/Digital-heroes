import { Resend } from 'resend';

// Only initialize if API key is present
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// The "from" email address must be verified in Resend.
// For testing without domain verification, you'll need to use 'onboarding@resend.dev' 
// and send ONLY to the email address registered with your Resend account.
const defaultFrom = process.env.RESEND_FROM_EMAIL || 'Digital Heroes <onboarding@resend.dev>';

export async function sendEmail({ 
  to, 
  subject, 
  body, 
  html 
}: { 
  to: string; 
  subject: string; 
  body: string;
  html?: string; 
}) {
  try {
    if (!resend) {
      // Fallback for development if no Resend key is provided
      console.log('=====================================================')
      console.log(`[EMAIL DISPATCHED - DEV MODE]`)
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`Body (Text): ${body}`)
      console.log('=====================================================')
      return { success: true, devMode: true }
    }

    const { data, error } = await resend.emails.send({
      from: defaultFrom,
      to: [to],
      subject: subject,
      text: body,
      html: html || `<div style="font-family: sans-serif; color: #111;">${body.replace(/\n/g, '<br/>')}</div>`,
    });

    if (error) {
      console.error('[EMAIL ERROR]', error);
      return { error: error.message }
    }

    return { success: true, data }
  } catch (err: any) {
    console.error('[EMAIL ERROR]', err);
    return { error: err.message || 'Failed to send email' }
  }
}

/**
 * Basic HTML email template wrapper
 */
export function buildEmailTemplate(title: string, contentHtml: string, ctaLink?: string, ctaText?: string) {
  const ctaButton = ctaLink && ctaText ? `
    <div style="margin-top: 30px; margin-bottom: 30px; text-align: center;">
      <a href="${ctaLink}" style="background-color: #34d399; color: #020617; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
        ${ctaText}
      </a>
    </div>
  ` : '';

  return `
    <div style="background-color: #020617; padding: 40px 20px; font-family: 'Inter', -apple-system, sans-serif; color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid rgba(52, 211, 153, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(52, 211, 153, 0.1);">
        
        <div style="padding: 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <h2 style="color: #34d399; margin: 0; font-size: 24px; font-style: italic; letter-spacing: -0.5px;">Digital Heroes</h2>
        </div>

        <div style="padding: 40px 30px;">
          <h1 style="margin-top: 0; color: #ffffff; font-size: 28px;">${title}</h1>
          <div style="color: rgba(255,255,255,0.8); line-height: 1.6; font-size: 16px;">
            ${contentHtml}
          </div>
          ${ctaButton}
        </div>

        <div style="padding: 20px 30px; text-align: center; background-color: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05);">
          <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Digital Heroes. You are receiving this because you're part of the mission.
          </p>
        </div>
      </div>
    </div>
  `;
}
