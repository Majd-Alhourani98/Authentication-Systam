const verificationEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="background-color: #f0f0f0; padding: 20px; margin: 0;">
  <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; margin: 0 auto;">
    <tr>
      <td style="padding: 20px;">
        <h2 style="color: #333333; font-size: 24px; margin: 0;">Email Verification</h2>
        <p style="font-size: 16px; color: #555555; line-height: 24px; margin: 16px 0;">
          Hello,
          <br><br>
          Thank you for registering with us! To complete your registration, please enter the verification code below in the app or website:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 24px; color: #4CAF50; font-weight: bold; border: 2px dashed #4CAF50; padding: 10px 20px; display: inline-block;">{{VERIFICATION_CODE}}</span>
        </div>
        <p style="font-size: 16px; color: #555555; line-height: 24px; margin: 16px 0;">
          This code will expire in 10 minutes. Please use it as soon as possible.
        </p>
        <p style="font-size: 14px; color: #888888; margin-top: 30px; line-height: 20px;">
          If you did not request this verification code, please ignore this email.
        </p>
        <p style="font-size: 14px; color: #888888; margin-top: 10px; line-height: 20px;">
          Best regards,
          <br>
          The [Your Company Name] Team
        </p>
      </td>
    </tr>
  </table>
</body>
</html>

`;

const welcomeEmailTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Service</title>
</head>
<body style="background-color: #f9f9f9; padding: 20px; margin: 0;">
  <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; border: 1px solid #dddddd; border-radius: 8px; background-color: #ffffff; margin: 0 auto;">
    <tr>
      <td style="padding: 20px;">
        <h2 style="color: #333333; font-size: 24px; margin: 0;">Welcome to Our Service!</h2>
        <p style="font-size: 16px; color: #555555; line-height: 24px; margin: 16px 0;">
          Hi {{USER_NAME}},
          <br><br>
          Thank you for joining us! We're thrilled to have you as part of our community. Our team is dedicated to providing you with the best experience possible, and we are here to support you every step of the way.
        </p>
        <p style="font-size: 16px; color: #555555; line-height: 24px; margin: 16px 0;">
          To get started, you can explore the following:
        </p>
        <ul style="font-size: 16px; color: #555555; line-height: 24px; margin: 16px 0; padding-left: 20px;">
          <li>Visit our <a href="{{DASHBOARD_URL}}" style="color: #1a73e8; text-decoration: none;">dashboard</a> to access your account features.</li>
          <li>Check out our <a href="{{HELP_CENTER_URL}}" style="color: #1a73e8; text-decoration: none;">Help Center</a> for guides and support.</li>
          <li>Stay updated with our <a href="{{BLOG_URL}}" style="color: #1a73e8; text-decoration: none;">blog</a> for the latest news and tips.</li>
        </ul>
        <p style="font-size: 16px; color: #555555; line-height: 24px; margin: 16px 0;">
          If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:support@example.com" style="color: #1a73e8; text-decoration: none;">support@example.com</a>.
        </p>
        <p style="font-size: 14px; color: #888888; margin-top: 30px; line-height: 20px;">
          Best regards,
          <br>
          The [Your Company Name] Team
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
module.exports = { verificationEmailTemplate, welcomeEmailTemplate };
