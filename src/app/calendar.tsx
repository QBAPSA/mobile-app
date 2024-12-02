import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useLocalSearchParams, Link } from 'expo-router'; // Link for navigation
import { supabase } from '@/src/app/lib/supbase'; // Adjust the import path as needed

const FunctionalCalendar = () => {
  const { month } = useLocalSearchParams(); // Get the month parameter from the route
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<string>(`2024-${month || '01'}`); // Default to January if no month is passed
  const [attendanceData, setAttendanceData] = useState<any>({}); // State to store attendance data

  const onDayPress = (day: { dateString: string }) => {
    const date = day.dateString;
    console.log('Selected Date:', date); // Log the selected date
    setSelectedDate(date);
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newMonth = direction === 'prev' ? month - 1 : month + 1;
    const newYear = newMonth === 0 ? year - 1 : newMonth === 13 ? year + 1 : year;
    const correctedMonth = newMonth === 0 ? 12 : newMonth === 13 ? 1 : newMonth;
    setCurrentMonth(`${newYear}-${String(correctedMonth).padStart(2, '0')}`);
  };

  const getMonthName = () => {
    const date = new Date(`${currentMonth}-01`);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Month Navigation Header */}
      <View style={styles.header}>
        <Button title="<" onPress={() => changeMonth('prev')} color="orange" />
        <Text style={styles.headerTitle}>{getMonthName()}</Text>
        <Button title=">" onPress={() => changeMonth('next')} color="orange" />
      </View>

      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: 'orange' },
        }}
        style={styles.calendar}
        current={`${currentMonth}-01`}
        hideExtraDays={true}
        enableSwipeMonths={true}
        theme={{
          backgroundColor: '#f0f0f0',
          calendarBackground: '#f0f0f0',
          textSectionTitleColor: '#000',
          selectedDayBackgroundColor: 'orange',
          selectedDayTextColor: '#fff',
          todayTextColor: 'red',
          dayTextColor: '#000',
          textDisabledColor: '#d9e1e8',
          monthTextColor: 'black',
          indicatorColor: 'blue',
        }}
      />

      {selectedDate ? (
        <Link
          href={`/attendancePage?date=${selectedDate}`} // Pass the selected date as a parameter
          style={styles.link} // Apply the link style here
        >
          Go to Attendance
        </Link>
      ) : (
        <Text style={styles.selectedDate}>No date selected</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    width: '100%',
  },
  selectedDate: {
    fontSize: 18,
    marginTop: 20,
  },
  link: {
    padding: 10,
    backgroundColor: 'orange',
    borderRadius: 5,
    marginTop: 20,
  },
});

export default FunctionalCalendar;
