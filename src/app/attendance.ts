export interface Attendance {
  LRN_Number: string;
  id: number;
  created_at: string; // Column for timestamp
  First_Name: string;      // First name
  Last_Name: string;      // Last name
  Middle_Initial: string;
  status_marked: boolean; // Boolean for marked/unmarked status
  students: {
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
}
