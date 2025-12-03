import { cloudinary } from '#config/storageConfig.js';

/**
 * TEMPORARY: Manual payment helper utilities
 * TODO: Delete this file when payment gateway is implemented
 * 
 * Handles payment proof and QR code URL generation
 */

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'eclassify_app';

/**
 * MIME type to file extension mapping
 */
const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf'
};

/**
 * Get full URL for manual payment media based on storage type
 * @param {string} relativePath - Relative path (e.g., "uploads/manual_payments/abc")
 * @param {string} storageType - Storage type ("local" or "cloudinary")
 * @param {string} mimeType - MIME type
 * @returns {string|null} Full URL or null
 */
export const getManualPaymentMediaUrl = (relativePath, storageType, mimeType) => {
  if (!relativePath) {
    return null;
  }

  const ext = MIME_TO_EXT[mimeType] || 'jpg';

  if (storageType === 'cloudinary') {
    // Construct full publicId with CLOUDINARY_FOLDER prefix
    const fullPublicId = `${CLOUDINARY_FOLDER}/${relativePath}`;
    
    // Use cloudinary.url() to generate proper URL
    return cloudinary.url(fullPublicId, { 
      format: ext,
      secure: true,
      resource_type: mimeType === 'application/pdf' ? 'raw' : 'image'
    });
  }

  // Local storage - add extension to path
  return `${process.env.UPLOAD_URL}/${relativePath}.${ext}`;
};

/**
 * Transform payment proof metadata to include full URL
 * @param {Object} manualPaymentMetadata - Manual payment metadata from transaction
 * @returns {Object} Transformed metadata with full URL
 */
export const transformPaymentProofMetadata = (manualPaymentMetadata) => {
  if (!manualPaymentMetadata || !manualPaymentMetadata.paymentProof) {
    return manualPaymentMetadata;
  }

  const { paymentProof, ...rest } = manualPaymentMetadata;

  return {
    ...rest,
    paymentProof: {
      ...paymentProof,
      fullUrl: getManualPaymentMediaUrl(
        paymentProof.url,
        paymentProof.storageType,
        paymentProof.mimeType
      )
    }
  };
};
