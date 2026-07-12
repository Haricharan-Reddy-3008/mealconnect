# ResQFood - Production-Ready Authentication & Verification System

## Overview

This document outlines all the real-world production features added to make ResQFood a enterprise-grade food donation platform with proper verification, tracking, and fraud prevention.

---

## 1. Database Model Changes

### User Model Updates (`src/models/User.js`)

Added production-level fields:

```javascript
// Email Verification
- emailVerified (Boolean) - Account must have verified email
- verificationToken (String) - Token for email verification (expires in 24hrs)
- verificationTokenExpires (Date)

// Role Verification (Restaurants & NGOs must be approved)
- verificationStatus (enum: pending, verified, rejected)
- verificationDocuments (Array) - Business license, registration, tax ID etc.
- rejectionReason (String) - Why verification was rejected

// Reputation & Trust System
- rating (Number 1-5) - Average rating from other users
- totalRatings (Number) - Count of ratings received
- foodsPosted (Number) - Lifetime food posts created
- foodsClaimed (Number) - Lifetime food claims made
- foodsCollected (Number) - Lifetime food collections completed

// Security
- isBanned (Boolean) - Account ban flag for violators
- banReason (String) - Why account was banned
- lastLogin (Date) - Timestamp of last login
- loginAttempts (Number) - Failed login counter (locks after 5)
- lockUntil (Date) - Account lockout until timestamp
```

### FoodPost Model Updates (`src/models/foodPost.js`)

Enhanced tracking and audit trail:

```javascript
// Detailed Status Workflow
- status (enum: available, claimed, in_transit, collected, expired, rejected)

// Claim History
- claimHistory (Array) - Complete audit trail of who claimed when and what action
  - ngoId, action, timestamp, reason

// Collection Tracking
- collectionStartedAt (Date) - When restaurant marked as in-transit
- collectionProof (Object) - Photo + timestamp proof of collection

// Verification
- isVerified (Boolean) - Food post only created by verified restaurants
```

### New Models Created

#### Rating Model (`src/models/Rating.js`)

- Tracks ratings between users after transactions
- Fields: ratedUserId, raterUserId, foodPostId, rating (1-5), review
- Criteria: foodQuality, timeliness, behavior

#### AuditLog Model (`src/models/AuditLog.js`)

- Logs EVERY action for compliance and fraud detection
- Fields: userId, action, resource, status, errorMessage, ipAddress, userAgent
- Indexed for fast queries

#### Admin Model (`src/models/Admin.js`)

- Defines admin roles and permissions
- Roles: super_admin, moderator, verifier
- Tracks: verifications, bans, activity

---

## 2. Authentication Enhancements

### Enhanced Auth Controller (`src/controllers/authController.js`)

#### Registration Flow

```
1. User registers with email, password, role
2. System generates verification token (valid 24 hours)
3. Email sent with verification link
4. User must click link to verify email
5. If role is "restaurant" or "ngo", status set to "pending" (needs admin approval)
6. User cannot create/claim food until fully verified
```

#### Login Security

```
1. Email verification required - if not verified, login blocked
2. Role verification required - if pending/rejected, login blocked
3. Account ban check - banned users cannot login
4. Login attempt tracking - after 5 failed attempts, account locked for 30 minutes
5. lastLogin timestamp updated on success
6. loginAttempts reset to 0
```

### Verification Middleware (`src/middlewares/verificationMiddleware.js`)

New middleware functions that check before operations:

- `checkEmailVerified` - Require email verification
- `checkRoleVerified` - Require admin approval for restaurants/NGOs
- `checkNotBanned` - Prevent banned users from operations
- `onlyRestaurant` - Only restaurants can create food
- `onlyNGO` - Only NGOs can claim food
- `auditLog` - Logs all actions for audit trail

---

## 3. Real-World Claim Workflow

### Old Flow (Direct Claiming)

```
NGO clicks "Claim" → Food marked as claimed → Done
(No verification, no tracking, anyone could claim)
```

### New Flow (Request-Based)

```
1. NGO views nearby food (must be email verified + role verified)
2. NGO clicks "Claim Food"
3. Status changes to "claimed"
4. Emails sent to both restaurant and NGO
5. Restaurant marks as "in_transit" when pickup starts
6. NGO marks as "collected" when food received
7. System can request ratings from both parties
8. Complete audit trail logged
```

### API Endpoints

#### Food Creation

```
POST /api/food/createfood
- Requires: authMiddleware, email verified, role verified, not banned, restaurant role
- Creates food post only if restaurant is verified
- Validates expiry time is in future
- Increments restaurant's foodsPosted counter
```

#### Claim Request

```
PATCH /api/food/:id/claim
- Requires: authMiddleware, email verified, role verified, not banned, NGO role
- Changes status to "claimed"
- Sends email to restaurant and NGO
- Logs audit trail
- Increments NGO's foodsClaimed counter
```

#### Mark In-Transit

```
PATCH /api/food/:foodId/in-transit
- Requires: restaurant owner only
- Changes status from "claimed" to "in_transit"
- Notifies NGO food is on the way
```

#### Mark Collected

