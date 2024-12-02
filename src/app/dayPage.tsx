import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/src/app/lib/supbase'; // Ensure this path matches your project structure
import { Attendance } from '@/src/app/attendance'; // Adjust to your types

const DayPage = () => {
  const { date } = useLocalSearchParams(); // Retrieve the selected date from the URL
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanned, setScanned] = useState(false);

  // Fetch attendance data for the selected date
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Fetch data from Supabase for the selected date
      const { data, error } = await supabase
        .from('attendance')
        .select('id, created_at, First_Name, Last_Name, Middle_Initial, LRN_Number, status_marked')
        .eq('created_at', date); // Filter by selected date

      if (error) {
        throw new Error(error.message);
      }

      setAttendanceData(data as Attendance[]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) {
      fetchAttendanceData();
    }
  }, [date]);

  const renderItem = ({ item }: { item: Attendance }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>
        {item.First_Name} {item.Last_Name} - {item.status_marked}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>Attendance for {date}</Text>

      {attendanceData.length > 0 ? (
        <FlatList
          data={attendanceData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.noDataText}>No attendance data for this date.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 16,
  },
  noDataText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
  },
});

export default DayPage;
