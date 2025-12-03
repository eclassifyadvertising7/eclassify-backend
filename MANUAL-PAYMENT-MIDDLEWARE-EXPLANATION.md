# Manual Payment Middleware - How It Works

## Question: How is the image being uploaded? Routes don't show middleware.

## Answer: Middleware is embedded in the controller as an array

### Current Implementation

**Route:** `src/routes/temp/manualPaymentRoutes.js`
```javascript
router.post(
  '/subscribe',
  authenticate,
  ManualPaymentController.createManualSubscription
);
```

**Controller:** `src/controllers/temp/manualPaymentController.js`
```javascript
static createManualSubscription = [
  uploadPaymentProof,  // ← Middleware runs first
  async (req, res) => {
    // ← Handler runs second
    // req.file is available here from uploadPaymentProof middleware
  }
];
```

### How Express Handles This

When you export an array from a controller, Express treats it as middleware chain:

```javascript
// This:
ManualPaymentController.createManualSubscription = [middleware1, middleware2, handler]

// Is equivalent to:
router.post('/path', middleware1, middleware2, handler)
```

### Execution Flow

1. **Request arrives:** `POST /api/manual-payments/subscribe`
2. **authenticate middleware** runs (from route)
3. **uploadPaymentProof middleware** runs (from controller array)
   - Multer processes multipart/form-data
   - Saves file to memory (Cloudinary) or disk (local)
   - Attaches `req.file` object
4. **Handler function** runs (from controller array)
   - Accesses `req.file`
   - Uploads to Cloudinary or gets local path
   - Creates subscription

### Alternative Pattern (Used in Listing Routes)

**Listing Route:**
```javascript
router.post('/media/:id', uploadListingMedia, ListingController.uploadMedia);
```

**Listing Controller:**
```javascript
static async uploadMedia(req, res) {
  // Just the handler, middleware is in route
}
```

### Both Patterns Are Valid

**Pattern 1: Middleware in Controller (Our Implementation)**
```javascript
// Route
router.post('/subscribe', authenticate, Controller.method);

// Controller
static method = [uploadMiddleware, async (req, res) => { ... }];
```

**Pros:**
- ✅ Middleware is close to the logic that uses it
- ✅ Easy to see what middleware a method needs
- ✅ Controller is self-contained

**Cons:**
- ❌ Less visible in route file
- ❌ Slightly less common pattern

**Pattern 2: Middleware in Route (Listing Implementation)**
```javascript
// Route
router.post('/upload', authenticate, uploadMiddleware, Controller.method);

// Controller
static async method(req, res) { ... }
```

**Pros:**
- ✅ All middleware visible in route file
- ✅ More common pattern
- ✅ Clearer request flow

**Cons:**
- ❌ Route file can get cluttered
- ❌ Middleware separated from logic

### Our Choice: Pattern 1 (Middleware in Controller)

**Reason:** Since this is temporary code in `temp/` folder, keeping everything self-contained in the controller makes it easier to delete later. You just delete the `temp/` folders and you're done.

### Verification

To verify the middleware is working:

1. **Check req.file exists:**
   ```javascript
   console.log('File received:', req.file);
   // Output: { fieldname: 'paymentProof', originalname: 'proof.jpg', ... }
   ```

2. **Test upload:**
   ```bash
   curl -X POST http://localhost:5000/api/manual-payments/subscribe \
     -H "Authorization: Bearer TOKEN" \
     -F "planId=1" \
     -F "upiId=test@paytm" \
     -F "transactionId=TEST123" \
     -F "paymentProof=@proof.jpg"
   ```

3. **Check file is processed:**
   - Cloudinary: Check dashboard for `eclassify_app/uploads/manual_payments/`
   - Local: Check `uploads/manual_payments/` folder

### Summary

✅ **Middleware IS being used** - it's in the controller as an array
✅ **This is a valid Express pattern** - arrays are treated as middleware chains
✅ **File upload works correctly** - uploadPaymentProof runs before handler
✅ **Pattern choice is intentional** - keeps temp code self-contained

**The implementation is correct!** The middleware just isn't visible in the route file because it's embedded in the controller.
