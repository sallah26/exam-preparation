# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

### Server Configuration

```env
NODE_ENV=development
PORT=5000
```

### Database

```env
DATABASE_URL="mysql://user:password@localhost:3306/exam_portal_db"
```

### JWT Secrets

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

### Cookie Settings

```env
COOKIE_SECRET=your-super-secret-cookie-key-change-this-in-production
```

### Frontend URL

```env
FRONTEND_URL=http://localhost:3000
```

### **Email Configuration (NEW - Required for Phase 1)**

```env
# For Gmail (Recommended for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

SMTP_FROM=noreply@examportal.com
```

#### How to Get Gmail App Password:

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. At the bottom, click on "App passwords"
4. Select "Mail" and your device
5. Copy the generated 16-character password
6. Use this password in `SMTP_PASS`

#### Alternative SMTP Services:

- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587
- **AWS SES**: email-smtp.region.amazonaws.com:587

### Super Admin Initialization

```env
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=SuperAdmin@123
SUPER_ADMIN_NAME=Super Administrator
```

### File Upload

```env
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### CORS

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Email Service Features (Phase 1)

### Admin Invitation Email

- Automatically sent when super admin invites a new admin
- Contains temporary password
- Includes login link
- Beautiful HTML template

### Student Welcome Email

- Sent when student registers
- Welcomes them to the platform
- Includes login link
- Lists available features

### Email Service Notes:

- If SMTP credentials are not configured, emails will not be sent but the system will continue to work
- The system logs when emails fail but doesn't block user/admin creation
- For production, always use a proper SMTP service

## Testing Email Service

After setting up SMTP credentials, you can test the email service by:

1. Registering a new student account
2. Inviting a new admin (as super admin)
3. Check the console logs for email status
4. Check your email inbox for the messages

## Security Notes

⚠️ **IMPORTANT**:

- Never commit the `.env` file to version control
- Use strong, unique secrets for production
- Rotate JWT secrets regularly
- Use environment-specific configuration
- For production, use managed SMTP services (SendGrid, AWS SES, etc.)
