import nodemailer from 'nodemailer';
import config from '#config/env.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Validate email configuration
      if (!config.email.host || !config.email.user || !config.email.password) {
        console.error('Email configuration incomplete:', {
          host: config.email.host ? 'SET' : 'MISSING',
          user: config.email.user ? 'SET' : 'MISSING',
          password: config.email.password ? 'SET' : 'MISSING',
          port: config.email.port
        });
        throw new Error('Email configuration is incomplete');
      }

      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465, // true for 465, false for other ports
        auth: {
          user: config.email.user,
          pass: config.email.password
        },
        tls: {
          rejectUnauthorized: false
        },
        debug: config.app.env === 'development', // Enable debug in development
        logger: config.app.env === 'development' // Enable logging in development
      });

      console.log('Email transporter initialized successfully', {
        host: config.email.host,
        port: config.email.port,
        user: config.email.user,
        secure: config.email.port === 465
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error.message);
      this.transporter = null;
    }
  }

  async verifyConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }

  async sendOtp(email, otp, type = 'verification', fullName = null) {
    try {
      if (!this.transporter) {
        console.error('Email transporter not initialized - cannot send OTP');
        throw new Error('Email service not available');
      }

      const subject = this.getOtpSubject(type);
      const html = this.getOtpTemplate(otp, type, fullName);

      const mailOptions = {
        from: `"${config.app.name}" <${config.email.from}>`,
        to: email,
        subject,
        html
      };

      console.log(`Attempting to send OTP email to ${email}...`);
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`OTP email sent successfully to ${email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error(`Failed to send OTP email to ${email}:`, {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      throw error; // Re-throw to let caller handle it
    }
  }

  async sendNotification(email, subject, message, data = {}) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const html = this.getNotificationTemplate(message, data);

      const mailOptions = {
        from: `"${config.app.name}" <${config.email.from}>`,
        to: email,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Notification email sent successfully to ${email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error(`Failed to send notification email to ${email}:`, error);
      return false;
    }
  }

  _generatePassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async sendPasswordEmail(email, fullName, password) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const customerName = fullName || 'Customer';
      const subject = `Your ${config.app.name} Account Password`;
      const html = this.getPasswordTemplate(customerName, password);

      const mailOptions = {
        from: `"${config.app.name}" <${config.email.from}>`,
        to: email,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Password email sent successfully to ${email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error(`Failed to send password email to ${email}:`, error);
      return false;
    }
  }

  async sendWelcomeEmail(email, fullName) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const subject = `Welcome to ${config.app.name}!`;
      const html = this.getWelcomeTemplate(fullName);

      const mailOptions = {
        from: `"${config.app.name}" <${config.email.from}>`,
        to: email,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully to ${email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error(`Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }

  getOtpSubject(type) {
    const subjects = {
      signup: `Verify your ${config.app.name} account`,
      login: `Your ${config.app.name} login code`,
      verification: `Your ${config.app.name} verification code`,
      'password-reset': `Reset your ${config.app.name} password`
    };

    return subjects[type] || subjects.verification;
  }

  getOtpTemplate(otp, type, fullName = null) {
    const customerName = fullName || 'Customer';
    
    const messages = {
      signup: `Welcome to ${config.app.name}! Please verify your account with the code below to get started.`,
      login: `Welcome back to ${config.app.name}! Use the verification code below to complete your login securely.`,
      verification: `Thank you for using ${config.app.name}. Please verify your account with the code below to continue.`,
      'password-reset': `We received a request to reset your ${config.app.name} password. Use the code below to proceed with the reset.`
    };

    const message = messages[type] || messages.verification;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #2c3e50; margin-bottom: 30px; text-align: center;">${config.app.name}</h1>
          
          <div style="background: white; padding: 30px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${customerName},</p>
            <p style="font-size: 16px; margin-bottom: 30px;">${message}</p>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h1 style="font-size: 36px; font-weight: bold; color: #2980b9; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            
            <p style="font-size: 14px; color: #7f8c8d; margin-top: 30px;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
          </div>
          
          <p style="font-size: 12px; color: #95a5a6; margin-top: 30px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  getNotificationTemplate(message, data = {}) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #2c3e50; margin-bottom: 30px; text-align: center;">${config.app.name}</h1>
          
          <div style="background: white; padding: 30px; border-radius: 8px;">
            <div style="font-size: 16px; line-height: 1.8;">
              ${message}
            </div>
            
            ${data.actionUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.actionUrl}" style="background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  ${data.actionText || 'View Details'}
                </a>
              </div>
            ` : ''}
          </div>
          
          <p style="font-size: 12px; color: #95a5a6; margin-top: 30px; text-align: center;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordTemplate(fullName, password) {
    const customerName = fullName || 'Customer';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Account Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #2c3e50; margin-bottom: 30px; text-align: center;">${config.app.name}</h1>
          
          <div style="background: white; padding: 30px; border-radius: 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${customerName},</p>
            
            <p style="font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
              Congratulations! Your ${config.app.name} account has been successfully created. Here are your login credentials:
            </p>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 14px; color: #7f8c8d; margin: 0 0 10px 0;">Your Password:</p>
              <h2 style="font-size: 24px; font-weight: bold; color: #2980b9; margin: 0; letter-spacing: 2px;">${password}</h2>
            </div>
            
            <p style="font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
              Please keep this password secure and consider changing it after your first login for enhanced security.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.app.frontendUrl || 'http://localhost:3000'}" style="background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Login to Your Account
              </a>
            </div>
          </div>
          
          <p style="font-size: 12px; color: #95a5a6; margin-top: 30px; text-align: center;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeTemplate(fullName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #2c3e50; margin-bottom: 30px; text-align: center;">${config.app.name}</h1>
          
          <div style="background: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #34495e; margin-bottom: 20px;">Welcome, ${fullName}!</h2>
            
            <p style="font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
              Thank you for joining ${config.app.name}! We're excited to have you as part of our community.
            </p>
            
            <p style="font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
              You can now:
            </p>
            
            <ul style="font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
              <li>Browse and search listings</li>
              <li>Create your own listings</li>
              <li>Chat with other users</li>
              <li>Manage your favorites</li>
              <li>Subscribe to premium plans</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.app.frontendUrl || 'http://localhost:3000'}" style="background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Get Started
              </a>
            </div>
          </div>
          
          <p style="font-size: 12px; color: #95a5a6; margin-top: 30px; text-align: center;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();