```
PATCH /api/food/:foodId/collected
- Requires: NGO who claimed it
- Changes status to "collected"
- Increments NGO's foodsCollected counter
- Sends completion emails
- Allows rating system to work
```

#### Reject Claim

```
PATCH /api/food/:foodId/reject
- Requires: restaurant owner
- Reverts status back to "available"
- Notifies NGO of rejection with reason
- Food becomes available for other NGOs
```

---

## 4. Verification & Admin Features

### Verification Controller (`src/controllers/verificationController.js`)

#### Email Verification

```
POST /api/verification/send-verification-email
- Sends email with 24-hour verification link
- User clicks link and email is verified

GET /api/verification/verify-email/:token
- Called when user clicks email link
- Verifies token, marks emailVerified as true
```

#### Role Verification (KYC - Know Your Customer)

```
POST /api/verification/upload-verification-documents
- NGOs and restaurants upload:
  - Business license
  - Tax registration
  - Organization certificate
  - Proof of address
- Status set to "pending" for admin review
- Takes 24-48 hours for approval

GET /api/verification/verification-status
- Returns: emailVerified, verificationStatus, documents, ban status
```

#### Admin Dashboard

```
GET /api/verification/pending-verifications
- Lists all pending restaurant/NGO verifications

PATCH /api/verification/approve-verification/:userId
- Admin approves restaurant/NGO
- Status changed to "verified"
- Verification email sent
- User can now create/claim food

PATCH /api/verification/reject-verification/:userId
- Admin rejects verification
- Status changed to "rejected"
- Reason provided to user
- User can reapply
```

---

## 5. Rating & Reputation System

### Rating System

```
POST /api/verification/rate-user
- After successful food collection, users can rate each other
- Rate on: foodQuality, timeliness, behavior
- Ratings are 1-5 stars
- Reviews can include comments

GET /api/verification/user-rating/:userId
- Returns user's average rating
- Shows all ratings and reviews
- Displays food posts/claims/collections stats
```

### Reputation Score Calculation

```
User.rating = Average of all Rating.rating values
User.totalRatings = Count of Rating documents

Low rating users can be banned for:
- Multiple < 2 star ratings
- Violations reported by other users
- Food quality issues
- No-show claims
```

---

## 6. Audit Trail & Compliance

### Every Action Logged

```
ALL of these create AuditLog entries:
- User registration
- Email verification
- Document upload
- Admin approval/rejection
- Food post creation/deletion
- Claim requests
- Status changes (in_transit, collected)
- Collection proof upload
- User ratings
- Ban actions
```

### Audit Log Data

```
{
  userId: ObjectId,
  action: "food_post_created",
  resource: "FoodPost",
  resourceId: foodId,
  details: { before, after },
  ipAddress: "192.168.x.x",
  userAgent: "Mozilla/5.0...",
  status: "success" | "failure",
  errorMessage: "optional error",
  createdAt: timestamp
}
```

### Compliance Benefits

- **Fraud Detection**: Track suspicious patterns
- **Dispute Resolution**: Complete history of who did what
- **Accountability**: Every action tied to user + IP
- **GDPR Compliance**: User activity can be exported
- **Performance**: Can identify problem users quickly

---

## 7. Security Features

### Account Lockout

```
After 5 failed login attempts:
- Account locked for 30 minutes
- User gets lockout notification email
- Only way to unlock is wait 30 mins or reset password
```

### Email Verification

```
Required before:
- Creating food posts (restaurants)
- Claiming food (NGOs)
- Accessing most features
```

### Role Verification

```
Restaurants:
- Must upload business license/tax ID
- Admin must approve (24-48 hrs)
- Can only create food posts if verified
- Only then can restaurants see their posts claimed

NGOs:
- Must upload organization registration
- Admin must approve
- Can only claim food if verified
- Protection from fake NGOs
```

### Ban System

```
Admin can ban users for:
- Multiple low ratings (pattern of bad behavior)
- Fraud/scam attempts
- No-show food pickups
- Harassing other users
- Violating platform terms

Banned users:
- Cannot login
- Cannot create/claim food
- Cannot access any features
```

---

## 8. Database Indexes

All models have appropriate indexes:

```javascript
// User
userSchema.index({ location: "2dsphere" });
userSchema.index({ verificationStatus: 1 });
userSchema.index({ isBanned: 1 });

// FoodPost
foodPostSchema.index({ location: "2dsphere" });
foodPostSchema.index({ status: 1 });
foodPostSchema.index({ restaurantId: 1 });
foodPostSchema.index({ claimedBy: 1 });

// AuditLog
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resourceId: 1 });
```

---

## 9. Error Handling

All endpoints return proper HTTP status codes:

```
401 - Not authenticated
403 - Forbidden (not email verified, not role verified, not authorized)
404 - Not found
400 - Bad request (validation errors)
423 - Account locked (too many login attempts)
500 - Server error
```

---

## 10. Email Templates

System sends emails for:

- Email verification link
- Role verification approval/rejection
- Food claim notifications
- Food collection notifications
- Account ban notifications
- Account lockout notifications
- Rating requests

---

## 11. Environment Variables Needed

