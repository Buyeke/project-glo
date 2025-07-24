
import { supabase } from '@/integrations/supabase/client';

export const createAdminUser = async (email: string, password: string, fullName: string) => {
  try {
    // First, create the user through Supabase's auth system
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      // Wait a moment for the user to be created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now set up the admin profile using our function
      const { error: setupError } = await supabase.rpc('setup_admin_user', {
        user_email: email,
        user_name: fullName
      });

      if (setupError) {
        console.error('Setup error:', setupError);
        throw setupError;
      }

      return { success: true, user: data.user };
    }

    return { success: false, error: 'User creation failed' };
  } catch (error) {
    console.error('Admin user creation error:', error);
    return { success: false, error: error.message };
  }
};

export const verifyAdminSetup = async () => {
  try {
    const { data, error } = await supabase.rpc('verify_admin_setup');
    
    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Admin verification error:', error);
    return { success: false, error: error.message };
  }
};

export const setupAdminUsers = async () => {
  const adminUsers = [
    {
      email: 'founder@projectglo.org',
      password: 'GLOFounder2024!',
      fullName: 'GLO Founder'
    },
    {
      email: 'projectglo2024@gmail.com',
      password: 'GLOAdmin2024!',
      fullName: 'GLO Admin'
    }
  ];

  const results = [];

  for (const admin of adminUsers) {
    console.log(`Creating admin user: ${admin.email}`);
    const result = await createAdminUser(admin.email, admin.password, admin.fullName);
    results.push({ ...result, email: admin.email });
    
    // Wait between creations
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Verify the setup
  const verification = await verifyAdminSetup();
  
  return {
    creationResults: results,
    verification
  };
};
