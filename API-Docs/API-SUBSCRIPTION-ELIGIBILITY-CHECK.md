# Subscription Eligibility Check API

## Endpoint

```
GET /api/end-user/subscriptions/check-eligibility/:planId
```

**Purpose:** Check if user is eligible to subscribe to a plan BEFORE initiating payment.

**Authentication:** Required (Bearer token)

---

## Request

### URL Parameters
- `planId` (required) - ID of the plan to check eligibility for

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Example Request
```bash
curl -X GET http://localhost:5000/api/end-user/subscriptions/check-eligibility/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Response Structure

All responses follow this structure:
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {
    "eligible": true/false,
    "reason": "REASON_CODE",
    "message": "Detailed message",
    "targetPlan": {...},
    "currentSubscription": {...},
    "quotaInfo": {...},
    "suggestions": [...]
  }
}
```

---

## Response Scenarios

### 1. Eligible - New Subscription (No Existing Subscription)

```json
{
  "success": true,
  "message": "You are eligible to subscribe to this plan",
  "data": {
    "eligible": true,
    "reason": "NEW_SUBSCRIPTION",
    "message": "You can subscribe to this plan",
    "targetPlan": {
      "id": 123,
      "name": "Cars Premium",
      "price": 999,
      "isFreePlan": false,
      "categoryId": 1
    },
    "currentSubscription": null,
    "quotaInfo": null,
    "suggestions": null
  }
}
```

---

### 2. Eligible - Free Plan Upgrade

```json
{
  "success": true,
  "message": "You are eligible to subscribe to this plan",
  "data": {
    "eligible": true,
    "reason": "FREE_PLAN_UPGRADE",
    "message": "You can upgrade from free plan anytime",
    "targetPlan": {
      "id": 123,
      "name": "Cars Premium",
      "price": 999,
      "isFreePlan": false,
      "categoryId": 1
    },
    "currentSubscription": {
      "id": 45,
      "planName": "Cars Free",
      "isFreePlan": true,
      "quotaLimit": 3,
      "quotaUsed": 2,
      "quotaRemaining": 1,
      "rollingDays": 30
    },
    "quotaInfo": {
      "planType": "free",
      "planName": "Cars Free",
      "quotaType": "rolling",
      "quotaLimit": 3,
      "quotaUsed": 2,
      "quotaRemaining": 1,
      "rollingDays": 30
    },
    "suggestions": null
  }
}
```

---

### 3. Eligible - Quota Exhausted (Upgrade Allowed)

```json
{
  "success": true,
  "message": "You are eligible to subscribe to this plan",
  "data": {
    "eligible": true,
    "reason": "UPGRADE_ALLOWED",
    "message": "You can upgrade to this plan (quota exhausted)",
    "targetPlan": {
      "id": 124,
      "name": "Cars Premium",
      "price": 1499,
      "isFreePlan": false,
      "categoryId": 1
    },
    "currentSubscription": {
      "id": 46,
      "planName": "Cars Basic",
      "isFreePlan": false,
      "quotaLimit": 10,
      "quotaUsed": 10,
      "quotaRemaining": 0,
      "rollingDays": 30
    },
    "quotaInfo": {
      "planType": "paid",
      "planName": "Cars Basic",
      "quotaType": "rolling",
      "quotaLimit": 10,
      "quotaUsed": 10,
      "quotaRemaining": 0,
      "rollingDays": 30
    },
    "suggestions": null
  }
}
```

---

### 4. Not Eligible - Quota Not Exhausted

