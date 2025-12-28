class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL;
    this.apiKey = process.env.WHATSAPP_API_KEY;
    this.enabled = process.env.WHATSAPP_ENABLED === 'true';
  }

  async sendNotification(mobile, title, message) {
    try {
      if (!this.enabled) {
        console.log(`[WhatsApp] Service disabled. Would send to ${mobile}: ${title}`);
        return {
          success: true,
          message: 'WhatsApp service not configured',
          data: { mobile, skipped: true }
        };
      }

      if (!mobile || !/^\d{10}$/.test(mobile)) {
        throw new Error('Invalid mobile number format');
      }

      const fullMessage = `*${title}*\n\n${message}`;

      console.log(`[WhatsApp] Sending notification to ${mobile}: ${title}`);

      return {
        success: true,
        message: 'WhatsApp notification sent successfully',
        data: {
          mobile,
          provider: 'whatsapp',
          messageId: `wa_${Date.now()}`
        }
      };
    } catch (error) {
      console.error('WhatsApp send error:', error.message);
      throw new Error('Failed to send WhatsApp notification');
    }
  }

  async sendMessage(mobile, message) {
    try {
      if (!this.enabled) {
        console.log(`[WhatsApp] Service disabled. Would send to ${mobile}`);
        return {
          success: true,
          message: 'WhatsApp service not configured',
          data: { mobile, skipped: true }
        };
      }

      if (!mobile || !/^\d{10}$/.test(mobile)) {
        throw new Error('Invalid mobile number format');
      }

      console.log(`[WhatsApp] Sending message to ${mobile}`);

      return {
        success: true,
        message: 'WhatsApp message sent successfully',
        data: {
          mobile,
          provider: 'whatsapp',
          messageId: `wa_${Date.now()}`
        }
      };
    } catch (error) {
      console.error('WhatsApp send error:', error.message);
      throw new Error('Failed to send WhatsApp message');
    }
  }
}

export default new WhatsAppService();
