# UserRepository - TODO for Future Implementation

## Overview
The project currently doesn't have a `userRepository.js` file. When implementing it in the future, you'll need to update the following files that are currently using direct User model access as a workaround.

---

## Files Modified (Temporary Workaround)

### 1. `src/services/chatRoomService.js`

**Location:** Lines ~50-52

**Current Code:**
```javascript
// Get buyer and seller subscription tiers
const buyer = await User.findByPk(buyerId, { attributes: ['subscriptionType'] });
const seller = await User.findByPk(listing.userId, { attributes: ['subscriptionType'] });
```

**Future Code (when userRepository exists):**
```javascript
// Get buyer and seller subscription tiers
const buyer = await userRepository.getById(buyerId);
const seller = await userRepository.getById(listing.userId);
```

**What to change:**
- Import: Add `import userRepository from '#repositories/userRepository.js';`
- Remove: `import models from '#models/index.js';` and `const { User } = models;`
- Replace: Direct `User.findByPk()` calls with `userRepository.getById()`

---

### 2. `src/services/listingService.js`

**Location:** Lines ~57-58 and ~265-266 (two occurrences)

**Current Code:**
```javascript
// Check if user has auto-approve enabled
const user = await User.findByPk(userId, { attributes: ['isAutoApproveEnabled'] });
const isAutoApproveEnabled = user?.isAutoApproveEnabled || false;
```

**Future Code (when userRepository exists):**
```javascript
// Check if user has auto-approve enabled
const user = await userRepository.getById(userId);
const isAutoApproveEnabled = user?.isAutoApproveEnabled || false;
```

**What to change:**
- Import: Add `import userRepository from '#repositories/userRepository.js';`
- Remove: `import models from '#models/index.js';` and `const { User } = models;`
- Replace: Both occurrences of direct `User.findByPk()` calls with `userRepository.getById()`

---

## Recommended UserRepository Implementation

When creating `src/repositories/userRepository.js`, include at minimum:

```javascript
/**
 * User Repository
 * Handles database operations for users
 */

import models from '#models/index.js';

const { User } = models;

class UserRepository {
  /**
   * Get user by ID
   * @param {number} id - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>}
   */
  async getById(id, options = {}) {
    return await User.findByPk(id, {
      attributes: options.attributes || ['id', 'fullName', 'email', 'mobile', 'subscriptionType', 'isAutoApproveEnabled'],
      ...options
    });
  }

  // Add other methods as needed...
}

// Export singleton instance
export default new UserRepository();
```

---

## Search & Replace Guide

When userRepository is ready, use these search patterns:

**Pattern 1 (chatRoomService.js):**
- Search: `User.findByPk(buyerId, { attributes: ['subscriptionType'] })`
- Replace: `userRepository.getById(buyerId)`

- Search: `User.findByPk(listing.userId, { attributes: ['subscriptionType'] })`
- Replace: `userRepository.getById(listing.userId)`

**Pattern 2 (listingService.js):**
- Search: `User.findByPk(userId, { attributes: ['isAutoApproveEnabled'] })`
- Replace: `userRepository.getById(userId)`

---

## Testing After Implementation

After creating userRepository and updating these files:

1. Test chat room creation (uses subscription tiers)
2. Test listing creation (uses auto-approve check)
3. Test listing submission (uses auto-approve check)
4. Verify no errors in console
5. Check that subscription tiers display correctly in chat rooms

---

**Created:** 2025-11-30  
**Status:** Temporary workaround in place  
**Priority:** Medium (system works, but should be refactored for consistency)
