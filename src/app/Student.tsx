import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from './lib/supbase';

interface Log {
  log_id: number;
  activity: string;
  teacher: number;
  student: string;
  reason: string;
  comment: string;
  datetime: string;
}

interface Teacher {
  teacher_id: number;
  teacher: string;
}

interface Student {
  first_name: string;
  middle_name: string | null;
  last_name: string;
}

interface AttendanceRecord {
  student_lrn: string;
  date: string;
  status: string;
  evaluation: string;
  students: Array<{
    first_name: string;
    middle_name: string | null;
    last_name: string;
  }>;
}

const Student: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    fetchAttendanceRecords();
    fetchTeachers();
  }, []);

  const fetchLogs = async () => {
    try {
      console.log('Fetching logs...');
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('datetime', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('Logs fetched:', data?.length || 0, 'records');
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      console.log('Fetching attendance records...');
      const { data, error } = await supabase
        .from('attendance')
        .select(`student_lrn, date, status, evaluation, students (first_name, middle_name, last_name)`);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('Attendance records fetched:', data?.length || 0, 'records');
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', (error as any).message);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.teacher_id === teacherId);
    return teacher ? teacher.teacher : 'Unknown Teacher';
  };

  const getStudentName = (studentLRN: string) => {
    const attendanceRecord = attendanceRecords.find(att => att.student_lrn === studentLRN);
    if (!attendanceRecord) return studentLRN;
    
    const { first_name, middle_name, last_name } = attendanceRecord.students[0];
    return `${first_name} ${middle_name || ''} ${last_name}`.trim();
  };

  const renderLogItem = ({ item }: { item: Log }) => (
    <View style={styles.logItem}>
      <View style={styles.logRow}>
        <Text style={styles.label}>Activity:</Text>
        <Text style={styles.value}>{item.activity}</Text>
      </View>
      <View style={styles.logRow}>
        <Text style={styles.label}>Teacher:</Text>
        <Text style={styles.value}>{getTeacherName(item.teacher)}</Text>
      </View>
      <View style={styles.logRow}>
        <Text style={styles.label}>Student:</Text>
        <Text style={styles.value}>{getStudentName(item.student)}</Text>
      </View>
      <View style={styles.logRow}>
        <Text style={styles.label}>Reason:</Text>
        <Text style={styles.value}>{item.reason}</Text>
      </View>
      <View style={styles.logRow}>
        <Text style={styles.label}>Comment:</Text>
        <Text style={styles.value}>{item.comment}</Text>
      </View>
      <View style={styles.logRow}>
        <Text style={styles.label}>Date/Time:</Text>
        <Text style={styles.value}>{new Date(item.datetime).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Logs</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.log_id.toString()}
          renderItem={renderLogItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  logItem: {
    marginBottom: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  logRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    width: 80,
    color: '#666',
  },
  value: {
    flex: 1,
    color: '#333',
  },
});

export default Student;