```env
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for verification links)
FRONTEND_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your-secret-key

# Mapbox Token
MAPBOX_ACCESS_TOKEN=pk_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017

# Environment
NODE_ENV=development
```

---

## 12. Frontend Changes Needed

### New Pages/Features

1. **Email Verification Page** (`/verify-email/:token`)
   - Shows "Verifying..." spinner
   - Calls `GET /api/verification/verify-email/:token`
   - Redirects to dashboard on success

2. **Verification Documents Page**
   - For restaurants/NGOs to upload documents
   - Shows verification status
   - Shows rejection reason if any

3. **User Rating Component**
   - After collection completed
   - Rate the other party (1-5 stars)
   - Leave review comment
   - POST to `/api/verification/rate-user`

4. **User Profile Rating Display**
   - Show average rating badge
   - List all ratings/reviews received
   - Stats: foods posted/claimed/collected

5. **Admin Dashboard** (New)
   - List pending verifications
   - Approve/reject buttons
   - View audit logs
   - Ban users

### API Calls to Update

```javascript
// Registration
POST /api/auth/register
- Now returns emailVerified: false, verificationStatus: "pending"
- User must verify email before using app

// Login
POST /api/auth/login
- Returns error if email not verified
- Returns error if role not verified
- Returns error if account banned

// Food Creation
POST /api/food/createfood
- Now requires email verified + role verified
- Only restaurants can call

// Claim Food
PATCH /api/food/:id/claim
- Only NGOs can call
- Requires email verified + role verified
```

---

## 13. Implementation Checklist

- ✅ Database models updated with verification fields
- ✅ Auth controller with email verification flow
- ✅ Auth controller with login security (attempts, lockout)
- ✅ Verification controller with KYC endpoints
- ✅ Rating controller for reputation system
- ✅ Audit logging on all actions
- ✅ Verification middleware applied to all sensitive endpoints
- ✅ Role-based access control (restaurants vs NGOs)
- ✅ Enhanced food workflow (claimed → in_transit → collected)
- ✅ Food routes updated with middleware checks
- ✅ Verification routes created
- ✅ Email templates enhanced

---

## 14. How This Makes It Production-Ready

### Before (Development)

- Anyone could register as restaurant AND claim food
- No verification of restaurant legitimacy
- No tracking of who claimed what
- No consequences for bad actors
- Direct claiming with no accountability

### After (Production)

- Strict email verification required
- Restaurants must upload business docs for admin approval
- NGOs must upload registration for admin approval
- Complete audit trail of every action
- Rating system identifies bad actors
- Multi-step claim workflow ensures accountability
- Account lockouts prevent brute force attacks
- Ban system removes problem users
- Admin oversight and moderation tools

---

## 15. Security Best Practices Implemented

1. **Email Verification** - Ensures real email addresses
2. **Admin Approval** - Human verification of restaurants/NGOs
3. **Account Lockout** - Prevents brute force login attacks
4. **Audit Logging** - Complete accountability trail
5. **Role-Based Access** - Restaurants can't claim, NGOs can't post
6. **IP Tracking** - Detect fraudulent access patterns
7. **Ban System** - Remove bad actors from platform
8. **Rating System** - Reputation/trust building

---

## Testing the System

### Test User Flow

#### 1. Register Restaurant

```
1. Sign up as "Restaurant" role
2. Verify email (check inbox)
3. Upload business documents
4. Wait for admin approval
5. Can now create food posts
```

#### 2. Register NGO

```
1. Sign up as "NGO" role
2. Verify email (check inbox)
3. Upload organization docs
4. Wait for admin approval
5. Can now view and claim food
```

#### 3. Create & Claim Food

```
1. Restaurant creates food post
2. NGO sees food in nearby feed
3. NGO clicks "Claim"
4. Email sent to both parties
5. Both can track status
6. Restaurant marks "in-transit"
7. NGO marks "collected"
8. Both can rate each other
```

#### 4. Admin Dashboard

```
1. Admin views pending verifications
2. Reviews uploaded documents
3. Approves or rejects with reason
4. User gets email notification
```

---

## Deployment Considerations

1. **Email Service** - Configure real SMTP (Gmail, SendGrid, Mailgun)
2. **Database** - Use production MongoDB (MongoDB Atlas)
3. **Admin Panel** - Build UI for verification dashboard
4. **Environment Variables** - Secure storage in production
5. **Rate Limiting** - Add to prevent API abuse
6. **HTTPS** - Required for production
7. **Backups** - Regular database backups
8. **Monitoring** - Monitor audit logs for suspicious activity

---

## Future Enhancements

1. **Two-Factor Authentication (2FA)** - Extra security for sensitive operations
2. **Machine Learning** - Detect fraudulent patterns automatically
3. **SMS Verification** - As alternative to email
4. **Background Checks** - For restaurants/NGOs
5. **Document OCR** - Automatic document verification
6. **Payment Processing** - If monetization planned
7. **Insurance** - For food liability coverage
8. **Analytics Dashboard** - Impact metrics and reporting

---

This authentication system transforms ResQFood from a demo app into a real, production-ready platform with proper security, verification, and accountability measures.
