# API Endpoint Guide - Free Plan Subscriptions

## Correct Endpoint for Free Plans

### ✅ Use This Endpoint
```
POST /api/end-user/subscriptions
```

**For Free Plans:**
```json
{
  "planId": 123
}
```

**For Paid Plans:**
```json
{
  "planId": 456,
  "paymentData": {
    "paymentMethod": "razorpay",
    "transactionId": "pay_abc123xyz",
    "customerName": "John Doe",
    "customerMobile": "9876543210"
  }
}
```

---

## ❌ Don't Use This Endpoint for Free Plans
```
POST /api/manual-payments/create
```

This endpoint is **only for manual payment verification** (pending admin approval) and **blocks free plans**.

---

## Response Examples

### Free Plan Response (Instant Activation)
```json
{
  "success": true,
  "message": "Free plan activated successfully",
  "data": {
    "id": 123,
    "userId": 1,
    "planId": 10,
    "status": "active",
    "activatedAt": "2025-01-05T10:30:00.000Z",
    "endsAt": "2050-01-05T10:30:00.000Z",
    "planName": "Cars Free Plan",
    "planCode": "cars-free",
    "isFreePlan": true,
    "paymentMethod": "free_plan",
    "amountPaid": 0,
    "listingQuotaLimit": 3,
    "listingQuotaRollingDays": 30
  }
}
```

### Paid Plan Response (After Payment Verification)
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "id": 124,
    "userId": 1,
    "planId": 11,
    "status": "active",
    "activatedAt": "2025-01-05T10:35:00.000Z",
    "endsAt": "2025-02-05T10:35:00.000Z",
    "planName": "Cars Premium Plan",
    "planCode": "cars-premium",
    "isFreePlan": false,
    "paymentMethod": "razorpay",
    "amountPaid": 999,
    "listingQuotaLimit": 50,
    "listingQuotaRollingDays": 30
  }
}
```

---

## Error Responses

### Already Has Free Plan
```json
{
  "success": false,
  "message": "You already have an active free plan for this category",
  "data": null
}
```

### Quota Not Exhausted (Downgrade Attempt)
```json
{
  "success": false,
  "message": "Cannot downgrade to free plan. You have used 5 of 10 listings. Please exhaust your current quota first.",
  "data": null
}
```

### Quota Not Exhausted (Upgrade Attempt)
```json
{
  "success": false,
  "message": "Cannot upgrade. You have used 5 of 10 listings. Please exhaust your current quota before upgrading.",
  "data": null
}
```

---

## Frontend Integration Examples

### React/JavaScript Example

```javascript
// Subscribe to Free Plan
async function subscribeToFreePlan(planId) {
  try {
    const response = await fetch('/api/end-user/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        planId: planId
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('Free plan activated!', result.data);
      // Redirect to dashboard or show success message
    } else {
      console.error('Error:', result.message);
      // Show error message to user
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// Subscribe to Paid Plan
async function subscribeToPaidPlan(planId, paymentData) {
  try {
    const response = await fetch('/api/end-user/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        planId: planId,
        paymentData: {
          paymentMethod: 'razorpay',
          transactionId: paymentData.transactionId,
          customerName: paymentData.customerName,
          customerMobile: paymentData.customerMobile
        }
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('Paid plan activated!', result.data);
      // Redirect to dashboard or show success message
    } else {
      console.error('Error:', result.message);
      // Show error message to user
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// Generic function that handles both
async function subscribeToPlan(plan, paymentData = null) {
  const payload = { planId: plan.id };
  
  // Only add paymentData for paid plans
  if (!plan.isFreePlan && paymentData) {
    payload.paymentData = paymentData;
  }

  try {
    const response = await fetch('/api/end-user/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      // Handle success
      if (result.data.isFreePlan) {
        showSuccess('Free plan activated successfully!');
      } else {
        showSuccess('Subscription created successfully!');
      }
      return result.data;
    } else {
      // Handle error
      showError(result.message);
      return null;
    }
  } catch (error) {
    console.error('Request failed:', error);
    showError('Failed to subscribe. Please try again.');
    return null;
  }
}
```

---

## Testing with cURL

### Free Plan
```bash
curl -X POST http://localhost:5000/api/end-user/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "planId": 1
  }'
```

### Paid Plan
```bash
curl -X POST http://localhost:5000/api/end-user/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "planId": 2,
    "paymentData": {
      "paymentMethod": "razorpay",
      "transactionId": "pay_abc123xyz",
      "customerName": "John Doe",
      "customerMobile": "9876543210"
    }
  }'
```

---

## Summary

| Endpoint | Purpose | Free Plans | Paid Plans |
|----------|---------|------------|------------|
| `POST /api/end-user/subscriptions` | Subscribe to any plan | ✅ Instant activation | ✅ After payment verification |
| `POST /api/manual-payments/create` | Manual payment (admin approval) | ❌ Blocked | ✅ Pending approval |

**Key Points:**
- Use `/api/end-user/subscriptions` for **all subscriptions** (free and paid)
- Free plans activate **instantly** without payment data
- Paid plans require `paymentData` object
- Manual payment endpoint is **only for paid plans** requiring admin verification
