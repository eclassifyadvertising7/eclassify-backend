# Listing Quota Behavior Matrix

## Overview

This document explains how listing creation, submission, and approval behave under different combinations of auto-approve settings and quota availability.

## Behavior Matrix

| Auto-Approve | Quota Status | Create Result | Submit Result | Admin Approval |
|--------------|--------------|---------------|---------------|----------------|
| ✅ ON | ✅ Available | `active` | `active` | N/A (already active) |
| ✅ ON | ❌ Exceeded | `draft` | `pending` | ❌ Blocked |
| ❌ OFF | ✅ Available | `draft` | `pending` | ✅ `active` |
| ❌ OFF | ❌ Exceeded | `draft` | `pending` | ❌ Blocked |

## Detailed Scenarios

### Scenario 1: Auto-Approve ON + Quota Available ✅

**User creates listing:**
```javascript
// Input
isAutoApproveEnabled: true
quotaCheck.canCreate: true

// Output
{
  status: 'active',
  isAutoApproved: true,
  approvedAt: Date,
  approvedBy: userId,
  publishedAt: Date,
  expiresAt: Date (30 days from now)
}

// Message
"Listing created and auto-approved successfully"
```

**User submits draft:**
```javascript
// Input
isAutoApproveEnabled: true
quotaCheck.canCreate: true

// Output
{
  status: 'active',
  isAutoApproved: true,
  approvedAt: Date,
  approvedBy: userId,
  publishedAt: Date,
  expiresAt: Date (30 days from now)
}

// Message
"Listing submitted and auto-approved successfully"
```

**Admin approval:**
- Not applicable - listing is already active

---

### Scenario 2: Auto-Approve ON + Quota Exceeded ❌

**User creates listing:**
```javascript
// Input
isAutoApproveEnabled: true
quotaCheck.canCreate: false

// Output
{
  status: 'draft',
  isAutoApproved: false,
  approvedAt: null,
  approvedBy: null,
  publishedAt: null,
  expiresAt: null
}

// Message
"You have reached your 30-day listing limit (10). Your listing has been saved as draft."
```

**User submits draft:**
```javascript
// Input
isAutoApproveEnabled: true
quotaCheck.canCreate: false

// Output
{
  status: 'pending',
  isAutoApproved: false,
  approvedAt: null,
  approvedBy: null,
  publishedAt: null,
  expiresAt: null
}

// Message
"You have reached your 30-day listing limit (10). Your listing has been submitted for manual approval."
```

**Admin approval:**
```javascript
// Input
quotaCheck.canCreate: false

// Output
{
  success: false,
  message: "You have reached your 30-day listing limit (10)",
  data: {
    listing: { ... },
    quotaDetails: {
      current: 10,
      limit: 10,
      rollingDays: 30,
      remaining: 0
    }
  }
}

// Status remains 'pending'
```

---

### Scenario 3: Auto-Approve OFF + Quota Available ✅

**User creates listing:**
```javascript
// Input
isAutoApproveEnabled: false

// Output
{
  status: 'draft',
  isAutoApproved: false,
  approvedAt: null,
  approvedBy: null,
  publishedAt: null,
  expiresAt: null
}

// Message
"Listing created successfully"

// Note: Quota check is skipped - drafts don't consume quota
```

**User submits draft:**
```javascript
// Input
isAutoApproveEnabled: false

// Output
{
  status: 'pending',
  isAutoApproved: false,
  approvedAt: null,
  approvedBy: null,
  publishedAt: null,
  expiresAt: null
}

// Message
"Listing submitted for approval"

// Note: Quota check is skipped - pending doesn't consume quota
```

**Admin approval:**
```javascript
// Input
quotaCheck.canCreate: true

// Output
{
  status: 'active',
  isAutoApproved: false,
  approvedAt: Date,
  approvedBy: adminUserId,
  publishedAt: Date,
  expiresAt: Date (30 days from now)
}

// Message
"Listing approved successfully"
```

---

### Scenario 4: Auto-Approve OFF + Quota Exceeded ❌

**User creates listing:**
```javascript
// Input
isAutoApproveEnabled: false

// Output
{
  status: 'draft',
  isAutoApproved: false,
  approvedAt: null,
  approvedBy: null,
  publishedAt: null,
  expiresAt: null
}

// Message
"Listing created successfully"

// Note: Quota check is skipped - drafts don't consume quota
```

**User submits draft:**
```javascript
// Input
isAutoApproveEnabled: false

// Output
{
  status: 'pending',
  isAutoApproved: false,
  approvedAt: null,
  approvedBy: null,
  publishedAt: null,
  expiresAt: null
}

// Message
"Listing submitted for approval"

// Note: Quota check is skipped - pending doesn't consume quota
```

**Admin approval:**
```javascript
// Input
quotaCheck.canCreate: false

// Output
{
  success: false,
  message: "You have reached your 30-day listing limit (10)",
  data: {
    listing: { ... },
    quotaDetails: {
      current: 10,
      limit: 10,
      rollingDays: 30,
      remaining: 0
    }
  }
}

// Status remains 'pending'
```

---

## Key Rules

### 1. Quota Check Timing
- **Checked:** When listing is about to become `active`
- **Skipped:** When creating `draft` or submitting to `pending`

### 2. Auto-Approve Behavior
- **Quota Available:** Listing goes directly to `active`
- **Quota Exceeded:** Falls back to `draft` (create) or `pending` (submit)

### 3. Manual Approval
- **Always checks quota** before approving
- **Blocks approval** if quota exceeded
- **Returns error** with quota details

