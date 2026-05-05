export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      offices: {
        Row: {
          id: string
          name: string
          qr_code_token: string
          standard_clock_in: string
          standard_clock_out: string
          work_duration_minutes: number
          timezone: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          qr_code_token: string
          standard_clock_in?: string
          standard_clock_out?: string
          work_duration_minutes?: number
          timezone?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          qr_code_token?: string
          standard_clock_in?: string
          standard_clock_out?: string
          work_duration_minutes?: number
          timezone?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          office_id: string | null
          role: 'employee' | 'admin'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          office_id?: string | null
          role?: 'employee' | 'admin'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          office_id?: string | null
          role?: 'employee' | 'admin'
          is_active?: boolean
          created_at?: string
        }
      }
      devices: {
        Row: {
          id: string
          user_id: string
          fingerprint: string
          user_agent: string | null
          last_seen_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          fingerprint: string
          user_agent?: string | null
          last_seen_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          fingerprint?: string
          user_agent?: string | null
          last_seen_at?: string
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          user_id: string
          office_id: string | null
          date: string
          clock_in_at: string | null
          clock_out_at: string | null
          minutes_late: number
          status: 'on_time' | 'late' | 'absent' | 'incomplete' | null
          device_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          office_id?: string | null
          date: string
          clock_in_at?: string | null
          clock_out_at?: string | null
          minutes_late?: number
          status?: 'on_time' | 'late' | 'absent' | 'incomplete' | null
          device_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          office_id?: string | null
          date?: string
          clock_in_at?: string | null
          clock_out_at?: string | null
          minutes_late?: number
          status?: 'on_time' | 'late' | 'absent' | 'incomplete' | null
          device_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_: string]: {
        Row: {}
        Insert: {}
        Update: {}
      }
    }
    Functions: {
      [_: string]: {
        Args: {}
        Returns: {}
      }
    }
    Enums: {
      [_: string]: {}
    }
  }
}
