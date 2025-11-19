// Person types (base for both User and Guest)
export interface Person {
  Person_ID: number;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone: string | null;
  Person_Type: 'User' | 'Guest';
}

// System Role types
export interface SystemRole {
  Role_ID: number;
  Role_Name: 'Admin' | 'Faculty' | 'Student';
  Description: string | null;
}

// User types (extends Person)
export interface User {
  Person_ID: number;
  Department: string | null;
  Year: number | null;
  Password: string;
  Role_ID: number;
  // Joined from Person
  First_Name?: string;
  Last_Name?: string;
  Email?: string;
  Phone?: string | null;
  Person_Type?: 'User';
  // Joined from SystemRole
  Role_Name?: 'Admin' | 'Faculty' | 'Student';
}

// Guest types (extends Person)
export interface Guest {
  Person_ID: number;
  Organization: string | null;
  // Joined from Person
  First_Name?: string;
  Last_Name?: string;
  Email?: string;
  Phone?: string | null;
  Person_Type?: 'Guest';
}

// Club types
export interface Club {
  Club_ID: number;
  Club_Name: string;
  Description: string | null;
  Date_Established: string; // date
  Created_By: number; // Person_ID of creator
  STATUS: 'Pending' | 'Active' | 'Inactive';
  // Joined fields
  Creator_First_Name?: string;
  Creator_Last_Name?: string;
  Member_Count?: number; // Count of active members
}

// Club Membership types
export interface ClubMembership {
  Membership_ID: number;
  Person_ID: number;
  Club_ID: number;
  Role: 'Club Leader' | 'Club Member';
  Date_Joined: string; // date
  Status: 'Active' | 'Inactive';
  // Joined fields from Person
  First_Name?: string;
  Last_Name?: string;
  Email?: string;
  Phone?: string | null;
  // Joined fields from Club
  Club_Name?: string;
}

// Event types
export interface Event {
  Event_ID: number;
  Club_ID: number;
  Event_Name: string;
  Description: string | null;
  Event_Date: string | null; // date
  Venue: string | null;
  // Joined fields
  Club_Name?: string;
  Attendee_Count?: number;
}

// Attendance types
export interface Attendance {
  Attendance_ID: number;
  Person_ID: number;
  Event_ID: number;
  Check_In_Time: string; // datetime
  // Joined fields
  First_Name?: string;
  Last_Name?: string;
  Event_Name?: string;
}

// Budget types
export interface Budget {
  Budget_ID: number;
  Club_ID: number;
  Academic_Year: string; // e.g., "2024-2025"
  Total_Allocated: number; // decimal
  Total_Spent: number; // decimal
  // Joined fields
  Club_Name?: string;
  Remaining?: number; // calculated
}

// Expenditure types
export interface Expenditure {
  Expenditure_ID: number;
  Budget_ID: number;
  Expense_Description: string | null;
  Amount: number; // decimal
  Request_Expense_Date: string; // date
  Status: 'Pending' | 'Approved' | 'Rejected';
  // Joined fields
  Club_Name?: string;
  Academic_Year?: string;
}

// View: Active Club Members
export interface ActiveClubMember {
  Membership_ID: number;
  Person_ID: number;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Club_ID: number;
  Club_Name: string;
  Role: 'Club Leader' | 'Club Member';
  Date_Joined: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalUsers: number;
  totalClubs: number;
  activeClubs: number;
  pendingClubs: number;
  totalEvents: number;
  upcomingEvents: number;
  totalMembers: number;
  activeMembers: number;
  totalBudgetAllocated: number;
  totalBudgetSpent: number;
}

// API Response wrapper
// Backend returns: { status: "success" | "error", data?: T, message?: string, results?: number }
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  results?: number;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter/Query types
export interface UserFilters {
  role?: SystemRole['Role_Name'];
  department?: string;
  year?: number;
  search?: string;
}

export interface ClubFilters {
  status?: Club['STATUS'];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EventFilters {
  clubId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface MembershipFilters {
  clubId?: number;
  role?: ClubMembership['Role'];
  status?: ClubMembership['Status'];
  search?: string;
}

// Form types
export interface PersonFormData {
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone?: string;
}

export interface UserFormData extends PersonFormData {
  Department?: string;
  Year?: number;
  Password: string;
  Role_ID: number;
}

export interface ClubFormData {
  Club_Name: string;
  Description?: string;
  Date_Established: string;
}

export interface EventFormData {
  Club_ID: number;
  Event_Name: string;
  Description?: string;
  Event_Date: string;
  Venue?: string;
}

export interface MembershipFormData {
  Person_ID: number;
  Club_ID: number;
  Role: 'Club Leader' | 'Club Member';
}

export interface ExpenditureFormData {
  Budget_ID: number;
  Expense_Description?: string;
  Amount: number;
}