### 4. User Experience
- **Never blocked** from creating listings
- **Always can save** as draft
- **Always can submit** for approval
- **Clear messaging** when quota affects behavior

## Status Transitions

```
┌─────────────────────────────────────────────────────────────┐
│                    LISTING STATUS FLOW                       │
└─────────────────────────────────────────────────────────────┘

Auto-Approve ON + Quota Available:
  CREATE → active ✅
  SUBMIT → active ✅

Auto-Approve ON + Quota Exceeded:
  CREATE → draft 📝
  SUBMIT → pending ⏳ → (admin approval blocked ❌)

Auto-Approve OFF + Quota Available:
  CREATE → draft 📝
  SUBMIT → pending ⏳ → (admin approval) → active ✅

Auto-Approve OFF + Quota Exceeded:
  CREATE → draft 📝
  SUBMIT → pending ⏳ → (admin approval blocked ❌)
```

## Quota Consumption

### Statuses That Count Towards Quota:
- ✅ `active` - Currently live listing
- ✅ `expired` - Was published but expired
- ✅ `sold` - Was published and marked sold

### Statuses That DON'T Count:
- ❌ `draft` - Not yet submitted
- ❌ `pending` - Awaiting approval
- ❌ `rejected` - Never published

### Special Cases:
- ✅ **Soft-deleted listings count** - Prevents quota gaming
- ✅ **Rolling window** - Calculated from current date backwards
- ✅ **Time-based** - Old listings automatically fall out of window

## Frontend Integration

### Display Quota Status
```javascript
// Fetch quota usage
const response = await fetch('/api/end-user/listings/quota');
const { data } = await response.json();

if (data.hasSubscription && data.quota) {
  const { used, limit, remaining, percentage } = data.quota;
  
  // Show quota bar
  console.log(`Quota: ${used}/${limit} (${remaining} remaining)`);
  
  // Warn user if quota is low
  if (percentage >= 80) {
    showWarning('You are approaching your listing limit');
  }
  
  // Inform user if quota exceeded
  if (remaining === 0) {
    showInfo('Quota reached. New listings will require manual approval.');
  }
}
```

### Handle Create Response
```javascript
const response = await createListing(listingData);

if (response.success) {
  if (response.data.status === 'active') {
    showSuccess('Listing published successfully!');
  } else if (response.data.status === 'draft') {
    showInfo(response.message); // Quota exceeded message
  }
}
```

### Handle Submit Response
```javascript
const response = await submitListing(listingId);

if (response.success) {
  if (response.data.status === 'active') {
    showSuccess('Listing published successfully!');
  } else if (response.data.status === 'pending') {
    if (response.message.includes('quota')) {
      showInfo(response.message); // Quota exceeded, manual approval
    } else {
      showInfo('Listing submitted for approval');
    }
  }
}
```

## Admin Panel Integration

### Approval Flow
```javascript
const response = await approveListing(listingId);

if (!response.success) {
  // Check if quota error
  if (response.data?.quotaDetails) {
    const { current, limit, rollingDays } = response.data.quotaDetails;
    
    showError(
      `Cannot approve: User has reached their ${rollingDays}-day limit (${current}/${limit})`
    );
    
    // Optionally show quota details
    showQuotaDetails(response.data.quotaDetails);
  } else {
    showError(response.message);
  }
}
```

## Testing Scenarios

### Test Case 1: Auto-Approve with Available Quota
1. Enable auto-approve for user
2. Ensure quota is available (e.g., 5/10 used)
3. Create listing → Verify status = `active`
4. Check quota usage → Verify count increased to 6/10

### Test Case 2: Auto-Approve with Exceeded Quota
1. Enable auto-approve for user
2. Ensure quota is exceeded (e.g., 10/10 used)
3. Create listing → Verify status = `draft`
4. Submit listing → Verify status = `pending`
5. Admin approve → Verify approval blocked with error

### Test Case 3: Manual Approval with Available Quota
1. Disable auto-approve for user
2. Ensure quota is available
3. Create listing → Verify status = `draft`
4. Submit listing → Verify status = `pending`
5. Admin approve → Verify status = `active`

### Test Case 4: Manual Approval with Exceeded Quota
1. Disable auto-approve for user
2. Ensure quota is exceeded
3. Create listing → Verify status = `draft`
4. Submit listing → Verify status = `pending`
5. Admin approve → Verify approval blocked with error

### Test Case 5: Rolling Window
1. Create 10 listings on Day 1 (quota: 10/30 days)
2. Wait 31 days
3. Create new listing → Verify quota shows 0/10 (old listings expired from window)
4. Verify new listing can be approved

### Test Case 6: Soft-Deleted Listings
1. Create and approve 10 listings (quota: 10/10)
2. Soft-delete 5 listings
3. Try to create new listing → Verify quota still shows 10/10
4. Verify new listing cannot be auto-approved

## Troubleshooting

### Issue: Listing not auto-approved despite quota available
**Check:**
- User has `isAutoApproveEnabled = true`
- Subscription is active (`status = 'active'`)
- Subscription has not expired (`endsAt >= now`)
- Quota is properly configured (`listingQuotaLimit` and `listingQuotaRollingDays` set)

### Issue: Admin cannot approve listing
**Check:**
- User's quota usage in rolling window
- Verify quota calculation includes soft-deleted listings
- Check if old listings have fallen out of rolling window

### Issue: Quota count seems incorrect
**Check:**
- Only `active`, `expired`, `sold` statuses count
- Soft-deleted listings are included (`paranoid: false`)
- Rolling window calculation is correct (current date - rollingDays)
- Database timestamps are accurate
