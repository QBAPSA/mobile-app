import { StyleSheet, View, TouchableOpacity, Animated, Text as RNText } from 'react-native';
import { useState, useRef } from 'react';
import { Text } from '@/src/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';
// import Screelogo from '@/src/app/(Screen)/screen';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/src/app/lib/supbase';

 // Adjust the import path for your Supabase client

export default function TabOneScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current; // Slide animation for the side menu
  const router = useRouter();

  const toggleMenu = () => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, {
        toValue: -250, // Slide off-screen
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMenuOpen(false));
    } else {
      setIsMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0, // Slide into view
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      router.push('/(Auth)/SignIn');
    }
  };

  return (
    <View style={styles.container}>
      {/* Burger Icon */}
      <TouchableOpacity style={styles.burgerIcon} onPress={toggleMenu}>
        <MaterialIcons name="menu" size={30} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Records</Text>

      {/* Slide-In Side Menu */}
      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: slideAnim }] }]}>
        <TouchableOpacity style={styles.closeMenuButton} onPress={toggleMenu}>
          <RNText style={styles.closeMenuText}>Close</RNText>
        </TouchableOpacity>
        <View style={styles.menuItems}>
          <TouchableOpacity onPress={() => { toggleMenu(); /* Navigate to Home */ }}>
            <Link href={'/(tabs)'} style={styles.menuItemText}>
              Home
            </Link>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { toggleMenu(); /* Navigate to Attendance */ }}>
            <Link href={'/attendancePage'} style={styles.menuItemText}>
              Attendance
            </Link>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { toggleMenu(); /* Navigate to Student */ }}>
            <Link href={'/Student'} style={styles.menuItemText}>
              Student
            </Link>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { toggleMenu(); /* Navigate to Profile */ }}>
            <Link href={'/profile'} style={styles.menuItemText}>
              Profile
            </Link>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Centered Buttons for ICT 11 and ICT 12 */}
      <View style={styles.buttonWrapper}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Link href={'/Section'} style={styles.buttonText}>ICT 11</Link>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Link href={'/Section'} style={styles.buttonText}>ICT 12</Link>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  burgerIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 100,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#000',
    textAlign: 'center',
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 250,
    height: '100%',
    backgroundColor: '#333333c8',
    padding: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeMenuButton: {
    marginBottom: 20,
  },
  closeMenuText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  menuItems: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 18,
    color: 'white',
    marginVertical: 10,
  },
  buttonWrapper: {
    flex: 1, // Allow the buttonWrapper to take available space
    justifyContent: 'center', // Center the buttons vertically
    alignItems: 'center', // Center the buttons horizontally
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row', // Arrange buttons in a row
    justifyContent: 'space-around', // Space buttons evenly
    width: '80%',
  },
  button: {
    backgroundColor: 'gray', // Button color
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white', // White text for buttons
    fontSize: 16,
    fontWeight: 'bold',
  },
});