```json
{
  "success": true,
  "message": "Cannot upgrade. You have used 5 of 10 listings. Please exhaust your current quota before upgrading.",
  "data": {
    "eligible": false,
    "reason": "QUOTA_NOT_EXHAUSTED",
    "message": "Cannot upgrade. You have used 5 of 10 listings. Please exhaust your current quota before upgrading.",
    "targetPlan": {
      "id": 124,
      "name": "Cars Premium",
      "price": 1499,
      "isFreePlan": false,
      "categoryId": 1
    },
    "currentSubscription": {
      "id": 46,
      "planName": "Cars Basic",
      "isFreePlan": false,
      "quotaLimit": 10,
      "quotaUsed": 5,
      "quotaRemaining": 5,
      "rollingDays": 30
    },
    "quotaInfo": {
      "planType": "paid",
      "planName": "Cars Basic",
      "quotaType": "rolling",
      "quotaLimit": 10,
      "quotaUsed": 5,
      "quotaRemaining": 5,
      "rollingDays": 30
    },
    "suggestions": [
      "Create 5 more listings to exhaust your quota",
      "Your quota resets 30 days after each listing creation",
      "Contact support if you need immediate upgrade"
    ]
  }
}
```

---

### 5. Not Eligible - Already Has Free Plan

```json
{
  "success": true,
  "message": "You already have an active free plan for this category",
  "data": {
    "eligible": false,
    "reason": "ALREADY_HAS_FREE_PLAN",
    "message": "You already have an active free plan for this category",
    "targetPlan": {
      "id": 120,
      "name": "Cars Free",
      "price": 0,
      "isFreePlan": true,
      "categoryId": 1
    },
    "currentSubscription": {
      "id": 45,
      "planName": "Cars Free",
      "isFreePlan": true,
      "quotaLimit": 3,
      "quotaUsed": 1,
      "quotaRemaining": 2,
      "rollingDays": 30
    },
    "quotaInfo": {
      "planType": "free",
      "planName": "Cars Free",
      "quotaType": "rolling",
      "quotaLimit": 3,
      "quotaUsed": 1,
      "quotaRemaining": 2,
      "rollingDays": 30
    },
    "suggestions": [
      "You can upgrade to a paid plan anytime",
      "Your current free plan will be replaced upon upgrade"
    ]
  }
}
```

---

### 6. Not Eligible - Plan Not Found

```json
{
  "success": true,
  "message": "Plan not found",
  "data": {
    "eligible": false,
    "reason": "PLAN_NOT_FOUND",
    "message": "The selected plan does not exist",
    "targetPlan": null,
    "currentSubscription": null,
    "quotaInfo": null,
    "suggestions": [
      "Please select a valid plan"
    ]
  }
}
```

---

### 7. Not Eligible - Plan Not Available

```json
{
  "success": true,
  "message": "Plan not available",
  "data": {
    "eligible": false,
    "reason": "PLAN_NOT_AVAILABLE",
    "message": "This plan is not currently available for subscription",
    "targetPlan": {
      "id": 125,
      "name": "Cars Deprecated",
      "isActive": false,
      "isPublic": false
    },
    "currentSubscription": null,
    "quotaInfo": null,
    "suggestions": [
      "Please select an available plan"
    ]
  }
}
```

---

## Reason Codes

| Code | Description | Eligible |
|------|-------------|----------|
| `NEW_SUBSCRIPTION` | User has no existing subscription for this category | ✅ Yes |
| `FREE_PLAN_UPGRADE` | User is upgrading from free to paid plan | ✅ Yes |
| `UPGRADE_ALLOWED` | User's quota is exhausted, can upgrade | ✅ Yes |
| `DOWNGRADE_ALLOWED` | User's quota is exhausted, can downgrade to free | ✅ Yes |
| `QUOTA_NOT_EXHAUSTED` | User must exhaust quota before upgrading/downgrading | ❌ No |
| `ALREADY_HAS_FREE_PLAN` | User already has free plan for this category | ❌ No |
| `PLAN_NOT_FOUND` | Plan does not exist | ❌ No |
| `PLAN_NOT_AVAILABLE` | Plan is inactive or not public | ❌ No |

---

## Frontend Integration

### React/JavaScript Example

