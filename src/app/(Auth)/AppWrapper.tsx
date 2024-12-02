import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import { supabase } from '@/src/app/lib/supbase'; // Adjust the import path to your Supabase client
import SignInPage from '@/src/app/(Auth)/SignIn'; // Adjust the import path accordingly

const AppWrapper = () => {
  const router = useRouter(); // Initialize router
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      // Fetch the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error.message);
      }
      if (session) {
        setIsLoggedIn(true);
        router.push('/(tabs)'); // Navigate to your main app route if logged in
      } else {
        setIsLoggedIn(false);
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00BFFF" />
      </View>
    );
  }

  // Render SignInPage if not logged in
  return isLoggedIn ? null : <SignInPage />;
};

export default AppWrapper;
