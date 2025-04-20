# Membership Plan Migration Implementation

This document outlines the implementation of the membership plan migration feature that allows customers to upgrade from Silver to Silver Plus to Gold plans while carrying forward their remaining points.

## Features

- One-way migration path: Silver → Silver Plus → Gold
- Remaining points are carried forward during upgrade
- Plan downgrades are not allowed
- Not applicable to Non-Membership plans
- Full upgrade history is maintained

## Database Setup Instructions

### Step 1: Create Required Tables

Execute the SQL in `membership_upgrade_tables.sql` in your Supabase SQL Editor. This script will:

1. Create the `memberships` table (if it doesn't exist)
2. Create the `membership_upgrades` history table
3. Add a function to calculate carried points

### Step 2: Create Migration Stored Procedure

Execute the SQL in `membership_migration_function.sql` in your Supabase SQL Editor. This creates the stored procedure that handles the migration process, including:

1. Validating the upgrade path
2. Deactivating the current membership
3. Creating a new membership with carried forward points
4. Updating the customer record
5. Logging the migration in the history table

## Frontend Implementation

The implementation consists of the following components:

1. **PlanUpgrade.jsx**: A reusable component that provides UI for upgrading membership plans
2. **Membership Page**: Updated to include the plan upgrade component
3. **db.js**: Added `migratePlan` function to handle the backend communication

## Usage

1. Navigate to the Membership page
2. Select a customer from the dropdown
3. Click "Show Plan Migration Options"
4. The system will display the available upgrades based on the customer's current plan:
   - Silver members can upgrade to Silver Plus or Gold
   - Silver Plus members can only upgrade to Gold
   - Gold members have no upgrade options
   - Non-Membership plans cannot be upgraded

## Important Notes

- Once a plan is upgraded, it cannot be reversed or downgraded
- Only the remaining point balance will be carried forward
- The upgrade history is maintained for audit purposes
- All migration operations are performed in a transaction to ensure data integrity 