```javascript
async function checkEligibilityBeforePurchase(planId) {
  try {
    const response = await fetch(
      `/api/end-user/subscriptions/check-eligibility/${planId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();

    if (!result.success) {
      showError('Failed to check eligibility');
      return null;
    }

    const { eligible, reason, message, suggestions } = result.data;

    if (!eligible) {
      // Show error modal with suggestions
      showEligibilityError({
        title: 'Cannot Subscribe',
        message: message,
        suggestions: suggestions,
        currentQuota: result.data.currentSubscription
          ? `${result.data.currentSubscription.quotaUsed}/${result.data.currentSubscription.quotaLimit}`
          : null
      });
      return false;
    }

    // User is eligible - proceed to payment
    return true;
  } catch (error) {
    console.error('Eligibility check failed:', error);
    showError('Failed to check eligibility');
    return null;
  }
}

// Usage in plan selection flow
async function handlePlanSelection(plan) {
  // 1. Check eligibility first
  const isEligible = await checkEligibilityBeforePurchase(plan.id);

  if (isEligible === null) {
    // Error occurred
    return;
  }

  if (!isEligible) {
    // Not eligible - error already shown
    return;
  }

  // 2. User is eligible - proceed to payment
  if (plan.isFreePlan) {
    // Free plan - subscribe directly
    await subscribeToPlan(plan.id);
  } else {
    // Paid plan - initiate payment
    await initiatePayment(plan.id);
  }
}
```

---

## Use Cases

### 1. Plan Selection Page
Show eligibility status on each plan card:
```javascript
// Load plans with eligibility check
const plans = await getPlans();
for (const plan of plans) {
  const eligibility = await checkEligibility(plan.id);
  plan.eligibility = eligibility.data;
}
```

### 2. Before Payment Button Click
Check eligibility when user clicks "Subscribe":
```javascript
async function onSubscribeClick(planId) {
  const eligible = await checkEligibilityBeforePurchase(planId);
  if (eligible) {
    proceedToPayment(planId);
  }
}
```

### 3. Plan Details Page
Show eligibility information on plan details:
```javascript
const eligibility = await checkEligibility(planId);
if (!eligibility.data.eligible) {
  showWarningBanner(eligibility.data.message, eligibility.data.suggestions);
}
```

---

## Benefits

1. ✅ **Prevents wasted payments** - Users know eligibility before paying
2. ✅ **Clear error messages** - Actionable suggestions for users
3. ✅ **Better UX** - No surprises after payment
4. ✅ **Reduced support** - Fewer "why can't I subscribe?" tickets
5. ✅ **Quota transparency** - Users see their current usage
6. ✅ **Reusable logic** - Same validation as actual subscription

---

## Testing

### Test Scenarios

```bash
# 1. New user (no subscription)
GET /api/end-user/subscriptions/check-eligibility/123
# Expected: eligible=true, reason=NEW_SUBSCRIPTION

# 2. Free plan user upgrading to paid
GET /api/end-user/subscriptions/check-eligibility/124
# Expected: eligible=true, reason=FREE_PLAN_UPGRADE

# 3. Paid plan user with quota not exhausted
GET /api/end-user/subscriptions/check-eligibility/125
# Expected: eligible=false, reason=QUOTA_NOT_EXHAUSTED

# 4. Paid plan user with quota exhausted
GET /api/end-user/subscriptions/check-eligibility/126
# Expected: eligible=true, reason=UPGRADE_ALLOWED

# 5. User trying to get same free plan again
GET /api/end-user/subscriptions/check-eligibility/120
# Expected: eligible=false, reason=ALREADY_HAS_FREE_PLAN
```

---

## Notes

- Eligibility check is **read-only** - no database changes
- Uses same quota calculation logic as listing creation
- Reuses `quotaRepository.getUserQuotaUsage()` for accuracy
- Response always has `success: true` (errors are in `data.eligible`)
- Suggestions array provides actionable next steps for users
