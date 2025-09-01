# 🔧 Fix Profile Data Issue

## 🚨 **Problem:**
Your name and phone number from sign-up are not appearing in your profile page.

## 🔍 **Root Cause:**
The `406` error suggests a database issue - either:
1. **Missing columns** in the `users` table
2. **RLS policies** blocking access
3. **Data not being inserted** during sign-up

## 🛠️ **Step-by-Step Fix:**

### **Step 1: Run Database Fix Script**
1. Go to your **Supabase Dashboard**
2. Click **SQL Editor**
3. Copy and paste the contents of `database/fix_profile_data.sql`
4. Click **Run** to execute the script

### **Step 2: Check Console Logs**
1. Open your **browser console** (F12)
2. Go to your **Profile page**
3. Look for detailed error messages
4. Click the **🗄️ Test Database** button on the profile page

### **Step 3: Verify Data Flow**
The data should flow like this:
```
SignUp → AuthService.signUp → createUserProfile → users table → getUserProfile → Profile component
```

## 📊 **Expected Results:**

After running the fix script, you should see:
- ✅ **Table Structure**: `first_name`, `last_name`, `phone` columns exist
- ✅ **RLS Policies**: Proper policies for SELECT, INSERT, UPDATE
- ✅ **Data Access**: No more 406 errors

## 🧪 **Testing:**

1. **Sign out** and **sign back in**
2. **Go to Profile page** - should show your data
3. **Check console** - should show successful data retrieval
4. **Click Test Database** - should show success message

## 🚨 **If Still Not Working:**

1. **Check Supabase Dashboard** → **Table Editor** → **users**
2. **Verify your user record** exists with correct data
3. **Check RLS policies** are active
4. **Look for any error messages** in the console

## 📞 **Need Help?**

If the issue persists, share:
- Console error messages
- Database test results
- Supabase table structure screenshot

---

**The fix script will resolve the 406 error and ensure your profile data displays correctly!** 🎯
