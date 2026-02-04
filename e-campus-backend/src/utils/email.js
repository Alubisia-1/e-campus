const nodemailer = require('nodemailer');

/**
 * Create email transporter using Gmail SMTP
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetUrl - Password reset URL with token
 */
exports.sendPasswordResetEmail = async (email, resetUrl) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `E-Soko Marketplace <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - E-Soko',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Logo/Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #2563eb; font-size: 28px; margin: 0;">E-Soko</h1>
              <p style="color: #6b7280; margin-top: 8px;">Campus Marketplace</p>
            </div>

            <!-- Main Content -->
            <h2 style="color: #111827; font-size: 24px; margin-bottom: 16px; text-align: center;">
              Password Reset Request
            </h2>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              You requested to reset your password for your E-Soko account. Click the button below to create a new password:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}"
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>

            <!-- Warning -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Important:</strong> This link expires in 10 minutes for security reasons.
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>

            <!-- Divider -->
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

            <!-- Footer -->
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              E-Soko Campus Marketplace<br>
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Password Reset Request - E-Soko

You requested to reset your password for your E-Soko account.

Click this link to reset your password: ${resetUrl}

This link expires in 10 minutes.

If you didn't request this, please ignore this email.

E-Soko Campus Marketplace
    `
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Verify email configuration is working
 */
exports.verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error.message);
    return false;
  }
};
