import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from './lib/supbase';

interface Log {
  log_id: number;
  activity: string;
  teacher: number; // Assuming teacher is an ID
  student: string; // This should match student_lrn in attendance
  reason: string;
  comment: string;
  datetime: string;
}

const Student: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('datetime', { ascending: false });

      if (error) throw error;

      console.log('Fetched logs:', data);
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Logs</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>Activity</Text>
            <Text style={styles.headerText}>Teacher</Text>
            <Text style={styles.headerText}>Student</Text>
            <Text style={styles.headerText}>Reason</Text>
            <Text style={styles.headerText}>Comment</Text>
            <Text style={styles.headerText}>Date/Time</Text>
          </View>
          <FlatList
            data={logs}
            keyExtractor={(item) => item.log_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.logItem}>
                <Text>{item.activity}</Text>
                <Text>{item.teacher}</Text>
                <Text>{item.student}</Text>
                <Text>{item.reason}</Text>
                <Text>{item.comment}</Text>
                <Text>{new Date(item.datetime).toLocaleString()}</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  logItem: { marginBottom: 15, padding: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 5 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  headerText: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
});

export default Student;