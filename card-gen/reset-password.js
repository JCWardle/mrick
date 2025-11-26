#!/usr/bin/env node

/**
 * Admin script to reset a Supabase user's password
 * 
 * Usage:
 *   node reset-password.js <email|userId> [newPassword]
 * 
 * Options:
 *   - If newPassword is provided, sets the password directly
 *   - If newPassword is not provided, sends a password reset email
 *   - Can use either email address or user ID (UUID)
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase URL and service role key
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  console.error('   Or set them in your .env file');
  process.exit(1);
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Error: Missing email address or user ID');
  console.error('\nUsage:');
  console.error('  node reset-password.js <email|userId> [newPassword]');
  console.error('\nExamples:');
  console.error('  # Send password reset email:');
  console.error('  node reset-password.js user@example.com');
  console.error('\n  # Set password directly:');
  console.error('  node reset-password.js user@example.com newPassword123');
  console.error('  node reset-password.js de85831a-d612-4d70-b8d4-952e8f7daa86 newPassword123');
  process.exit(1);
}

const identifier = args[0];
const newPassword = args[1];

// Check if identifier looks like a UUID (user ID)
const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

// Initialize Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

(async () => {
  try {
    let user;
    
    if (isUUID) {
      // Direct lookup by user ID
      console.log(`🔍 Looking up user by ID: ${identifier}...`);
      
      const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(identifier);
      
      if (getUserError) {
        throw new Error(`Failed to get user: ${getUserError.message}`);
      }
      
      if (!userData || !userData.user) {
        console.error(`❌ Error: User with ID "${identifier}" not found`);
        process.exit(1);
      }
      
      user = userData.user;
    } else {
      // Look up by email
      console.log(`🔍 Looking up user by email: ${identifier}...`);
      
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        throw new Error(`Failed to list users: ${listError.message}`);
      }
      
      user = users.users.find(u => u.email === identifier);
      
      if (!user) {
        console.error(`❌ Error: User with email "${identifier}" not found`);
        process.exit(1);
      }
    }
    
    console.log(`✅ Found user: ${user.email || 'N/A'} (ID: ${user.id})`);
    
    if (newPassword) {
      // Set password directly
      console.log(`\n🔐 Setting new password...`);
      
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      );
      
      if (error) {
        throw new Error(`Failed to update password: ${error.message}`);
      }
      
      console.log(`✅ Password updated successfully for ${user.email || user.id}`);
      console.log(`\n⚠️  Note: The user will need to log in with the new password.`);
      console.log(`   Their current session may be invalidated.`);
      
    } else {
      // Send password reset email
      if (!user.email) {
        console.error(`❌ Error: Cannot send password reset email - user has no email address`);
        process.exit(1);
      }
      
      console.log(`\n📧 Sending password reset email...`);
      
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: user.email,
      });
      
      if (error) {
        throw new Error(`Failed to generate reset link: ${error.message}`);
      }
      
      console.log(`✅ Password reset email sent to ${user.email}`);
      console.log(`\n📋 Reset link: ${data.properties.action_link}`);
      console.log(`\n⚠️  Note: The user will receive an email with a link to reset their password.`);
    }
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
})();

