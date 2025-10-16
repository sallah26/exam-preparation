# Phase 1 Testing Guide - Admin Invitation System

## Overview

Phase 1 implements the Super Admin invitation system with email notifications.

## What's Been Implemented ✅

1. **Email Service** (`src/services/email.service.ts`)

   - Nodemailer integration
   - HTML email templates
   - Admin invitation emails
   - Student welcome emails

2. **Admin Invitation Service** (`src/services/admin-invitation.service.ts`)

   - Invite new admins
   - Generate secure passwords
   - List all admins
   - Toggle admin status
   - Delete admins

3. **Super Admin Middleware** (`src/middleware/super-admin.middleware.ts`)

   - Protect super admin routes
   - Admin role verification
   - User role verification

4. **API Endpoints**
   - `POST /api/super-admin/invite` - Invite new admin
   - `GET /api/super-admin/admins` - List all admins
   - `GET /api/super-admin/admins/:id` - Get admin details
   - `PUT /api/super-admin/admins/:id/toggle-status` - Activate/deactivate admin
   - `DELETE /api/super-admin/admins/:id` - Delete admin
   - `GET /api/super-admin/stats` - Get admin statistics

## Setup

### 1. Configure Environment Variables

Add to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=noreply@examportal.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 2. Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Use this in `SMTP_PASS`

### 3. Start the Server

```bash
npm run dev
```

## Testing the Admin Invitation Flow

### Step 1: Login as Super Admin

```bash
POST http://localhost:5000/api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "SuperAdmin@123"
}
```

Save the `accessToken` from the response.

### Step 2: Invite a New Admin

```bash
POST http://localhost:5000/api/super-admin/invite
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

{
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Admin invitation sent successfully",
  "admin": {
    "id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "..."
  },
  "temporaryPassword": "Ab12#Cd34$Ef56..."
}
```

**What Happens:**

1. ✅ New admin is created in database
2. ✅ Secure password is generated
3. ✅ Email is sent to john@example.com with credentials
4. ✅ Temporary password is returned in response (one-time view)

### Step 3: Check Email

The invited admin should receive an email with:

- Welcome message
- Login credentials (email + temporary password)
- Login link
- Security reminder to change password

### Step 4: Admin Login

The new admin can now login:

```bash
POST http://localhost:5000/api/auth/admin/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Ab12#Cd34$Ef56..."
}
```

### Step 5: List All Admins

```bash
GET http://localhost:5000/api/super-admin/admins
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "isSuperAdmin": false,
      "createdAt": "...",
      "updatedAt": "...",
      "createdBy": "super-admin-id",
      "creator": {
        "id": "...",
        "fullName": "Super Administrator",
        "email": "admin@example.com"
      }
    }
  ]
}
```

### Step 6: Toggle Admin Status

```bash
PUT http://localhost:5000/api/super-admin/admins/{admin-id}/toggle-status
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Step 7: Get Admin Statistics

```bash
GET http://localhost:5000/api/super-admin/stats
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "total": 2,
    "active": 2,
    "inactive": 0,
    "superAdmins": 1
  }
}
```

## Testing Student Registration with Welcome Email

### Register a New Student

```bash
POST http://localhost:5000/api/auth/user/register
Content-Type: application/json

{
  "name": "Alice Student",
  "email": "alice@example.com",
  "password": "SecurePass123!"
}
```

**What Happens:**

1. ✅ Student account is created
2. ✅ Welcome email is sent
3. ✅ Auto-login tokens are provided

### Check Welcome Email

The student should receive:

- Welcome message
- Platform features list
- Login link

## Common Issues & Solutions

### Issue 1: Email Not Sending

**Symptoms:** Admin is created but no email received

**Solutions:**

1. Check SMTP credentials in .env
2. Verify Gmail App Password (not regular password)
3. Check spam folder
4. Enable "Less secure app access" if using regular Gmail
5. Check console logs for email errors

### Issue 2: "Only super admins can invite new admins"

**Symptoms:** 403 error when inviting

**Solutions:**

1. Make sure you're logged in as super admin
2. Verify token is included in Authorization header
3. Check `isSuperAdmin` flag in database

### Issue 3: "An admin with this email already exists"

**Symptoms:** 400 error when inviting

**Solutions:**

1. Use a different email address
2. Check if email is already registered as admin or user
3. Delete existing admin if testing

### Issue 4: Invalid Token

**Symptoms:** 401 Unauthorized

**Solutions:**

1. Get fresh token by logging in again
2. Use correct header format: `Authorization: Bearer TOKEN`
3. Check token hasn't expired (15 minutes)

## Development Mode Notes

- If SMTP credentials are not set, the system will run in "mock mode"
- Emails won't be sent but the system will log "Mock email sent"
- This allows development without email setup
- Admin accounts are still created successfully

## Security Features Implemented

✅ Email validation (format check)  
✅ Duplicate email prevention (admin & user tables)  
✅ Secure password generation (16 characters, mixed types)  
✅ Password hashing (bcrypt)  
✅ Only super admins can invite admins  
✅ Cannot deactivate yourself  
✅ Cannot delete other super admins  
✅ One-time password display (security)  
✅ HTML email templates (professional)

## Next Steps (Phase 2)

Once testing is complete, move to Phase 2:

- Frontend UI for admin invitation
- Admin management dashboard
- Admin list with search/filter
- Status toggle UI
- Delete confirmation dialogs

## Postman Collection

Import this collection for easy testing:

```json
{
  "info": {
    "name": "Phase 1 - Admin Invitation",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Super Admin Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/auth/admin/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"admin@example.com\",\"password\":\"SuperAdmin@123\"}"
        }
      }
    },
    {
      "name": "Invite Admin",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/super-admin/invite",
        "header": [{ "key": "Authorization", "value": "Bearer {{token}}" }],
        "body": {
          "mode": "raw",
          "raw": "{\"fullName\":\"John Doe\",\"email\":\"john@example.com\"}"
        }
      }
    },
    {
      "name": "List Admins",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/super-admin/admins",
        "header": [{ "key": "Authorization", "value": "Bearer {{token}}" }]
      }
    }
  ]
}
```

## Success Criteria ✅

Phase 1 is complete when you can:

- [x] Setup email service with SMTP credentials
- [x] Login as super admin
- [x] Invite a new admin via API
- [x] Receive invitation email with credentials
- [x] New admin can login successfully
- [x] List all admins with creator info
- [x] Toggle admin status
- [x] View admin statistics
- [x] Students receive welcome email on registration

## Support

If you encounter issues:

1. Check console logs for detailed errors
2. Verify all environment variables are set
3. Test SMTP connection separately
4. Review this testing guide step-by-step
5. Check database for created records
