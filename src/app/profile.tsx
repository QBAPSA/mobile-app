import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/app/lib/supbase'; // Adjust the import path as needed

interface Teacher {
  teacher: string;
  email: string;
  subject_id: string | null;
  subject_name?: string;
}

const Profile: React.FC = () => {
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        // Fetch the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          // Fetch teacher profile by email
          const { data: teacher, error: teacherError } = await supabase
            .from('teachers')
            .select('*')
            .eq('email', user.email)
            .single();

          if (teacherError) {
            console.error('Error fetching teacher profile:', teacherError.message);
            throw teacherError;
          }

          // Initialize teacher data
          const teacherProfile: Teacher = {
            ...teacher,
            subject_name: 'No subject assigned',
          };

          // Fetch subject name if subject_id exists
          if (teacher.subject_id) {
            console.log('Fetching subject for ID:', teacher.subject_id);
            const { data: subjects, error: subjectError } = await supabase
              .from('subjects')
              .select('subject_name')
              .eq('subject_id', teacher.subject_id)
              .limit(1);

            if (subjectError) {
              console.error('Error fetching subject name:', subjectError.message);
            } else if (subjects && subjects.length > 0) {
              teacherProfile.subject_name = subjects[0].subject_name;
            }
          }

          setTeacherData(teacherProfile);
        } else {
          router.push('/SignIn');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setTeacherData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, [router]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      router.push('/SignIn');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!teacherData) {
    return <Text>No teacher profile data found</Text>;
  }

  return (
    <View style={{ padding: 20, backgroundColor: 'white', flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>
        {teacherData.teacher || 'Teacher Name Not Found'}
      </Text>
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 16, color: 'black' }}>
          <Text style={{ fontWeight: 'bold' }}>📧 </Text>
          {teacherData.email}
        </Text>
        <Text style={{ fontSize: 16, color: 'black' }}>
          <Text style={{ fontWeight: 'bold' }}>📚 </Text>
          Subject: {teacherData.subject_name || 'No subject assigned'}
        </Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Sign Out" onPress={handleSignOut} color="red" />
      </View>
    </View>
  );
};

export default Profile;
