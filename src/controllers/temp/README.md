# Temporary Controllers - Manual Payment Flow

⚠️ **DELETE THIS ENTIRE FOLDER WHEN PAYMENT GATEWAY IS IMPLEMENTED**

## Purpose

This folder contains temporary controllers for manual payment verification flow. All code in this folder is isolated and can be safely deleted when switching to automated payment gateway integration.

## Files

- `manualPaymentController.js` - Controller for manual payment operations

## What This Controller Does

1. **End User Subscription Creation** - Handles manual payment submission
2. **Admin List Subscriptions** - Lists subscriptions for verification with filters
3. **Admin Verify Payment** - Approves or rejects manual payments

## How to Remove

When implementing payment gateway:

1. **Delete this entire folder:**
   ```bash
   rm -rf src/controllers/temp/
   ```

2. **Update end-user subscription controller:**
   - File: `src/controllers/end-user/subscriptionController.js`
   - Remove import: `import ManualPaymentController from '#controllers/temp/manualPaymentController.js';`
   - In `subscribeToPlan()` method:
     - Comment out: `return ManualPaymentController.createManualSubscription(req, res);`
     - Uncomment the payment gateway section

3. **Remove route import:**
   - File: `src/routes/index.js`
   - Remove import: `import manualPaymentRoutes from './routes/temp/manualPaymentRoutes.js';`
   - Remove route: `router.use('/panel/manual-payments', manualPaymentRoutes);`

4. **Delete temp routes folder:**
   ```bash
   rm -rf src/routes/temp/
   ```

5. **Delete temp services folder:**
   ```bash
   rm -rf src/services/temp/
   ```

## Related Files to Clean Up

- `src/services/temp/manualPaymentService.js`
- `src/routes/temp/manualPaymentRoutes.js`
- `API-Docs/manual-payment-verification.md`
- `MANUAL-PAYMENT-IMPLEMENTATION.md`
- `MANUAL-PAYMENT-API-SUMMARY.md`

## Endpoints Provided

- `GET /api/panel/manual-payments/subscriptions` - List subscriptions for verification
- `POST /api/panel/manual-payments/verify/:id` - Verify or cancel subscription

These endpoints will be removed when this folder is deleted.
