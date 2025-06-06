import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send subscription confirmation email
export const sendSubscriptionEmail = async (email) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Luxor Stays Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <img src="https://example.com/luxor-logo.png" alt="Luxor Stays Logo" style="max-width: 150px; margin-bottom: 20px;">
          <h2 style="color: #333;">Thank You for Subscribing!</h2>
          <p style="color: #666; line-height: 1.5;">
            We're thrilled to have you join our newsletter community at Luxor Stays. You'll now be the first to discover new destinations, exclusive offers, and travel inspiration.
          </p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #333; margin: 0;">
              <strong>What to expect:</strong><br>
              • Exclusive hotel deals<br>
              • Travel inspiration and guides<br>
              • Seasonal promotions<br>
              • Early access to new features
            </p>
          </div>
          <p style="color: #666; line-height: 1.5;">
            If you have any questions or need assistance, feel free to reply to this email or contact our support team.
          </p>
          <p style="color: #666; line-height: 1.5;">
            Happy Travels,<br>
            The Luxor Stays Team
          </p>
          <div style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
            <p>You're receiving this email because you subscribed to the Luxor Stays newsletter.</p>
            <p>To unsubscribe, <a href="https://example.com/unsubscribe?email=${email}" style="color: #999;">click here</a>.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};