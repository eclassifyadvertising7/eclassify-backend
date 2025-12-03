import sequelize from '#config/database.js';

/**
 * Generate next invoice number
 * Format: ECA/2025/0001
 * 
 * @param {Object} transaction - Sequelize transaction object
 * @returns {Promise<string>} Generated invoice number
 */
export const generateInvoiceNumber = async (transaction) => {
  const prefix = process.env.INVOICE_PREFIX || 'ECA';
  const currentYear = new Date().getFullYear();
  
  // Get last invoice number for current year
  const [results] = await sequelize.query(
    `SELECT invoice_number 
     FROM invoices 
     WHERE invoice_number LIKE :pattern 
     ORDER BY id DESC 
     LIMIT 1`,
    {
      replacements: { pattern: `${prefix}/${currentYear}/%` },
      type: sequelize.QueryTypes.SELECT,
      transaction
    }
  );

  let nextNumber = 1;
  
  if (results) {
    // Extract number from: ECA/2025/0042
    const parts = results.invoice_number.split('/');
    const lastNumber = parseInt(parts[2]);
    nextNumber = lastNumber + 1;
  }

  // Pad with zeros (4 digits)
  const paddedNumber = nextNumber.toString().padStart(4, '0');
  
  return `${prefix}/${currentYear}/${paddedNumber}`;
};

/**
 * Generate next transaction number
 * Format: TXN/2025/0001
 * 
 * @param {Object} transaction - Sequelize transaction object
 * @returns {Promise<string>} Generated transaction number
 */
export const generateTransactionNumber = async (transaction) => {
  const prefix = process.env.TRANSACTION_PREFIX || 'TXN';
  const currentYear = new Date().getFullYear();
  
  // Get last transaction number for current year
  const [results] = await sequelize.query(
    `SELECT transaction_number 
     FROM transactions 
     WHERE transaction_number LIKE :pattern 
     ORDER BY id DESC 
     LIMIT 1`,
    {
      replacements: { pattern: `${prefix}/${currentYear}/%` },
      type: sequelize.QueryTypes.SELECT,
      transaction
    }
  );

  let nextNumber = 1;
  
  if (results) {
    // Extract number from: TXN/2025/0042
    const parts = results.transaction_number.split('/');
    const lastNumber = parseInt(parts[2]);
    nextNumber = lastNumber + 1;
  }

  // Pad with zeros (4 digits)
  const paddedNumber = nextNumber.toString().padStart(4, '0');
  
  return `${prefix}/${currentYear}/${paddedNumber}`;
};
