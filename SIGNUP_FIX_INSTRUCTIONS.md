# 🔧 Fix Sign-Up Page - Step by Step Instructions

## **Problem Identified:**
The sign-up page is not working because Supabase credentials are missing or incorrect.

## **Solution: Set Up Supabase Properly**

### **Step 1: Create Supabase Project**
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `flickxir-medicine-store`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you (e.g., `Asia Pacific (Mumbai)` for India)
6. Click "Create new project"

### **Step 2: Get Your Credentials**
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon Public Key** (starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### **Step 3: Create Environment File**
1. In your project root (`1st-DEMO/` folder), create a file named `.env`
2. Add this content:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# Other Environment Variables
REACT_APP_ENVIRONMENT=development
REACT_APP_API_BASE_URL=http://localhost:3000
REACT_APP_SITE_URL=http://localhost:3000
```

3. Replace `YOUR_PROJECT_ID` and `YOUR_ANON_KEY_HERE` with your actual values

### **Step 4: Set Up Database Tables**
1. In Supabase dashboard, go to **SQL Editor**
2. Run this SQL to create the users table:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### **Step 5: Configure Authentication**
1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000/**`
4. Save changes

### **Step 6: Test the Sign-Up**
1. Restart your React development server:
   ```bash
   npm start
   ```
2. Go to `/signup` page
3. Try to create an account
4. Check browser console for any errors

## **Common Issues & Fixes:**

### **Issue 1: "Invalid API key"**
- Check that your `.env` file has the correct `REACT_APP_SUPABASE_ANON_KEY`
- Make sure the file is in the project root, not in `src/`

### **Issue 2: "Network error"**
- Check your internet connection
- Verify the `REACT_APP_SUPABASE_URL` is correct
- Make sure Supabase project is not paused

### **Issue 3: "Table doesn't exist"**
- Run the SQL commands in Step 4
- Check that the table name is exactly `users`

### **Issue 4: "CORS error"**
- Add your domain to Supabase **Authentication** → **Settings** → **Site URL**
- Make sure you're using `http://localhost:3000` for development

## **Verification:**
After setup, you should see:
- ✅ Sign-up form loads without errors
- ✅ Form validation works
- ✅ Account creation succeeds
- ✅ Email confirmation message appears
- ✅ User profile is created in database

## **Need Help?**
If you still have issues:
1. Check browser console for error messages
2. Verify `.env` file is in the correct location
3. Make sure you restarted the development server
4. Check Supabase dashboard for any error logs

---

**Note**: The `.env` file should NEVER be committed to git. It contains sensitive credentials.
