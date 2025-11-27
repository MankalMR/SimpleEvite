# 📧 Email Notifications - Complete Guide

**Simple Evite Email Notification System**

This guide covers setup, architecture, and usage of the email notification system that automatically sends event reminders to guests.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [System Architecture](#system-architecture)
3. [How It Works](#how-it-works)
4. [Setup Instructions](#setup-instructions)
5. [Production Deployment](#production-deployment)
6. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
7. [Technical Reference](#technical-reference)

---

## 🚀 Quick Start

### Prerequisites
- Resend account (free tier: 3,000 emails/month)
- Domain for sending emails: `mankala.space`
- Vercel hosting (for cron jobs)

### 5-Minute Setup

1. **Get Resend API Key**
   - Sign up at [resend.com](https://resend.com)
   - Create API key
   - Copy key (starts with `re_`)

2. **Add Environment Variables**

```bash
# .env.local
RESEND_API_KEY=re_your_api_key_here
NOTIFICATION_SENDER_EMAIL=Simple Evite <evite@mankala.space>
NOTIFICATION_SENDER_NAME=Simple Evite
NOTIFICATION_REPLY_TO_EMAIL=manohar.mankala@gmail.com
CRON_SECRET=$(openssl rand -base64 32)
```

3. **Run Database Migration**

```bash
# Option 1: Supabase CLI
supabase db push

# Option 2: Supabase Dashboard
# Open supabase/migrations/add_notification_fields.sql
# Copy and paste into SQL Editor
# Click RUN
```

4. **Add DNS Records** (for custom domain)

In your DNS provider for `mankala.space`:

```
Type: TXT
Name: resend._domainkey
Value: (copy from Resend dashboard)

Type: TXT  
Name: @
Value: v=spf1 include:amazonses.com ~all

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
```

5. **Deploy to Vercel**

Add env vars to Vercel Dashboard, then deploy.

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        EMAIL NOTIFICATION SYSTEM                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Guest     │      │  Organizer   │      │   System    │
│   (Public)  │      │  (Dashboard) │      │   (Cron)    │
└──────┬──────┘      └──────┬───────┘      └──────┬──────┘
       │                    │                     │
       │ 1. RSVP            │                     │
       │ + Email            │                     │
       │ + Opt-in           │                     │
       │                    │                     │
       ↓                    │                     │
┌──────────────┐            │                     │
│  RSVP API    │            │                     │
│  Validates   │            │                     │
│  & Saves     │            │                     │
└──────┬───────┘            │                     │
       │                    │                     │
       ↓                    │                     │
┌──────────────┐            │                     │
│   Database   │←───────────┤ 2. View Status     │
│   Supabase   │            │                     │
└──────┬───────┘            │                     │
       │                    │                     │
       │                    │    ┌────────────────┤
       │                    │    │ 3. Daily @ 9AM │
       │                    │    │                │
       ↓                    │    ↓                │
┌──────────────┐            │ ┌──────────────────┐│
│  Cron Job    │←───────────┴─┤  Vercel Cron     ││
│  Endpoint    │              │  (Scheduler)     ││
│  /api/cron   │              └──────────────────┘│
└──────┬───────┘                                   │
       │                                           │
       │ 4. Find events 2-3 days away             │
       │ 5. Get pending RSVPs                     │
       │                                           │
       ↓                                           │
┌──────────────┐                                   │
│ Email        │                                   │
│ Service      │                                   │
│ (Resend)     │                                   │
└──────┬───────┘                                   │
       │                                           │
       │ 6. Send beautiful HTML email             │
       │                                           │
       ↓                                           │
┌──────────────┐                                   │
│   Guest      │                                   │
│   Inbox      │ ← 📧 Event Reminder!             │
└──────────────┘                                   │
       │                                           │
       │ 7. Log delivery status                   │
       │                                           │
       ↓                                           │
┌──────────────┐                                   │
│ Notification │                                   │
│ Logs Table   │                                   │
└──────────────┘                                   │
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────────────┐       │
│  │  RSVP Form      │         │  Organizer Dashboard    │       │
│  │  /invite/[id]   │         │  /invitations/[id]      │       │
│  ├─────────────────┤         ├─────────────────────────┤       │
│  │ • Name          │         │ • Guest List            │       │
│  │ • Response      │         │ • Notification Status   │       │
│  │ • Email (NEW)   │         │ • Reminder Sent Date    │       │
│  │ • Opt-in (NEW)  │         │ • Email Addresses       │       │
│  └─────────────────┘         └─────────────────────────┘       │
│         │                              │                        │
└─────────┼──────────────────────────────┼────────────────────────┘
          │                              │
          ↓                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐      ┌────────────────────────────┐   │
│  │  /api/rsvp          │      │  /api/cron/send-reminders  │   │
│  │  POST               │      │  GET                       │   │
│  ├─────────────────────┤      ├────────────────────────────┤   │
│  │ • Validate email    │      │ • Auth check (CRON_SECRET) │   │
│  │ • Sanitize input    │      │ • Find upcoming events     │   │
│  │ • Save to DB        │      │ • Find pending RSVPs       │   │
│  │ • Set status        │      │ • Send emails              │   │
│  └─────────────────────┘      │ • Update status            │   │
│                               │ • Log results              │   │
│                               └────────────────────────────┘   │
│                                        │                        │
└────────────────────────────────────────┼────────────────────────┘
                                         │
                                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │  Email Service (src/lib/email-service.ts)        │          │
│  ├──────────────────────────────────────────────────┤          │
│  │ • prepareReminderData()                          │          │
│  │ • sendEventReminderEmail()                       │          │
│  │ • generateReminderEmailHTML() - Beautiful design │          │
│  │ • generateReminderEmailText() - Plain text       │          │
│  └──────────────────────────────────────────────────┘          │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐      ┌──────────────────────────┐          │
│  │  RSVPs Table   │      │  Notification Logs       │          │
│  ├────────────────┤      ├──────────────────────────┤          │
│  │ • email        │      │ • rsvp_id                │          │
│  │ • notification │      │ • notification_type      │          │
│  │   _preferences │      │ • recipient              │          │
│  │ • reminder     │      │ • status                 │          │
│  │   _sent_at     │      │ • provider_response      │          │
│  │ • reminder     │      │ • error_message          │          │
│  │   _status      │      │ • sent_at                │          │
│  └────────────────┘      └──────────────────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐                        │
│  │   Resend     │      │ Vercel Cron  │                        │
│  │   (Email)    │      │ (Scheduler)  │                        │
│  └──────────────┘      └──────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 How It Works

### User Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                      GUEST RSVP FLOW                            │
└────────────────────────────────────────────────────────────────┘

START
  │
  ↓
┌────────────────────┐
│ Guest receives     │
│ invitation link    │
└──────┬─────────────┘
       │
       ↓
┌────────────────────┐
│ Opens public page  │
│ /invite/[token]    │
└──────┬─────────────┘
       │
       ↓
┌────────────────────┐
│ Fills RSVP form:   │
│ • Name             │
│ • Response         │
│ • Comment          │
└──────┬─────────────┘
       │
       ↓
     [Response = "Yes"?]
       │
  ┌────┴────┐
  │ No      │ Yes
  │         │
  ↓         ↓
Skip    ┌────────────────────┐
email   │ Shows email fields:│
        │ • Email input      │
        │ • Opt-in checkbox  │
        └──────┬─────────────┘
               │
               ↓
         [Email provided?]
               │
          ┌────┴────┐
          │ No      │ Yes
          │         │
          ↓         ↓
       Skip    ┌────────────────────┐
       email   │ • Save email       │
               │ • Set preferences  │
               │ • Set status:      │
               │   "pending"        │
               └──────┬─────────────┘
                      │
  ┌───────────────────┘
  │
  ↓
┌────────────────────┐
│ Submit RSVP        │
│ to API             │
└──────┬─────────────┘
       │
       ↓
┌────────────────────┐
│ Save to database   │
└──────┬─────────────┘
       │
       ↓
┌────────────────────┐
│ Show confirmation  │
└────────────────────┘
       │
       ↓
     END

┌────────────────────────────────────────────────────────────────┐
│                    REMINDER SENDING FLOW                        │
└────────────────────────────────────────────────────────────────┘

START (Daily @ 9 AM UTC)
  │
  ↓
┌────────────────────┐
│ Vercel Cron        │
│ triggers GET       │
│ /api/cron/send-    │
│ reminders          │
└──────┬─────────────┘
       │
       ↓
┌────────────────────┐
│ Verify auth        │
│ CRON_SECRET        │
└──────┬─────────────┘
       │
       ↓
    [Valid?]
       │
  ┌────┴────┐
  │ No      │ Yes
  │         │
  ↓         ↓
Return  ┌────────────────────┐
401     │ Calculate dates:   │
        │ today + 2 days     │
        │ today + 3 days     │
        └──────┬─────────────┘
               │
               ↓
        ┌────────────────────┐
        │ Query invitations  │
        │ with event_date    │
        │ in 2-3 day range   │
        └──────┬─────────────┘
               │
               ↓
          [Found events?]
               │
          ┌────┴────┐
          │ No      │ Yes
          │         │
          ↓         ↓
       Return  ┌────────────────────┐
       empty   │ For each event:    │
               │ Get RSVPs where:   │
               │ • response = "yes" │
               │ • status = "pending"│
               │ • email IS NOT NULL│
               └──────┬─────────────┘
                      │
                      ↓
                 [Found RSVPs?]
                      │
                 ┌────┴────┐
                 │ No      │ Yes
                 │         │
                 ↓         ↓
              Next     ┌────────────────────┐
              event    │ For each RSVP:     │
                       │                    │
                       │ 1. Prepare data    │
                       │ 2. Send email      │
                       │    via Resend      │
                       └──────┬─────────────┘
                              │
                              ↓
                         [Email sent?]
                              │
                         ┌────┴────┐
                         │ Failed  │ Success
                         │         │
                         ↓         ↓
                  ┌──────────┐  ┌──────────┐
                  │ Update   │  │ Update   │
                  │ status:  │  │ status:  │
                  │ "failed" │  │ "sent"   │
                  └────┬─────┘  └────┬─────┘
                       │             │
                       │             │ Set
                       │             │ reminder
                       │             │ _sent_at
                       │             │
                       └─────┬───────┘
                             │
                             ↓
                      ┌──────────────┐
                      │ Insert into  │
                      │ notification │
                      │ _logs table  │
                      └──────┬───────┘
                             │
                             ↓
                      [More RSVPs?]
                             │
                        ┌────┴────┐
                        │ Yes     │ No
                        │         │
                        └→Loop    ↓
                          back  [More events?]
                                  │
                             ┌────┴────┐
                             │ Yes     │ No
                             │         │
                             └→Loop    ↓
                               back  Return
                                     results
                                       │
                                       ↓
                                     END
```

### Data Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    DATA LIFECYCLE                               │
└────────────────────────────────────────────────────────────────┘

1. RSVP SUBMISSION
━━━━━━━━━━━━━━━━━━
Guest Input:
{
  name: "John Doe",
  response: "yes",
  comment: "Looking forward!",
  email: "john@example.com",
  emailNotifications: true
}
       │
       ↓
API Processing:
• Validate email format
• Sanitize inputs
• Transform to DB format
       │
       ↓
Database Write:
{
  invitation_id: "uuid-1",
  name: "John Doe",
  response: "yes",
  comment: "Looking forward!",
  email: "john@example.com",
  notification_preferences: {"email": true},
  reminder_status: "pending",      ← Set to pending
  reminder_sent_at: null,          ← Not sent yet
  created_at: "2024-11-18T10:30:00Z"
}


2. REMINDER PROCESSING (2 days before event)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cron Query:
SELECT * FROM rsvps r
JOIN invitations i ON r.invitation_id = i.id
WHERE i.event_date BETWEEN '2024-11-20' AND '2024-11-21'
  AND r.response = 'yes'
  AND r.reminder_status = 'pending'
  AND r.email IS NOT NULL;
       │
       ↓
Email Service:
{
  to: "john@example.com",
  from: "Simple Evite <evite@mankala.space>",
  replyTo: "manohar.mankala@gmail.com",
  subject: "Reminder: Birthday Party is coming up soon! 🎉",
  html: "<beautiful-html-template>",
  text: "Plain text fallback"
}
       │
       ↓
Resend API Response:
{
  data: {
    id: "6c8ba953-56c6-4a99-a2be-af73c82439af"
  },
  error: null
}
       │
       ↓
Database Update (rsvps):
{
  reminder_status: "sent",         ← Updated
  reminder_sent_at: "2024-11-18T09:00:00Z"  ← Timestamp added
}
       │
       ↓
Database Insert (notification_logs):
{
  id: "uuid-new",
  rsvp_id: "uuid-rsvp",
  invitation_id: "uuid-1",
  notification_type: "email",
  recipient: "john@example.com",
  status: "sent",
  provider_response: {
    data: { id: "6c8ba953..." },
    error: null,
    headers: { ... }
  },
  error_message: null,
  sent_at: "2024-11-18T09:00:15Z"
}


3. ORGANIZER DASHBOARD VIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━
Query Results:
{
  name: "John Doe",
  response: "yes",
  email: "john@example.com",
  reminder_status: "sent",
  reminder_sent_at: "2024-11-18T09:00:00Z"
}
       │
       ↓
UI Display:
┌─────────────────────────────────────┐
│ John Doe                            │
│ ✓ Attending  📧 Reminder Sent       │
│ john@example.com                    │
│ Reminded Nov 18, 2024 9:00 AM      │
│ "Looking forward!"                  │
└─────────────────────────────────────┘
```

---

## 📖 Setup Instructions

### Step 1: Resend Account Setup

1. **Create Account**
   - Go to [resend.com](https://resend.com)
   - Sign up for free account
   - Verify email

2. **Generate API Key**
   - Navigate to **API Keys** in dashboard
   - Click **Create API Key**
   - Name: "Simple Evite Production"
   - Permissions: **Sending access**
   - Copy the key (starts with `re_`)

3. **Add Root Domain**
   - Go to **Domains** → **Add Domain**
   - Enter: `mankala.space` (root domain)
   - Resend will show DNS records
   - Keep this page open

### Step 2: DNS Configuration

**Why Root Domain?**
- Works for all apps (`evite@mankala.space`, `options@mankala.space`)
- Best deliverability
- No conflicts with web routing
- One-time setup

**Add these records in your DNS provider:**

```
┌──────────────────────────────────────────────────────┐
│ DKIM (Required for Email Authentication)             │
├──────────────────────────────────────────────────────┤
│ Type:  TXT                                           │
│ Name:  resend._domainkey                             │
│ Value: p=MIGfMA0GCS... (copy from Resend)           │
│ TTL:   Auto                                          │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ SPF (Authorizes Amazon SES to send for you)         │
├──────────────────────────────────────────────────────┤
│ Type:  TXT                                           │
│ Name:  @ (or leave blank for root)                  │
│ Value: v=spf1 include:amazonses.com ~all            │
│ TTL:   Auto                                          │
│                                                      │
│ NOTE: If you have existing SPF record, merge:       │
│ v=spf1 include:_spf.google.com include:amazonses... │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ DMARC (Email policy, recommended)                   │
├──────────────────────────────────────────────────────┤
│ Type:  TXT                                           │
│ Name:  _dmarc                                        │
│ Value: v=DMARC1; p=none;                            │
│ TTL:   Auto                                          │
└──────────────────────────────────────────────────────┘
```

**Verify Domain:**
- Wait 5-10 minutes for DNS propagation
- In Resend, click **Verify**
- Should show green checkmarks ✓

### Step 3: Database Migration

**Option A: Supabase CLI**

```bash
cd simple-evite
supabase db push
```

**Option B: Manual (Supabase Dashboard)**

1. Open `supabase/migrations/add_notification_fields.sql`
2. Copy entire contents
3. Go to Supabase Dashboard → SQL Editor
4. Paste and click **RUN**

**Verify Migration:**

```sql
-- Check new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'rsvps'
  AND column_name IN ('email', 'notification_preferences', 'reminder_sent_at', 'reminder_status');

-- Check new table
SELECT * FROM information_schema.tables 
WHERE table_name = 'notification_logs';
```

### Step 4: Environment Variables

**Local Development (`.env.local`):**

```bash
# Resend API Key
RESEND_API_KEY=re_your_actual_api_key_here

# Email Configuration
NOTIFICATION_SENDER_EMAIL=Simple Evite <evite@mankala.space>
NOTIFICATION_SENDER_NAME=Simple Evite
NOTIFICATION_REPLY_TO_EMAIL=manohar.mankala@gmail.com

# Cron Security (generate with: openssl rand -base64 32)
CRON_SECRET=your_generated_secret_here
```

**Generate CRON_SECRET:**

```bash
openssl rand -base64 32
# Example output: xK8mP9vR2nL5qW7jT3fH6yB1cA4dE8gN0sU2iO9pM7=
# Use this value for CRON_SECRET
```

### Step 5: Test Locally

**1. Restart Dev Server:**

```bash
npm run dev
```

**2. Create Test Event:**
- Set event date to **2 days from today**
- Save invitation
- Copy public link

**3. Submit Test RSVP:**
- Open link in incognito mode
- RSVP "Yes"
- Enter your email
- Check "Send me email reminders"
- Submit

**4. Manually Trigger Cron:**

```bash
curl -X GET http://localhost:3008/api/cron/send-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**5. Check Email:**
- You should receive a beautiful reminder email!

**6. Verify Database:**

```sql
-- Check RSVP was updated
SELECT 
  name, 
  email, 
  reminder_status, 
  reminder_sent_at
FROM rsvps
WHERE email IS NOT NULL
ORDER BY created_at DESC;

-- Check notification log
SELECT *
FROM notification_logs
ORDER BY sent_at DESC
LIMIT 1;
```

---

## 🚀 Production Deployment

### Vercel Setup

**1. Add Environment Variables**

In Vercel Dashboard → Project → Settings → Environment Variables:

```
RESEND_API_KEY
NOTIFICATION_SENDER_EMAIL
NOTIFICATION_SENDER_NAME
NOTIFICATION_REPLY_TO_EMAIL
CRON_SECRET
```

**2. Configure Vercel Cron**

The `vercel.json` file is already configured:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs daily at 9 AM UTC.

**✅ Vercel Cron is FREE on Hobby plan!**
- 2 cron jobs included
- Daily execution
- Timing may vary ±1 hour
- Perfect for event reminders

**3. Deploy**

```bash
git add .
git commit -m "Add email notifications"
git push
```

Vercel will automatically:
- Deploy your code
- Set up the cron job
- Start sending reminders!

**4. Verify Production**

Test the production endpoint:

```bash
curl -X GET https://evite.mankala.space/api/cron/send-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📊 Monitoring & Troubleshooting

### Monitoring Queries

**Daily Summary:**

```sql
SELECT
  DATE(sent_at) as date,
  status,
  COUNT(*) as count
FROM notification_logs
WHERE sent_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(sent_at), status
ORDER BY date DESC;
```

**Failed Notifications:**

```sql
SELECT
  recipient,
  error_message,
  provider_response,
  sent_at
FROM notification_logs
WHERE status = 'failed'
  AND sent_at >= NOW() - INTERVAL '7 days'
ORDER BY sent_at DESC;
```

**Pending Reminders:**

```sql
SELECT
  i.title,
  i.event_date,
  COUNT(*) as pending_count
FROM rsvps r
JOIN invitations i ON r.invitation_id = i.id
WHERE r.reminder_status = 'pending'
  AND r.response = 'yes'
  AND r.email IS NOT NULL
GROUP BY i.id, i.title, i.event_date
ORDER BY i.event_date;
```

### Common Issues

**❌ Emails not sending**

**Symptoms:** `sentCount: 0` in cron response

**Check:**
1. Is `RESEND_API_KEY` set correctly?
2. Is domain verified in Resend? (green checkmarks)
3. Are there RSVPs with `reminder_status = 'pending'`?
4. Is event date in 2-3 day range?

**Debug:**
```bash
# Test Resend API directly
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Simple Evite <evite@mankala.space>",
    "to": "your-email@example.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

**❌ Cron not running**

**Symptoms:** No activity in logs

**Check:**
1. Is `CRON_SECRET` set in Vercel?
2. Is `vercel.json` deployed?
3. Check Vercel Logs → Functions

**Debug:**
```bash
# Manually trigger cron
curl -X GET https://evite.mankala.space/api/cron/send-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -v
```

**❌ Emails going to spam**

**Symptoms:** Email delivers but goes to spam folder

**Solutions:**
1. Verify DKIM is passing (check email headers)
2. Verify SPF is passing (check email headers)
3. Add DMARC record if missing
4. Avoid spam trigger words
5. Warm up domain (send to yourself first)

**Check Email Headers:**
- Gmail: Click "Show original"
- Look for: `DKIM-Signature`, `SPF: PASS`

**❌ Wrong reminder timing**

**Symptoms:** Reminders sent at wrong time

**Root Cause:** Cron runs in UTC, not your local timezone

**Solution:** Adjust cron schedule or document UTC timing

---

## 🔧 Technical Reference

### Database Schema

**RSVPs Table:**

```sql
ALTER TABLE rsvps ADD COLUMN
  email VARCHAR(255),                           -- Guest email
  notification_preferences JSONB                -- {"email": true}
    DEFAULT '{"email": true}'::jsonb,
  reminder_sent_at TIMESTAMP,                   -- When sent
  reminder_status VARCHAR(50)                   -- pending|sent|failed|skipped
    DEFAULT 'pending';
```

**Notification Logs Table:**

```sql
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID NOT NULL REFERENCES rsvps(id),
  invitation_id UUID NOT NULL REFERENCES invitations(id),
  notification_type VARCHAR(20) NOT NULL,       -- 'email'
  recipient VARCHAR(255) NOT NULL,              -- Email address
  status VARCHAR(50) NOT NULL,                  -- sent|failed
  provider_response JSONB,                      -- Full Resend response
  error_message TEXT,                           -- If failed
  sent_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

**POST /api/rsvp**

Creates RSVP with email notification preferences.

**Request:**
```json
{
  "invitation_id": "uuid",
  "name": "John Doe",
  "response": "yes",
  "comment": "Looking forward!",
  "email": "john@example.com",
  "notification_preferences": {"email": true}
}
```

**Response:**
```json
{
  "rsvp": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "reminder_status": "pending"
  }
}
```

**GET /api/cron/send-reminders**

Processes pending reminders for upcoming events.

**Headers:**
```
Authorization: Bearer CRON_SECRET
```

**Response:**
```json
{
  "success": true,
  "message": "Reminder notifications processed",
  "results": {
    "totalInvitations": 1,
    "totalRSVPs": 3,
    "sentCount": 3,
    "skippedCount": 0,
    "failedCount": 0,
    "errors": []
  }
}
```

### Email Template

The HTML email includes:
- Responsive design (mobile-friendly)
- Event details (date, time, location)
- Gradient header with logo
- CTA button to view invitation
- Footer with branding
- Plain text fallback

**Preview:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        📧 Event Reminder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi John,

This is a friendly reminder that the
event you RSVP'd to is coming up in
just 2 days! 🎉

┌────────────────────────────────┐
│   Birthday Party               │
│                                │
│ 📅 Nov 20, 2024 at 7:00 PM    │
│ 📍 123 Main St                 │
│ 👤 Hosted by Jane Smith        │
└────────────────────────────────┘

We're looking forward to seeing you!

[View Full Invitation]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Simple Evite
evite.mankala.space
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Cost Breakdown

**For 100 events/month, 20 guests each, 50% opt-in:**

```
Events:        100
Guests/event:  20
Opt-in rate:   50%
Emails/month:  100 × 20 × 0.5 = 1,000 emails

Resend:        FREE (under 3,000/month)
Vercel Cron:   FREE (Hobby plan includes 2 cron jobs)
Total:         $0/month ✅
```

**At scale (500 events/month):**

```
Emails/month:  500 × 20 × 0.5 = 5,000 emails

Resend:        $20/month (50K email tier)
Vercel:        $0 (still within free tier)
Total:         $20/month
```

### Files Modified

**Created (8 files):**
- `supabase/migrations/add_notification_fields.sql`
- `src/lib/email-service.ts`
- `src/app/api/cron/send-reminders/route.ts`
- `vercel.json`
- `EMAIL_NOTIFICATIONS_GUIDE.md` (this file)

**Modified (4 files):**
- `src/lib/supabase.ts` - Added notification types
- `src/app/api/rsvp/route.ts` - Handle email collection
- `src/app/invite/[token]/page.tsx` - Email input UI
- `src/app/invitations/[id]/page.tsx` - Status display

### Security Features

✅ **Input Validation:**
- Email format validation (regex)
- Sanitization of all inputs
- Type checking

✅ **API Security:**
- Cron endpoint protected by `CRON_SECRET`
- Rate limiting
- Security headers
- Request logging

✅ **Database Security:**
- Row Level Security (RLS) policies
- Service role for cron operations
- User-scoped queries

✅ **Privacy:**
- Email is optional
- Clear opt-in required
- Email only used for reminders
- Reply-To goes to your personal email

---

## 🎯 Success Metrics

Track these in Resend Dashboard and database:

| Metric | Target | How to Track |
|--------|--------|--------------|
| Opt-in Rate | 50%+ | `(RSVPs with email) / (Total Yes RSVPs)` |
| Delivery Rate | 95%+ | `(sent) / (sent + failed)` in logs |
| Open Rate | 40%+ | Resend Dashboard |
| Error Rate | <5% | `(failed) / (total)` in logs |

---

## 🔮 Future Enhancements

**Phase 2:**
- [ ] SMS notifications (Twilio)
- [ ] Custom reminder timing (1 day, 1 week)
- [ ] Custom reminder messages
- [ ] Multiple reminders per event

**Phase 3:**
- [ ] Notify organizers on new RSVPs
- [ ] Weekly digests for organizers
- [ ] Calendar integration (.ics files)
- [ ] Analytics dashboard

---

## 📞 Support

### Resources
- [Resend Docs](https://resend.com/docs)
- [Resend Status](https://status.resend.com)
- [Vercel Cron Docs](https://vercel.com/docs/cron-jobs)

### Troubleshooting Steps
1. Check this guide's troubleshooting section
2. Review Resend logs: [resend.com/logs](https://resend.com/logs)
3. Check Vercel function logs
4. Query `notification_logs` table for errors
5. Test with manual cron trigger

---

## ✅ Deployment Checklist

### Local Testing
- [ ] Database migration applied
- [ ] Environment variables set
- [ ] Test RSVP submitted with email
- [ ] Manual cron trigger successful
- [ ] Email received

### Production Deployment
- [ ] `mankala.space` added in Resend
- [ ] DNS records added (DKIM, SPF, DMARC)
- [ ] Domain verified in Resend (green checkmarks)
- [ ] Environment variables added to Vercel
- [ ] `vercel.json` committed to repo
- [ ] Code deployed to Vercel
- [ ] Production test successful
- [ ] Monitoring queries saved

---

## 🎉 You're All Set!

Your email notification system is now:
- ✅ **Fully functional** - Automated reminders working
- ✅ **Production-ready** - Deployed and monitored
- ✅ **Scalable** - Handles growth effortlessly
- ✅ **Cost-effective** - Free for your current scale
- ✅ **Professional** - Beautiful branded emails

**Next Steps:**
1. Monitor for first few days
2. Review guest feedback
3. Track metrics in Resend
4. Plan future enhancements

Happy event planning! 🎊

