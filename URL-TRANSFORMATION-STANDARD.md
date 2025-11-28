# URL Transformation Standard

## Rule

**Backend always saves relative paths in database. Use Sequelize model getters to serve full URLs to frontend.**

## Implementation

### 1. Database Storage
Always store relative paths:
```
uploads/listings/user-123/images/photo.jpg
```

### 2. Model Getters
Add getters to any model with file path columns:

```javascript
import { getFullUrl } from '#utils/storageHelper.js';

// Example: ListingMedia model
{
  mediaUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'media_url',
    get() {
      const rawValue = this.getDataValue('mediaUrl');
      return getFullUrl(rawValue);
    }
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'thumbnail_url',
    get() {
      const rawValue = this.getDataValue('thumbnailUrl');
      return getFullUrl(rawValue);
    }
  }
}
```

### 3. Frontend Receives Full URLs
```json
{
  "mediaUrl": "http://localhost:5000/uploads/listings/user-123/images/photo.jpg",
  "thumbnailUrl": "http://localhost:5000/uploads/listings/user-123/images/thumb_photo.jpg"
}
```

## Apply this to Any future models with file paths

## Environment Variable

```env
UPLOAD_URL=http://localhost:5000
```
