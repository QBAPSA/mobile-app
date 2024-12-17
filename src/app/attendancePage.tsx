import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '@/src/app/lib/supbase';
import { RouteProp, useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

interface DatabaseStudent {
  first_name: string;
  middle_name: string | null;
  last_name: string;
}

interface Student {
  student_lrn: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
}

interface AttendanceRecord {
  log_id: number;
  student_lrn: string;
  date: string;
  status: string;
  evaluation: string;
  students: Student | null;
  student_name: string;
}

interface DatabaseRecord {
  log_id: number;
  student_lrn: string;
  date: string;
  status: string;
  evaluation: string;
  students: DatabaseStudent | null;
}

type AttendanceStatus = Record<string, boolean>;

type AttendanceRouteParams = {
  date?: string;
};

const SUBJECTS = ['TVL', 'PE', 'ENG', 'FIL', 'AP', 'SCI'];

const AttendancePage = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStatus>({});
  const [loading, setLoading] = useState(true);
  const route = useRoute<RouteProp<{ params: AttendanceRouteParams }>>();

  const selectedDate = route.params?.date || new Date().toISOString().split('T')[0];

  const formatDate = (date: string) => {
    const d = new Date(date);
    // Format to YYYY-MM-DD HH:mm:ss
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };

  const fetchAttendanceRecords = async (date: string, showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('monitoring_log')
        .select(`
          log_id,
          student_lrn,
          date,
          status,
          evaluation,
          students (
            first_name,
            middle_name,
            last_name
          )
        `)
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString());

      if (error) {
        console.error('Error fetching attendance records:', error.message);
        return;
      }

      // Map the records to include student_name and proper student info
      const formattedRecords: AttendanceRecord[] = (data as any[])?.map(record => {
        const studentInfo = record.students as DatabaseStudent;
        return {
          log_id: record.log_id,
          student_lrn: record.student_lrn,
          date: record.date,
          status: record.status,
          evaluation: record.evaluation,
          students: studentInfo ? {
            student_lrn: record.student_lrn,
            first_name: studentInfo.first_name,
            middle_name: studentInfo.middle_name,
            last_name: studentInfo.last_name
          } : null,
          student_name: studentInfo 
            ? `${studentInfo.first_name} ${studentInfo.middle_name || ''} ${studentInfo.last_name}`.trim()
            : ''
        };
      }) || [];

      setAttendanceRecords(formattedRecords);

      // Create an object to store attendance status
      const attendanceStatus: AttendanceStatus = {};
      formattedRecords.forEach(record => {
        SUBJECTS.forEach(subject => {
          attendanceStatus[`${record.student_lrn}-${subject}`] = record.status === 'present';
        });
      });

      setAttendance(attendanceStatus);
    } catch (err) {
      console.error('Error:', err);
      setAttendanceRecords([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleAttendanceToggle = async (studentLrn: string, subject: string) => {
    const key = `${studentLrn}-${subject}`;
    const currentStatus = attendance[key] === undefined ? true : attendance[key];
    
    // If already marked as absent (x), don't allow changes
    if (currentStatus === false) {
      return;
    }

    try {
      // Check authentication state
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        console.error('Authentication error:', authError || 'No active session');
        return;
      }

      // Update Supabase first
      const { error } = await supabase
        .from('monitoring_log')
        .upsert([{ 
          student_lrn: studentLrn,
          status: false,  // Always set to false (x)
          date: selectedDate,
          evaluation: 'absent'
        }], {
          onConflict: 'student_lrn,date',
        });

      if (error) {
        console.error('Error updating attendance:', error.message);
        return;
      }

      // Only update local state if Supabase update was successful
      setAttendance(prev => ({
        ...prev,
        [key]: false
      }));

    } catch (err) {
      console.error('Error:', err);
    }
  };

  const renderAttendanceIcon = (studentLrn: string, subject: string) => {
    // Get status from state, default to true if undefined
    const isPresent = attendance[`${studentLrn}-${subject}`] === undefined ? true : attendance[`${studentLrn}-${subject}`];
    return (
      <TouchableOpacity 
        onPress={() => handleAttendanceToggle(studentLrn, subject)}
        style={styles.checkContainer}
      >
        <Text style={[
          styles.checkMark,
          { color: isPresent ? '#4CAF50' : '#F44336' }
        ]}>
          {isPresent ? '✓' : '×'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.row}>
      <View style={[styles.cell, styles.nameCell]}>
        <Text style={styles.nameText}>
          {item.student_name || 'Unknown Student'}
        </Text>
      </View>
      {SUBJECTS.map((subject, index) => (
        <View key={`${item.student_lrn}-${subject}-${index}`} style={styles.cell}>
          {renderAttendanceIcon(item.student_lrn, subject)}
        </View>
      ))}
    </View>
  );

  useEffect(() => {
    // Initial fetch with loading indicator
    fetchAttendanceRecords(selectedDate, true);

    // Background refresh without loading indicator
    const interval = setInterval(() => {
      fetchAttendanceRecords(selectedDate, false);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.headerRow}>
            <View style={[styles.headerCell, styles.nameCell]}>
              <Text style={styles.headerText}>Name</Text>
            </View>
            {SUBJECTS.map(subject => (
              <View key={subject} style={styles.headerCell}>
                <Text style={styles.headerText}>{subject}</Text>
              </View>
            ))}
          </View>

          {/* Table Body */}
          <FlatList
            data={[...new Map(attendanceRecords.map(item => [item.student_lrn, item])).values()]}
            renderItem={renderItem}
            keyExtractor={item => item.student_lrn}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tableContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  headerCell: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  cell: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    minHeight: 48,
  },
  nameCell: {
    flex: 2,
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  nameText: {
    fontSize: 14,
    color: '#333',
  },
  checkContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    fontSize: 24,
    fontWeight: 'bold',
  }
});

export default AttendancePage;
