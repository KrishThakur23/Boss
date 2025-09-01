# 🚀 Supabase Setup Guide for FlickXir

This guide will help you set up Supabase as your backend for the FlickXir healthcare platform.

## 📋 Prerequisites

- A Supabase account (free tier available)
- Node.js and npm installed
- Basic knowledge of SQL

## 🎯 Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `flickxir-healthcare`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project setup (2-3 minutes)

### 2. Get Project Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### 3. Set Environment Variables

1. Create a `.env` file in your project root
2. Add your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
REACT_APP_ENVIRONMENT=development
```

⚠️ **Important**: Never commit your `.env` file to version control!

### 4. Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `database/schema.sql`
3. Paste and run the SQL script
4. Verify tables are created in **Table Editor**

### 5. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure email templates (optional)
3. **IMPORTANT**: Set up redirect URLs:
   - Add `http://localhost:3000/signin`
   - Add `http://localhost:3000/reset-password`
   - Add `http://localhost:3000` (for email confirmations)
4. Go to **Authentication** → **Providers**
5. Enable Email provider
6. Configure password requirements if needed

**⚠️ Critical for Email Confirmations:**
- The redirect URLs must match your `REACT_APP_SITE_URL` in `.env`
- For production, change these to your actual domain
- Email verification links will redirect to these URLs

### 6. Set Up Storage (Optional)

1. Go to **Storage** → **Policies**
2. Create bucket for product images
3. Set up RLS policies for secure access

### 7. Test the Setup

1. Start your React app: `npm start`
2. Try to sign up with a new account
3. Check Supabase dashboard for new user
4. Verify authentication flow works

## 🗄️ Database Tables Created

- **users** - User profiles and medical information
- **categories** - Product categories
- **products** - Healthcare products
- **cart_items** - Shopping cart
- **orders** - Customer orders
- **prescriptions** - Medical prescriptions
- **addresses** - Delivery addresses
- **payments** - Payment records
- **wishlist** - User wishlists
- **notifications** - User notifications

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Authentication policies** ensure users only access their data
- **Public access** for products and categories
- **Secure user isolation** for personal data

## 🚨 Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution**: Check your `.env` file and ensure variables are named correctly

### Issue: "Invalid API key"
**Solution**: Verify you're using the anon key, not the service role key

### Issue: "RLS policy violation"
**Solution**: Check that your user is authenticated and policies are correct

### Issue: "Table doesn't exist"
**Solution**: Run the schema.sql script in Supabase SQL Editor

## 🔧 Development Tips

1. **Use Supabase Dashboard**: Monitor data, users, and logs
2. **Enable Logs**: Go to **Logs** to debug issues
3. **Test Policies**: Use **Table Editor** to test RLS policies
4. **Backup Data**: Export data before major changes

## 📱 Next Steps

After setup, you can:

1. **Add real products** to the database
2. **Implement search functionality** using Supabase full-text search
3. **Add image uploads** using Supabase Storage
4. **Set up real-time subscriptions** for live updates
5. **Implement payment processing** integration

## 🆘 Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [React + Supabase Examples](https://github.com/supabase/examples)

## 🎉 Congratulations!

You've successfully set up Supabase for FlickXir! Your healthcare platform now has:

✅ **User Authentication**  
✅ **Secure Database**  
✅ **Product Management**  
✅ **Shopping Cart**  
✅ **Order Processing**  
✅ **Prescription Management**  
✅ **User Profiles**  
✅ **Security Policies**

Your platform is now ready for development and testing! 🚀
