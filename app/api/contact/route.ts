import { NextRequest, NextResponse } from 'next/server';

interface ContactRequestBody {
  name?: string;
  email?: string;
  phone?: string;
  inquiryType?: string;
  message?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ContactRequestBody = await req.json();
    const { name, email, phone, inquiryType, message } = body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const ticketId = `EV-${Math.floor(100000 + Math.random() * 900000)}`;
    const category = inquiryType?.trim() || 'General Support';
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone?.trim() || 'Not provided';
    const cleanMessage = message.trim();
    const submissionTime = new Date().toLocaleString('en-US', {
      timeZone: 'Africa/Kigali',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    // Destination address and tagged subject line as required
    const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL || 'contact@mpeka.rw';
    const emailSubject = `[EVchargers] ${category} from ${cleanName} (${ticketId})`;

    // Plain text content
    const textContent = `
[EVchargers Kigali - Contact Form Inquiry]
--------------------------------------------------
Ticket ID:        ${ticketId}
Submitted At:     ${submissionTime} (Kigali Time)
Origin Platform:  EVchargers Kigali (mpeka.rw)

--- SENDER INFORMATION ---
Name:             ${cleanName}
Email:            ${cleanEmail}
Phone:            ${cleanPhone}
Inquiry Category: ${category}

--- MESSAGE ---
${cleanMessage}

--------------------------------------------------
NOTE FOR SUPPORT TEAM:
This message was submitted from the EVchargers contact form.
To respond directly to ${cleanName}, simply hit 'Reply' in your email client.
`.trim();

    // Responsive HTML email content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${emailSubject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <!-- Header -->
    <tr>
      <td style="background-color: #0f172a; padding: 28px 32px; border-bottom: 3px solid #10b981;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <span style="display: inline-block; background-color: #10b981; color: #042f2e; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                EVchargers Kigali
              </span>
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 6px 0 0 0; line-height: 1.3;">
                New Support Inquiry [EVchargers]
              </h1>
            </td>
            <td align="right" valign="top">
              <span style="display: inline-block; background-color: #1e293b; color: #94a3b8; font-family: monospace; font-size: 12px; font-weight: 700; padding: 6px 10px; border-radius: 8px; border: 1px solid #334155;">
                ${ticketId}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px;">
        <!-- Meta block -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
          <tr>
            <td style="padding: 16px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="6">
                <tr>
                  <td width="130" style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">From:</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 600;">${cleanName}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Reply-To Email:</td>
                  <td style="font-size: 14px;"><a href="mailto:${cleanEmail}" style="color: #059669; text-decoration: none; font-weight: 600;">${cleanEmail}</a></td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Phone:</td>
                  <td style="color: #0f172a; font-size: 14px;">${cleanPhone}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Category:</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 600;">${category}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Submitted:</td>
                  <td style="color: #64748b; font-size: 12px;">${submissionTime}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Message Box -->
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin: 0 0 10px 0;">
            Customer Message:
          </h2>
          <div style="background-color: #ffffff; border-left: 4px solid #10b981; border: 1px solid #cbd5e1; border-left-width: 4px; padding: 18px 20px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">
${cleanMessage}
          </div>
        </div>

        <!-- Quick Reply Action -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <tr>
            <td>
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                <strong>Support Team Note:</strong> This inquiry was submitted through the public EVchargers portal. Hitting <em>Reply</em> in your mail app will email <a href="mailto:${cleanEmail}" style="color: #059669;">${cleanEmail}</a> directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f1f5f9; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #64748b;">
          EVchargers Kigali Platform Notification • Delivered to ${recipientEmail} • Tag: [EVchargers]
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

    let deliveryStatus = 'simulated';
    let deliveryProvider: string | null = null;
    let deliveryError: string | null = null;

    // 1. Try Resend HTTP API (if RESEND_API_KEY is configured)
    if (process.env.RESEND_API_KEY) {
      try {
        const fromAddress =
          process.env.CONTACT_FROM_EMAIL || 'EVchargers Kigali <onboarding@resend.dev>';
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [recipientEmail],
            reply_to: cleanEmail,
            subject: emailSubject,
            html: htmlContent,
            text: textContent,
          }),
        });

        if (resendRes.ok) {
          deliveryStatus = 'sent';
          deliveryProvider = 'Resend';
        } else {
          const resendErr = await resendRes.text();
          console.warn('[EVchargers] Resend API error response:', resendErr);
          deliveryError = 'Resend delivery failed';
        }
      } catch (err) {
        console.warn('[EVchargers] Resend delivery network error:', err);
        deliveryError = 'Resend connection error';
      }
    }

    // 2. Try Brevo HTTP API (if BREVO_API_KEY is configured and not yet sent)
    if (deliveryStatus !== 'sent' && process.env.BREVO_API_KEY) {
      try {
        const brevoSenderEmail = process.env.CONTACT_FROM_EMAIL || 'notifications@mpeka.rw';
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'EVchargers Kigali', email: brevoSenderEmail },
            to: [{ email: recipientEmail, name: 'Mpeka Support Team' }],
            replyTo: { email: cleanEmail, name: cleanName },
            subject: emailSubject,
            htmlContent,
            textContent,
          }),
        });

        if (brevoRes.ok) {
          deliveryStatus = 'sent';
          deliveryProvider = 'Brevo';
          deliveryError = null;
        } else {
          const brevoErr = await brevoRes.text();
          console.warn('[EVchargers] Brevo API error response:', brevoErr);
          deliveryError = 'Brevo delivery failed';
        }
      } catch (err) {
        console.warn('[EVchargers] Brevo delivery network error:', err);
        deliveryError = 'Brevo connection error';
      }
    }

    // 3. Try custom Webhook URL (if CONTACT_WEBHOOK_URL is configured and not yet sent)
    if (deliveryStatus !== 'sent' && process.env.CONTACT_WEBHOOK_URL) {
      try {
        const hookRes = await fetch(process.env.CONTACT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tag: 'EVchargers',
            ticketId,
            recipient: recipientEmail,
            subject: emailSubject,
            sender: {
              name: cleanName,
              email: cleanEmail,
              phone: cleanPhone,
            },
            inquiryType: category,
            message: cleanMessage,
            submittedAt: submissionTime,
          }),
        });

        if (hookRes.ok) {
          deliveryStatus = 'sent';
          deliveryProvider = 'Webhook';
          deliveryError = null;
        }
      } catch (err) {
        console.warn('[EVchargers] Webhook dispatch error:', err);
      }
    }

    // Always log to server stdout with EVchargers tag for immediate traceability
    console.log(
      `[EVchargers Contact Form] Status: ${deliveryStatus} | Provider: ${
        deliveryProvider || 'None'
      } | Recipient: ${recipientEmail} | Subject: "${emailSubject}" | Ticket: ${ticketId}`
    );

    return NextResponse.json({
      success: true,
      ticketId,
      delivered: deliveryStatus === 'sent',
      provider: deliveryProvider,
      recipient: recipientEmail,
      label: 'EVchargers',
      subject: emailSubject,
      message: `Your message has been sent to ${recipientEmail} with reference ticket ${ticketId}. Our Kigali support team will follow up shortly.`,
      receivedData: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        inquiryType: category,
        recipientEmail,
        submittedAt: new Date().toISOString(),
      },
      warning: deliveryError,
    });
  } catch (error) {
    console.error('[EVchargers Contact Form Error]:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while processing your message.' },
      { status: 500 }
    );
  }
}

