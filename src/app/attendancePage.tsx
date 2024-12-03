import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '@/src/app/lib/supbase'; // Adjust the import path as needed
import { RouteProp, useRoute } from '@react-navigation/native';

type Student = {
  first_name: string;
  middle_name?: string;
  last_name: string;
};

type Attendance = {
  student_lrn: string;
  date: string;
  status: string;
  evaluation: string;
  students: Student | null;
};

type AttendanceRouteParams = {
  date?: string; // Optional date parameter
};

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute<RouteProp<{ params: AttendanceRouteParams }>>();

  useEffect(() => {
    const date = route.params?.date || new Date().toISOString().split('T')[0];
    console.log('Fetching attendance records for date:', date);
    fetchAttendanceRecords(date);

    const interval = setInterval(() => {
      fetchAttendanceRecords(date); // Refresh attendance records every 2 seconds
    }, 2000); // Refresh every 2 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [route.params]);

  const fetchAttendanceRecords = async (date: string) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0); // Set to UTC
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999); // Set to UTC

      console.log('Start of Day:', startOfDay.toISOString());
      console.log('End of Day:', endOfDay.toISOString());

      const { data, error } = await supabase
        .from('attendance')
        .select(`student_lrn, date, status, evaluation, students (first_name, middle_name, last_name)`)
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString());

      console.log('Raw Attendance Data:', data); // Log the raw data
      if (error) {
        console.error('Error fetching attendance records:', error.message);
        return;
      }

      const transformedData = data.map((record) => ({
        student_lrn: record.student_lrn,
        date: new Date(record.date).toLocaleString(), // Format date for better readability
        status: record.status,
        evaluation: record.evaluation,
        students: record.students ? record.students : null,
      })) as Attendance[];

      console.log('Transformed Attendance Data:', transformedData); // Log the fetched data
      setAttendanceData(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching attendance data:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {attendanceData.length === 0 ? (
        <Text style={styles.noDataText}>No attendance records available.</Text>
      ) : (
        <FlatList
          data={attendanceData}
          keyExtractor={(item) => item.student_lrn}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>
                Name:{' '}
                {item.students
                  ? `${item.students.first_name} ${item.students.middle_name || ''} ${item.students.last_name}`
                  : 'Unknown Student'}
              </Text>
              <Text style={styles.itemText}>Date: {item.date}</Text>
              <Text style={styles.itemText}>Status: {item.status}</Text>
              <Text style={styles.itemText}>Evaluation: {item.evaluation}</Text>
            </View>
          )}
        />
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
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AttendancePage;
