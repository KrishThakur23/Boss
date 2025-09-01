# Addresses Feature Setup Guide

This guide explains how to set up the addresses feature for the FlickXir application.

## Overview

The addresses feature allows users to:
- Save multiple delivery addresses
- Set a default address
- Manage their address book
- Access addresses from the header location button

## Database Setup

### 1. Run the SQL Script

Execute the `database/addresses_setup.sql` script in your Supabase SQL editor:

```sql
-- This will create the addresses table with proper RLS policies
-- Run the entire script in Supabase SQL Editor
```

### 2. Table Structure

The `addresses` table includes:
- `id`: Unique identifier (UUID)
- `user_id`: References the authenticated user
- `name`: Full name for delivery
- `phone`: Contact phone number
- `address_line1`: Primary address (required)
- `address_line2`: Secondary address (optional)
- `city`: City name
- `state`: State/province name
- `pincode`: Postal/ZIP code
- `is_default`: Boolean flag for default address
- `created_at` & `updated_at`: Timestamps

## Features Implemented

### 1. Address Management Page (`/addresses`)
- **Route**: `/addresses`
- **Component**: `src/Addresses.jsx`
- **Styling**: `src/Addresses.css`

### 2. Header Integration
- Clicking "Change" in the location section navigates to `/addresses`
- Located in `src/Header.jsx`

### 3. Address Service
- **File**: `src/services/addressService.js`
- Handles all CRUD operations with Supabase
- Includes proper error handling

### 4. Security Features
- Row Level Security (RLS) enabled
- Users can only access their own addresses
- Proper authentication checks

## How It Works

### 1. User Flow
1. User clicks "Change" in header location section
2. Redirected to `/addresses` page
3. Can view existing addresses or add new ones
4. Can set default address and delete addresses

### 2. Address Operations
- **Add**: Form with validation for required fields
- **View**: List of all saved addresses with default indicator
- **Edit**: Currently shows delete option (edit can be added later)
- **Delete**: Confirmation dialog before removal
- **Set Default**: Only one address can be default per user

### 3. Form Validation
- Required fields: name, phone, address_line1, city, state, pincode
- Optional: address_line2
- Checkbox to set as default address

## Styling Features

- Modern, clean design with gradients
- Responsive layout for mobile and desktop
- Hover effects and smooth transitions
- Default address highlighting
- Form validation styling

## Future Enhancements

Potential improvements that could be added:
1. Address editing functionality
2. Address search and filtering
3. Address validation (postal code, phone format)
4. Integration with delivery services
5. Address import/export
6. Multiple address types (home, work, etc.)

## Troubleshooting

### Common Issues

1. **Table not created**: Ensure you're running the SQL script in the correct database
2. **RLS errors**: Check that RLS policies are properly created
3. **Authentication issues**: Verify user is logged in before accessing addresses
4. **Form submission errors**: Check browser console for detailed error messages

### Testing

1. Create a test user account
2. Add a test address
3. Verify it appears in the list
4. Test setting as default
5. Test deletion with confirmation

## Security Notes

- All address operations require user authentication
- RLS ensures users can only access their own addresses
- No sensitive data exposure in client-side code
- Proper input validation and sanitization
