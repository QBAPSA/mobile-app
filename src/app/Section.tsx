import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const SectionPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current;

  const toggleMenu = () => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, {
        toValue: -250,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMenuOpen(false));
    } else {
      setIsMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const months = [
    { name: 'January', value: '01' },
    { name: 'February', value: '02' },
    { name: 'March', value: '03' },
    { name: 'April', value: '04' },
    { name: 'May', value: '05' },
    { name: 'June', value: '06' },
    { name: 'July', value: '07' },
    { name: 'August', value: '08' },
    { name: 'September', value: '09' },
    { name: 'October', value: '10' },
    { name: 'November', value: '11' },
    { name: 'December', value: '12' },
  ];

  // Split the months into two columns
  const firstColumn = months.filter((_, index) => index % 2 === 0); // odd index months
  const secondColumn = months.filter((_, index) => index % 2 !== 0); // even index months

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.burgerIcon} onPress={toggleMenu}>
        <MaterialIcons name="menu" size={30} color="black" />
      </TouchableOpacity>

      <Text style={styles.header}>ICT 12</Text>
      <View style={styles.monthsContainer}>
        <View style={styles.column}>
          {firstColumn.map((month) => (
            <Link
              key={month.value}
              href={{
                pathname: '/calendar',
                params: { month: month.value },
              }}
              style={styles.monthBox}
            >
              <Text style={styles.monthText}>{month.name}</Text>
            </Link>
          ))}
        </View>
        <View style={styles.column}>
          {secondColumn.map((month) => (
            <Link
              key={month.value}
              href={{
                pathname: '/calendar',
                params: { month: month.value },
              }}
              style={styles.monthBox}
            >
              <Text style={styles.monthText}>{month.name}</Text>
            </Link>
          ))}
        </View>
      </View>

      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: slideAnim }] }]}>
        <TouchableOpacity style={styles.closeMenuButton} onPress={toggleMenu}>
          <Text style={styles.closeMenuText}>Close</Text>
        </TouchableOpacity>
        <View style={styles.menuItems}>
          <TouchableOpacity onPress={() => { toggleMenu(); /* Navigate to Attendance */ }}>
            <Text style={styles.menuItemText}>Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { toggleMenu(); /* Navigate to Student */ }}>
            <Text style={styles.menuItemText}>Student</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { toggleMenu(); /* Navigate to Profile */ }}>
            <Text style={styles.menuItemText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  monthsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  column: {
    flex: 1,
    justifyContent: 'space-between',
  },
  monthBox: {
    backgroundColor: '#d3d3d3',
    padding: 20,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  burgerIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
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
});

export default SectionPage;
