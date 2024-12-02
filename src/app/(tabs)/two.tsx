// import React, { useState, useEffect } from 'react';
// import { View, Text, Image, Button, ActivityIndicator } from 'react-native';
// import { useRouter } from 'expo-router'; // Use Expo Router's useRouter
// import { supabase } from '@/src/app/lib/supbase'; // Adjust the import path for your Supabase client

// // Define the user profile type
// interface UserProfile {
//   id: string;
//   name: string;
//   email: string;
//   avatar_url: string | null;
// }

// const Profile: React.FC = () => {
//   const [userData, setUserData] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter(); // Use Expo Router's useRouter for navigation

//   useEffect(() => {
//     const fetchProfile = async () => {
//       const {
//         data: { session },
//         error,
//       } = await supabase.auth.getSession();

//       if (error) {
//         console.error('Error fetching session:', error.message);
//       }

//       const user = session?.user;

//       if (user) {
//         const { data, error } = await supabase
//           .from('profiles') // Adjust to your table name
//           .select('*')
//           .eq('id', user.id)
//           .single();

//         if (error) {
//           console.error('Error fetching profile:', error.message);
//         } else {
//           setUserData(data);
//         }
//       } else {
//         router.push('/(Auth)/SignIn'); // Navigate to SignIn if no user found
//       }

//       setLoading(false);
//     };

//     fetchProfile();
//   }, [router]);

//   if (loading) {
//     return <ActivityIndicator size="large" color="#0000ff" />; // Show a loading indicator while fetching data
//   }

//   if (!userData) {
//     return <Text>No profile data found</Text>; // Show message if no data found
//   }

//   const handleSignOut = async () => {
//     const { error } = await supabase.auth.signOut();
//     if (error) {
//       console.error('Error signing out:', error.message);
//     } else {
//       router.push('/(Auth)/SignIn'); // Navigate to SignIn page after sign out
//     }
//   };

//   return (
//     <View style={{ padding: 20 }}>
//       <Image
//         source={{ uri: userData.avatar_url || 'default-avatar.png' }}
//         style={{ width: 100, height: 100, borderRadius: 50 }}
//       />
//       <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{userData.name}</Text>
//       <Text style={{ fontSize: 16 }}>{userData.email}</Text>
//       {/* <Button title="Edit Profile" onPress={() => router.push('/edit-profile')} /> */}
//       <Button title="Sign Out" onPress={handleSignOut} />
//     </View>
//   );
// };

// export default Profile;
