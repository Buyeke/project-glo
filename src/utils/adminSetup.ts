
import { supabase } from '@/integrations/supabase/client';

export const setupExistingAdminUsers = async () => {
  try {
    console.log('Setting up existing admin users...');
    
    // Call the setup function for both admin users
    const { error: setupError } = await supabase.rpc('setup_admin_user', {
      user_email: 'founder@projectglo.org',
      user_name: 'GLO Founder'
    });

    if (setupError) {
      console.error('Setup error for founder:', setupError);
    }

    const { error: setupError2 } = await supabase.rpc('setup_admin_user', {
      user_email: 'projectglo2024@gmail.com',
      user_name: 'GLO Admin'
    });

    if (setupError2) {
      console.error('Setup error for admin:', setupError2);
    }

    return { 
      success: !setupError && !setupError2, 
      errors: [setupError, setupError2].filter(Boolean) 
    };
  } catch (error) {
    console.error('Admin setup error:', error);
    return { success: false, error: error.message };
  }
};

export const verifyAdminSetup = async () => {
  try {
    console.log('Verifying admin setup...');
    const { data, error } = await supabase.rpc('verify_admin_setup');
    
    if (error) {
      console.error('Verification error:', error);
      throw error;
    }

    console.log('Verification results:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Admin verification error:', error);
    return { success: false, error: error.message };
  }
};

export const testAdminLogin = async (email: string, password: string) => {
  try {
    console.log(`Testing admin login for: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error('Login test error:', error);
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Test admin status
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_user');
      
      if (adminError) {
        console.error('Admin check error:', adminError);
        return { success: false, error: adminError.message };
      }

      // Sign out after test
      await supabase.auth.signOut();

      return { 
        success: true, 
        isAdmin, 
        user: data.user,
        message: `Login successful. Admin status: ${isAdmin}`
      };
    }

    return { success: false, error: 'No user returned from login' };
  } catch (error) {
    console.error('Login test error:', error);
    return { success: false, error: error.message };
  }
};

// Legacy function for backward compatibility
export const createAdminUser = async (email: string, password: string, fullName: string) => {
  return { 
    success: false, 
    error: 'User creation not needed - users already exist. Use setupExistingAdminUsers instead.' 
  };
};

// Legacy function for backward compatibility
export const setupAdminUsers = async () => {
  console.log('Setting up admin users (existing users)...');
  
  const setupResult = await setupExistingAdminUsers();
  const verification = await verifyAdminSetup();
  
  return {
    creationResults: [
      { 
        email: 'founder@projectglo.org', 
        success: setupResult.success, 
        error: setupResult.errors?.[0]?.message || null 
      },
      { 
        email: 'projectglo2024@gmail.com', 
        success: setupResult.success, 
        error: setupResult.errors?.[1]?.message || null 
      }
    ],
    verification
  };
};
