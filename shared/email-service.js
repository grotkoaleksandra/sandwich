import { supabase } from './supabase.js';

/**
 * Send an email via the send-email edge function
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML body
 * @param {string} [options.from] - Sender (default: Sandwich Popup <onboarding@resend.dev>)
 * @param {string} [options.replyTo] - Reply-to address
 */
export async function sendEmail({ to, subject, html, from, replyTo }) {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: { to, subject, html, from, reply_to: replyTo },
  });

  if (error) throw new Error(`Email failed: ${error.message}`);
  return data;
}

/**
 * Send a welcome email to a new mailing list subscriber
 */
export async function sendWelcomeEmail(email, firstName) {
  const name = firstName || 'friend';
  return sendEmail({
    to: email,
    subject: 'Welcome to Sandwich! 🥪',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4051;">Hey ${name}!</h1>
        <p>Thanks for joining the Sandwich crew. You'll be the first to know about our upcoming popups, new menu drops, and special events.</p>
        <p>Stay hungry,<br><strong>The Sandwich Team</strong></p>
      </div>
    `,
  });
}

/**
 * Send a notification when a new contact message is received
 */
export async function sendContactNotification({ name, email, message }) {
  return sendEmail({
    to: 'you@yourdomain.com', // Update with your actual email
    subject: `New message from ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Contact Message</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 3px solid #ffc71f; padding-left: 12px; color: #333;">${message}</blockquote>
      </div>
    `,
    replyTo: email,
  });
}
