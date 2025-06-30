# Testing Guide for Joynest

## 🧪 Easy Testing Setup

Since this is a testing project, we've made authentication very flexible!

### Quick Auth Setup in Supabase

1. **Go to Authentication → Settings** in your Supabase dashboard
2. **Disable email verification**:
   - Turn OFF "Enable email confirmations"
   - Turn OFF "Enable email change confirmations"
3. **Set Site URL** to `http://localhost:3000`
4. **Save changes**

Now you can register with any email format like:
- `test@test.com`
- `user1@example.com`
- `alice@demo.dev`
- Even `fake@fake.fake`!

### Test Users & Data

After running the database schema, you can create sample data:

```sql
-- Create sample users and items
SELECT create_sample_data();
```

This creates:
- **Test Users**: `alice@test.com` and `bob@test.com` (password: `password123`)
- **Sample Items**: Camera, bike, books with images
- **Sample Offers**: Some pending and rejected offers

### Quick Test Accounts

You can manually create test accounts in the app:
- Email: `test1@test.com`, Password: `123456`
- Email: `test2@test.com`, Password: `123456`
- Email: `demo@demo.com`, Password: `password`

### Reset Test Data

To clear everything and start fresh:

```sql
SELECT reset_test_data();
```

### Testing Workflow

1. **Register** multiple test accounts
2. **Login** with first account and create some items
3. **Logout** and login with second account
4. **Make offers** on the first user's items
5. **Switch back** to first account to accept/reject offers
6. **Test editing/deleting** your own items

### Common Test Scenarios

- ✅ **Public browsing**: View items without logging in
- ✅ **Registration**: Create accounts with any email format
- ✅ **Item creation**: Add items with and without images
- ✅ **Offer flow**: Make offers and respond to them
- ✅ **Authorization**: Try to edit others' items (should fail)
- ✅ **Profile management**: View your items and stats

### Sample Test Emails

Feel free to use any of these for testing:
```
alice@example.com
bob@test.dev
charlie@demo.co
diana@fake.email
eve@testing.xyz
```

No verification needed! 🎉
