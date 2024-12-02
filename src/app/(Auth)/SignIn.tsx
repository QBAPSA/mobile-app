import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import { supabase } from '@/src/app/lib/supbase'; // Adjust the import path to your Supabase client
import { AuthError } from '@supabase/supabase-js';
import Screelogo from '@/src/app/(Screen)/screen';

const SignInPage = () => {
  const router = useRouter(); // Initialize router
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log('Attempting to log in with:', email); // Add this line
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) throw error; // If there's an error, throw it
  
      // If sign-in is successful, navigate to the next page
      Alert.alert('Success', 'You are now signed in!');
      router.push('/(tabs)'); // Change '/home' to your actual home route
    } catch (err) {
      // Assert the error to AuthError type to access its properties
      const errorMessage = (err as AuthError).message || 'An unexpected error occurred.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* Wrap the images in a View with flexDirection: 'row' */}
      <View style={styles.imageRow}>
        <Image
          source={{ uri: 'data:image/png;base64,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' }}
          style={styles.logo}
        />
        <Image
          source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmmTrmXJXcI7UZJ_GzdlqJcwvIryZ2MRDwpc_jzC0cQg&s' }}
          style={styles.logo}
        />
      </View>

      
      
      <Text style={styles.title}>Welcome to QBAPSA</Text>
      <Text style={styles.subtitle}>Sign into your Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address" // Optional: For better UX on mobile
        autoCapitalize="none" // Prevent auto capitalization
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.socialMediaContainer}>
        {/* <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Login with Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Login with Google</Text>
        </TouchableOpacity> */}
      </View>

      {/* <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.registerText}>Don't have an account? Register Now</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  logo: {
    width: 120,
    height: 120,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#343434',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#343434',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#343434',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    color: '#FFF',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#000',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialMediaContainer: {
    width: '100%',
    alignItems: 'center',
  },
  socialButton: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#FF7F50',
  },
  registerText: {
    color: '#FFF',
    marginTop: 20,
  },
});

export default SignInPage;
