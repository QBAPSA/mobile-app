import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const SectionPage = () => {
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
});

export default SectionPage;
