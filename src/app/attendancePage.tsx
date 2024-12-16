import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '@/src/app/lib/supbase';
import { RouteProp, useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

type Student = {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
};

type AttendanceRecord = {
  student_lrn: string;
  students: {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
  } | null;
  subject?: string;
  date?: string;
};

type AttendanceStatus = Record<string, Record<string, string>>;

type AttendanceRouteParams = {
  date?: string;
};

const SUBJECTS = ['TVL', 'PE', 'HISTORY', 'MATH', 'AP', 'SCIENCE'];

const AttendancePage = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStatus>({});
  const [loading, setLoading] = useState(true);
  const route = useRoute<RouteProp<{ params: AttendanceRouteParams }>>();

  const selectedDate = route.params?.date || new Date().toISOString().split('T')[0];

  const fetchAttendanceRecords = async (date: string) => {
    try {
      setLoading(true);
      
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // Fetch students with attendance records for the selected date
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          student_lrn,
          subject,
          status,
          evaluation,
          students!inner (
            first_name,
            middle_name,
            last_name
          )
        `)
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString());

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
        return;
      }

      // Transform the data to match our AttendanceRecord type
      const uniqueStudents = new Map();
      attendanceData?.forEach(record => {
        if (!uniqueStudents.has(record.student_lrn)) {
          uniqueStudents.set(record.student_lrn, {
            student_lrn: record.student_lrn,
            students: record.students
          });
        }
      });

      const formattedRecords = Array.from(uniqueStudents.values());
      setAttendanceRecords(formattedRecords as AttendanceRecord[]);

      // Initialize attendance state
      const newAttendance: Record<string, Record<string, string>> = {};
      formattedRecords.forEach(student => {
        newAttendance[student.student_lrn] = {};
        SUBJECTS.forEach(subject => {
          newAttendance[student.student_lrn][subject] = 'absent';
        });
      });

      // Update with actual attendance data
      attendanceData?.forEach(record => {
        if (record.student_lrn && record.subject) {
          if (!newAttendance[record.student_lrn]) {
            newAttendance[record.student_lrn] = {};
          }
          newAttendance[record.student_lrn][record.subject] = record.status;
        }
      });

      setAttendance(newAttendance);
      console.log('Loaded students with attendance:', formattedRecords.length);
    } catch (error) {
      console.error('Error in fetchAttendanceRecords:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords(selectedDate);
  }, [selectedDate]);

  const handleIconPress = async (studentLrn: string, subject: string) => {
    const currentValue = attendance[studentLrn]?.[subject] === 'present';
    const newValue = !currentValue;
    
    try {
      // Update local state immediately for responsive UI
      setAttendance(prev => ({
        ...prev,
        [studentLrn]: {
          ...prev[studentLrn],
          [subject]: newValue ? 'present' : 'absent'
        }
      }));

      if (newValue) {
        // If marking as present, insert/update a record
        const { error } = await supabase
          .from('attendance')
          .upsert({
            student_lrn: studentLrn,
            subject: subject,
            status: 'present',
            date: selectedDate
          });

        if (error) {
          console.error('Error adding attendance record:', error);
          // Revert local state on error
          setAttendance(prev => ({
            ...prev,
            [studentLrn]: {
              ...prev[studentLrn],
              [subject]: 'absent'
            }
          }));
        }
      } else {
        // If marking as absent, delete the record
        const { error } = await supabase
          .from('attendance')
          .delete()
          .eq('student_lrn', studentLrn)
          .eq('subject', subject)
          .eq('date', selectedDate);

        if (error) {
          console.error('Error removing attendance record:', error);
          // Revert local state on error
          setAttendance(prev => ({
            ...prev,
            [studentLrn]: {
              ...prev[studentLrn],
              [subject]: 'present'
            }
          }));
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      // Revert local state on error
      setAttendance(prev => ({
        ...prev,
        [studentLrn]: {
          ...prev[studentLrn],
          [subject]: currentValue ? 'present' : 'absent'
        }
      }));
    }
  };

  const renderSubjectCell = (studentLrn: string, subject: string) => {
    const isPresent = attendance[studentLrn]?.[subject] === 'present';
    return (
      <TouchableOpacity 
        style={styles.cell}
        onPress={() => handleIconPress(studentLrn, subject)}
      >
        <FontAwesome 
          name={isPresent ? 'check' : 'times'} 
          size={16} 
          color={isPresent ? '#28a745' : '#dc3545'}
        />
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.row}>
      <View style={styles.nameCell}>
        <Text style={styles.nameText}>
          {item.students ? `${item.students.first_name} ${item.students.middle_name || ''} ${item.students.last_name}` : 'Unknown Student'}
        </Text>
      </View>
      {SUBJECTS.map(subject => (
        <View key={subject} style={styles.subjectColumn}>
          {renderSubjectCell(item.student_lrn, subject)}
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.nameCell}>
          <Text style={styles.headerText}>STUDENT NAME</Text>
        </View>
        {SUBJECTS.map(subject => (
          <View key={subject} style={styles.subjectColumn}>
            <Text style={styles.headerText}>{subject}</Text>
          </View>
        ))}
      </View>
      <FlatList
        data={attendanceRecords}
        renderItem={renderItem}
        keyExtractor={item => item.student_lrn}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  nameCell: {
    flex: 2,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  subjectColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  nameText: {
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
});

export default AttendancePage;
