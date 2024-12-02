import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, Modal, StyleSheet } from 'react-native';
import { supabase } from '@/src/app/lib/supbase';
import { getBackgroundColorAsync } from 'expo-system-ui';

interface Student {
  lrn: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  contact_number: string;
  parent_name: string;
  active_status: boolean;
  address: string;
}

const StudentCrud: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;

      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentStudent) return;

    const {
      lrn,
      first_name,
      middle_name,
      last_name,
      contact_number,
      parent_name,
      active_status,
      address,
    } = currentStudent;

    if (!lrn || !first_name || !last_name || !contact_number) {
      Alert.alert('Error', 'Please fill all required fields (LRN, First Name, Last Name, Contact Number).');
      return;
    }

    try {
      if (students.find((student) => student.lrn === lrn)) {
        // Update student
        const { error } = await supabase
          .from('students')
          .update({
            first_name,
            middle_name,
            last_name,
            contact_number,
            parent_name,
            active_status,
            address,
          })
          .eq('lrn', lrn);

        if (error) throw error;
      } else {
        // Add new student
        const { error } = await supabase
          .from('students')
          .insert([
            {
              lrn,
              first_name,
              middle_name,
              last_name,
              contact_number,
              parent_name,
              active_status,
              address,
            },
          ]);

        if (error) throw error;
      }

      fetchStudents();
      closeModal();
    } catch (error: any) {
      console.error('Error saving student:', error.message);
    }
  };

  const handleDelete = async (lrn: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('students').delete().eq('lrn', lrn);

              if (error) throw error;

              fetchStudents();
            } catch (error: any) {
              console.error('Error deleting student:', error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const openModal = (student: Student | null = null) => {
    setCurrentStudent(
      student || {
        lrn: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        contact_number: '',
        parent_name: '',
        active_status: false,
        address: '',
      }
    );
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentStudent(null);
  };

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={styles.studentItem}>
      <Text style={styles.studentText}>
        {item.first_name} {item.middle_name ? item.middle_name + ' ' : ''}{item.last_name}
      </Text>
      <Text style={styles.studentSubText}>LRN: {item.lrn}</Text>
      <Text style={styles.studentSubText}>Contact: {item.contact_number}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Edit" color="#333" onPress={() => openModal(item)} />
        <Button title="Delete" color="#333" onPress={() => handleDelete(item.lrn)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Management</Text>
      <Button title="Add New Student" color="#333" onPress={() => openModal()} />
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.lrn}
          renderItem={renderStudentItem}
          style={styles.list}
        />
      )}

      {/* Modal for Add/Edit Student */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={[styles.modalTitle, { color: '#333' }]}>
              {currentStudent?.lrn ? 'Edit Student' : 'Add New Student'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="LRN"
              value={currentStudent?.lrn || ''}
              onChangeText={(text) => setCurrentStudent({ ...currentStudent!, lrn: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={currentStudent?.first_name || ''}
              onChangeText={(text) => setCurrentStudent({ ...currentStudent!, first_name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Middle Name"
              value={currentStudent?.middle_name || ''}
              onChangeText={(text) => setCurrentStudent({ ...currentStudent!, middle_name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={currentStudent?.last_name || ''}
              onChangeText={(text) => setCurrentStudent({ ...currentStudent!, last_name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              value={currentStudent?.contact_number || ''}
              onChangeText={(text) => setCurrentStudent({ ...currentStudent!, contact_number: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Parent Name"
              value={currentStudent?.parent_name || ''}
              onChangeText={(text) => setCurrentStudent({ ...currentStudent!, parent_name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={currentStudent?.address || ''}
              onChangeText={(text) => setCurrentStudent({ ...currentStudent!, address: text })}
            />
            <View style={styles.buttonGroup}>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },

  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },

  list: { marginTop: 10 },

  studentItem: { padding: 10, borderBottomWidth: 1 },

  studentText: { fontSize: 16, fontWeight: 'bold' },

  studentSubText: { fontSize: 14, color: 'gray' },

  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },

  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },

  modalView: { margin: 20, padding: 20, backgroundColor: 'white', borderRadius: 10, elevation: 5 },

  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  
  input: { marginBottom: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10 },
  saveButton: { backgroundColor: '#333', padding: 10, borderRadius: 5 },

  saveButtonText: { color: 'white', textAlign: 'center' },

  cancelButton: { marginTop: 10, backgroundColor: '#333', padding: 10, borderRadius: 5 },

  cancelButtonText: { color: 'white', textAlign: 'center' },

  buttonGroup: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});

export default StudentCrud;
