# 🎯 Donations System Setup Guide

## 📋 Overview
This system adds medicine donation functionality to your pharmacy app, including:
- User donation submission
- Admin approval and management
- Pickup scheduling
- Status tracking
- Integration with orders table

## 🚀 Quick Setup

### 1. Database Setup
Run the SQL script in your **Supabase SQL Editor**:

```sql
-- Copy and paste the contents of database/simple_donations_setup.sql
```

This will create:
- `donations` table
- `donation_items` table  
- `pickup_schedules` table
- RLS policies for security
- Views for user and admin access
- "my_donations" column in orders table

### 2. Add Routes to Your App
Add these routes to your main App component:

```jsx
import DonationsAdmin from './components/DonationsAdmin';
import MyDonations from './components/MyDonations';

// In your routes:
<Route path="/admin/donations" element={<DonationsAdmin />} />
<Route path="/my-donations" element={<MyDonations />} />
```

### 3. Update Navigation
Add navigation links:

```jsx
// For users:
<Link to="/my-donations">My Donations</Link>

// For admins:
<Link to="/admin/donations">Manage Donations</Link>
```

## 🔧 How It Works

### For Users:
1. **Donate Medicines**: Go to `/donate` page
2. **Select Items**: Choose medicines to donate
3. **Fill Form**: Provide contact and pickup details
4. **Track Status**: View progress at `/my-donations`

### For Admins:
1. **Review Donations**: See all pending donations
2. **Approve/Reject**: Update donation status
3. **Schedule Pickup**: Set pickup date/time
4. **Track Progress**: Monitor collection status

## 📊 Database Structure

### donations table:
- `id`: Unique identifier
- `user_id`: References auth.users
- `donor_name`, `donor_email`, `donor_phone`, `donor_address`
- `status`: pending → approved → collected → completed
- `admin_notes`: Internal notes
- `pickup_date`, `pickup_time`: Scheduled pickup

### donation_items table:
- `donation_id`: References donations
- `product_id`: References products (optional)
- `product_name`, `quantity`: Item details

### pickup_schedules table:
- `donation_id`: References donations
- `scheduled_date`, `scheduled_time`: Pickup appointment
- `pickup_address`: Where to collect
- `status`: scheduled → in_progress → completed

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only see their own donations
- Admins can see and manage all donations
- Admin access controlled by `is_admin` field in profiles table

## 🎨 UI Components

### DonationsAdmin.jsx
- Admin dashboard for managing donations
- Status updates and pickup scheduling
- Statistics and overview

### MyDonations.jsx  
- User dashboard for tracking donations
- Pickup schedule information
- Status updates and history

## 🚨 Troubleshooting

### Common Issues:

1. **"Access denied" error**
   - Check if user has `is_admin = true` in profiles table
   - Verify RLS policies are created correctly

2. **Tables not found**
   - Run the SQL script in Supabase SQL Editor
   - Check table names match exactly

3. **Views not working**
   - Ensure views are created with correct permissions
   - Check if user has SELECT access

### Testing:

1. **Test as User**:
   - Submit a donation at `/donate`
   - Check status at `/my-donations`

2. **Test as Admin**:
   - Login with admin account
   - Go to `/admin/donations`
   - Approve and schedule pickup

## 📱 Features

- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Real-time Updates**: Status changes reflect immediately
- ✅ **Admin Controls**: Full donation lifecycle management
- ✅ **User Tracking**: Complete donation history
- ✅ **Pickup Scheduling**: Automated pickup coordination
- ✅ **Integration**: Links to existing orders system

## 🔄 Status Flow

```
pending → approved → collected → completed
   ↓           ↓         ↓
User      Admin      Driver      Admin
Submits   Approves   Collects   Completes
```

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify database tables exist
3. Confirm RLS policies are active
4. Check user permissions in profiles table

---

**🎉 You're all set!** The donations system is now ready to help your community donate medicines and coordinate pickups.

