import slugify from 'slugify';
import path from 'path';

const generateAlphaNumericCode = (limit = 7) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';

  for (let i = 0; i < limit; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
};

export const generateShareCode = (limit = 7) => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let i = 0; i < limit; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
};

export const customSlugify = (text, options = {}) => {
  const safeText = text ?? '';

  let slug = slugify(safeText, {
    lower: true,
    strict: true,
    trim: true,
    replacement: '-',
    ...options,
  });

  slug = slug
    .replace(/^\.+/, '')
    .replace(/\.+$/, '')
    .replace(/_/g, '')
    .substring(0, 20);

  return slug;
};

export const getIndianTimestamp = () => {
  const now = new Date();

  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utc + istOffset);

  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  const hour = String(istDate.getHours()).padStart(2, '0');
  const minute = String(istDate.getMinutes()).padStart(2, '0');
  const second = String(istDate.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hour}${minute}${second}`;
};

export const generateFileName = (originalFilename) => {
  const timestamp = getIndianTimestamp();
  const baseName = path.basename(originalFilename, path.extname(originalFilename));
  const sanitizedFilename = customSlugify(baseName);
  const randomChars = generateAlphaNumericCode(3);
  const extension = path.extname(originalFilename);

  return `${timestamp}-${sanitizedFilename}-${randomChars}${extension}`;
};

export default {
  customSlugify,
  getIndianTimestamp,
  generateFileName,
  generateShareCode,
};
