import nodemailer, { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface AdminInvitationEmailData {
  fullName: string;
  email: string;
  password: string;
  invitedBy: string;
  loginUrl: string;
}

interface WelcomeEmailData {
  name: string;
  email: string;
  loginUrl: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;

  /**
   * Initialize email transporter
   */
  private static getTransporter(): Transporter {
    if (!this.transporter) {
      const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
      const smtpPort = parseInt(process.env.SMTP_PORT || '587');
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (!smtpUser || !smtpPass) {
        console.warn('SMTP credentials not configured. Email service will be disabled.');
        // Return a mock transporter for development
        return {
          sendMail: async () => {
            console.log('Mock email sent (SMTP not configured)');
            return { messageId: 'mock-id' };
          },
        } as any;
      }

      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }

    return this.transporter;
  }

  /**
   * Send email
   */
  private static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@examportal.com';

      const info = await transporter.sendMail({
        from: `"Exam Portal" <${from}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send admin invitation email
   */
  static async sendAdminInvitation(data: AdminInvitationEmailData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            padding: 30px;
            color: white;
          }
          .content {
            background: white;
            border-radius: 8px;
            padding: 30px;
            margin-top: 20px;
            color: #333;
          }
          .credentials {
            background: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .credentials-item {
            margin: 10px 0;
          }
          .credentials-label {
            font-weight: bold;
            color: #4a5568;
          }
          .credentials-value {
            color: #2d3748;
            font-family: monospace;
            font-size: 16px;
            background: white;
            padding: 8px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 5px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin-top: 20px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #718096;
            font-size: 12px;
          }
          .warning {
            background: #fff5f5;
            border-left: 4px solid #fc8181;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #c53030;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 style="margin: 0;">🎉 Admin Invitation</h1>
          <p style="margin: 10px 0 0;">You've been invited to join the team!</p>
        </div>
        
        <div class="content">
          <h2>Hi ${data.fullName},</h2>
          
          <p>Great news! You've been invited to join <strong>Exam Portal</strong> as an Administrator by <strong>${data.invitedBy}</strong>.</p>
          
          <p>As an admin, you'll be able to:</p>
          <ul>
            <li>Create and manage exam types</li>
            <li>Organize departments and academic periods</li>
            <li>Upload study materials and documents</li>
            <li>Create practice questions</li>
            <li>View student analytics</li>
          </ul>
          
          <div class="credentials">
            <div class="credentials-item">
              <div class="credentials-label">📧 Email:</div>
              <div class="credentials-value">${data.email}</div>
            </div>
            <div class="credentials-item">
              <div class="credentials-label">🔑 Temporary Password:</div>
              <div class="credentials-value">${data.password}</div>
            </div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important Security Note:</strong><br>
            Please change your password immediately after your first login.
          </div>
          
          <a href="${data.loginUrl}" class="button">Login to Dashboard</a>
          
          <p style="margin-top: 30px; color: #718096; font-size: 14px;">
            If you have any questions, please contact your administrator or super admin.
          </p>
        </div>
        
        <div class="footer">
          <p>This is an automated email from Exam Portal.</p>
          <p>© ${new Date().getFullYear()} Exam Portal. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Hi ${data.fullName},

You've been invited to join Exam Portal as an Administrator by ${data.invitedBy}.

Your login credentials:
Email: ${data.email}
Temporary Password: ${data.password}

Login at: ${data.loginUrl}

IMPORTANT: Please change your password immediately after your first login.

Best regards,
Exam Portal Team
    `.trim();

    return this.sendEmail({
      to: data.email,
      subject: '🎉 You\'ve been invited as an Admin - Exam Portal',
      html,
      text,
    });
  }

  /**
   * Send welcome email to new student
   */
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            padding: 30px;
            color: white;
          }
          .content {
            background: white;
            border-radius: 8px;
            padding: 30px;
            margin-top: 20px;
            color: #333;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin-top: 20px;
          }
          .features {
            background: #f7fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .feature-item {
            margin: 10px 0;
            padding-left: 30px;
            position: relative;
          }
          .feature-item:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #48bb78;
            font-weight: bold;
            font-size: 20px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #718096;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 style="margin: 0;">🎓 Welcome to Exam Portal!</h1>
          <p style="margin: 10px 0 0;">Your learning journey starts here</p>
        </div>
        
        <div class="content">
          <h2>Hi ${data.name},</h2>
          
          <p>Welcome to <strong>Exam Portal</strong>! Your account has been created successfully, and you're all set to begin your learning journey.</p>
          
          <div class="features">
            <h3 style="margin-top: 0;">What you can do:</h3>
            <div class="feature-item">Browse comprehensive study materials</div>
            <div class="feature-item">Practice with multiple-choice questions</div>
            <div class="feature-item">Track your learning progress</div>
            <div class="feature-item">Bookmark materials for quick access</div>
            <div class="feature-item">Download resources for offline study</div>
          </div>
          
          <p><strong>Your registered email:</strong> ${data.email}</p>
          
          <a href="${data.loginUrl}" class="button">Start Learning Now</a>
          
          <p style="margin-top: 30px; color: #718096; font-size: 14px;">
            Pro tip: Login regularly to track your progress and access new materials!
          </p>
        </div>
        
        <div class="footer">
          <p>This is an automated email from Exam Portal.</p>
          <p>© ${new Date().getFullYear()} Exam Portal. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Hi ${data.name},

Welcome to Exam Portal! Your account has been created successfully.

Start exploring our study materials and track your progress.

Login at: ${data.loginUrl}

Your registered email: ${data.email}

Happy studying!
Exam Portal Team
    `.trim();

    return this.sendEmail({
      to: data.email,
      subject: '🎓 Welcome to Exam Portal - Your Learning Journey Starts Here!',
      html,
      text,
    });
  }

  /**
   * Test email configuration
   */
  static async testConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      
      // Skip verification if using mock transporter
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('Email service in mock mode (SMTP not configured)');
        return true;
      }

      await transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

