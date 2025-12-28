import axios from 'axios';

/**
 * SmsService - Handle SMS sending via Dovesoft API
 * Singleton pattern for consistent instance usage
 */
class SmsService {
  constructor() {
    this.apiUrl = 'https://api.dovesoft.io/api/sendsms';
  }

  /**
   * Get API credentials (loaded dynamically)
   */
  getCredentials() {
    return {
      apiKey: process.env.SMS_API_KEY,
      senderId: process.env.SMS_SENDER_ID
    };
  }

  /**
   * Generate 6-digit random OTP
   * @returns {string} 6-digit OTP
   */
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP SMS to mobile number using template
   * @param {string} mobile - 10-digit mobile number
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise<Object>} SMS send result
   */
  async sendOtp(mobile, otp) {
    try {
      // Validate mobile number
      if (!mobile || !/^\d{10}$/.test(mobile)) {
        throw new Error('Invalid mobile number format. Must be 10 digits');
      }

      // Validate OTP
      if (!otp || !/^\d{6}$/.test(otp)) {
        throw new Error('Invalid OTP format. Must be 6 digits');
      }

      // Get credentials dynamically
      const { apiKey, senderId } = this.getCredentials();

      if (!apiKey || !senderId) {
        throw new Error('SMS credentials not configured');
      }

      const message = `Dear Customer,\nYour verification code for ${otp}\n\nRegards,\nway2share`;

      // Build API URL with query parameters
      const params = new URLSearchParams({
        key: apiKey,
        mobiles: mobile,
        sms: message,
        senderid: senderId
      });

      const url = `${this.apiUrl}?${params.toString()}`;

      // Send SMS request
      const response = await axios.get(url, {
        timeout: 10000 // 10 second timeout
      });

      // Check response
      if (response.status === 200 && response.data?.smslist?.sms?.status === 'success') {
        return {
          success: true,
          message: 'SMS sent successfully',
          data: {
            mobile,
            provider: 'dovesoft',
            messageId: response.data.smslist.sms.messageid
          }
        };
      } else {
        throw new Error(`SMS API error: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error('SMS send error:', error.message);
      
      // Log but don't expose API details to user
      throw new Error('Failed to send SMS. Please try again later');
    }
  }

  /**
   * Send custom SMS message
   * @param {string} mobile - 10-digit mobile number
   * @param {string} message - SMS message content
   * @param {string} variable - Optional variable to replace {#var#} in template
   * @returns {Promise<Object>} SMS send result
   */
  async sendMessage(mobile, message, variable = null) {
    try {
      // Validate mobile number
      if (!mobile || !/^\d{10}$/.test(mobile)) {
        throw new Error('Invalid mobile number format. Must be 10 digits');
      }

      // Validate message
      if (!message || message.trim().length === 0) {
        throw new Error('Message cannot be empty');
      }

      // Get credentials dynamically
      const { apiKey, senderId } = this.getCredentials();

      if (!apiKey || !senderId) {
        throw new Error('SMS credentials not configured');
      }

      // Build API URL with query parameters
      const params = new URLSearchParams({
        key: apiKey,
        mobiles: mobile,
        sms: message,
        senderid: senderId
      });

      // Add variable if provided (for template messages)
      if (variable) {
        params.append('var', variable);
      }

      const url = `${this.apiUrl}?${params.toString()}`;

      // Send SMS request
      const response = await axios.get(url, {
        timeout: 10000
      });

      if (response.status === 200 && response.data?.smslist?.sms?.status === 'success') {
        return {
          success: true,
          message: 'SMS sent successfully',
          data: {
            mobile,
            provider: 'dovesoft',
            messageId: response.data.smslist.sms.messageid
          }
        };
      } else {
        throw new Error(`SMS API error: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error('SMS send error:', error.message);
      throw new Error('Failed to send SMS. Please try again later');
    }
  }

  async sendNotification(mobile, message) {
    return await this.sendMessage(mobile, message);
  }
}

// Export singleton instance
export default new SmsService();
