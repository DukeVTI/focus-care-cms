export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chronology_entries: {
        Row: {
          author_name: string | null
          category: string | null
          created_at: string | null
          entry_date: string
          entry_time: string
          entry_type: string | null
          flagged_for_report: boolean | null
          id: string
          observation: string
          significance: string | null
          staff_id: string
          summary: string | null
          tags: string[] | null
          updated_at: string | null
          young_person_id: string
        }
        Insert: {
          author_name?: string | null
          category?: string | null
          created_at?: string | null
          entry_date: string
          entry_time: string
          entry_type?: string | null
          flagged_for_report?: boolean | null
          id?: string
          observation: string
          significance?: string | null
          staff_id: string
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          young_person_id: string
        }
        Update: {
          author_name?: string | null
          category?: string | null
          created_at?: string | null
          entry_date?: string
          entry_time?: string
          entry_type?: string | null
          flagged_for_report?: boolean | null
          id?: string
          observation?: string
          significance?: string | null
          staff_id?: string
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          young_person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chronology_entries_young_person_id_fkey"
            columns: ["young_person_id"]
            isOneToOne: false
            referencedRelation: "young_people"
            referencedColumns: ["id"]
          },
        ]
      }
      health_condition_entries: {
        Row: {
          category: string
          comment: string | null
          condition_name: string
          created_at: string | null
          free_text_condition: string | null
          id: string
          rating: number
          recorded_by: string
          updated_at: string | null
          young_person_id: string
        }
        Insert: {
          category: string
          comment?: string | null
          condition_name: string
          created_at?: string | null
          free_text_condition?: string | null
          id?: string
          rating?: number
          recorded_by: string
          updated_at?: string | null
          young_person_id: string
        }
        Update: {
          category?: string
          comment?: string | null
          condition_name?: string
          created_at?: string | null
          free_text_condition?: string | null
          id?: string
          rating?: number
          recorded_by?: string
          updated_at?: string | null
          young_person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_condition_entries_young_person_id_fkey"
            columns: ["young_person_id"]
            isOneToOne: false
            referencedRelation: "young_people"
            referencedColumns: ["id"]
          },
        ]
      }
      keywork_sessions: {
        Row: {
          author_name: string | null
          created_at: string | null
          duration_minutes: number
          follow_on_action: string | null
          follow_up_notes: string | null
          follow_up_required: boolean | null
          id: string
          linked_task_id: string | null
          location: string | null
          notes: string | null
          outcomes: string | null
          relevant_standard: string | null
          requires_task: boolean | null
          session_date: string
          session_type: string
          staff_id: string
          standards_framework: string | null
          standards_met: string[] | null
          standards_referenced: string[] | null
          task_allocation_role: string | null
          title: string | null
          topic: string
          updated_at: string | null
          young_person_id: string
        }
        Insert: {
          author_name?: string | null
          created_at?: string | null
          duration_minutes: number
          follow_on_action?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          linked_task_id?: string | null
          location?: string | null
          notes?: string | null
          outcomes?: string | null
          relevant_standard?: string | null
          requires_task?: boolean | null
          session_date: string
          session_type: string
          staff_id: string
          standards_framework?: string | null
          standards_met?: string[] | null
          standards_referenced?: string[] | null
          task_allocation_role?: string | null
          title?: string | null
          topic: string
          updated_at?: string | null
          young_person_id: string
        }
        Update: {
          author_name?: string | null
          created_at?: string | null
          duration_minutes?: number
          follow_on_action?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          linked_task_id?: string | null
          location?: string | null
          notes?: string | null
          outcomes?: string | null
          relevant_standard?: string | null
          requires_task?: boolean | null
          session_date?: string
          session_type?: string
          staff_id?: string
          standards_framework?: string | null
          standards_met?: string[] | null
          standards_referenced?: string[] | null
          task_allocation_role?: string | null
          title?: string | null
          topic?: string
          updated_at?: string | null
          young_person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "keywork_sessions_linked_task_id_fkey"
            columns: ["linked_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keywork_sessions_young_person_id_fkey"
            columns: ["young_person_id"]
            isOneToOne: false
            referencedRelation: "young_people"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_appointment_logs: {
        Row: {
          created_at: string | null
          date_of_visit: string
          id: string
          next_appointment_date: string | null
          outcome_notes: string | null
          provider_name: string
          recorded_by: string
          updated_at: string | null
          visit_type: string
          young_person_id: string
        }
        Insert: {
          created_at?: string | null
          date_of_visit: string
          id?: string
          next_appointment_date?: string | null
          outcome_notes?: string | null
          provider_name: string
          recorded_by: string
          updated_at?: string | null
          visit_type: string
          young_person_id: string
        }
        Update: {
          created_at?: string | null
          date_of_visit?: string
          id?: string
          next_appointment_date?: string | null
          outcome_notes?: string | null
          provider_name?: string
          recorded_by?: string
          updated_at?: string | null
          visit_type?: string
          young_person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_appointment_logs_young_person_id_fkey"
            columns: ["young_person_id"]
            isOneToOne: false
            referencedRelation: "young_people"
            referencedColumns: ["id"]
          },
        ]
      }
      missing_episodes: {
        Row: {
          case_id: string | null
          created_at: string | null
          edt_contact: string | null
          follow_up_actions: string | null
          found_by: string | null
          found_location: string | null
          id: string
          last_known_location: string | null
          missing_from: string
          missing_reason: string | null
          notes: string | null
          outcome: string | null
          police_notified: boolean | null
          police_reference: string | null
          reported_by: string
          return_reason: string | null
          returned_at: string | null
          risks_encountered: string | null
          status: string
          updated_at: string | null
          young_person_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          edt_contact?: string | null
          follow_up_actions?: string | null
          found_by?: string | null
          found_location?: string | null
          id?: string
          last_known_location?: string | null
          missing_from: string
          missing_reason?: string | null
          notes?: string | null
          outcome?: string | null
          police_notified?: boolean | null
          police_reference?: string | null
          reported_by: string
          return_reason?: string | null
          returned_at?: string | null
          risks_encountered?: string | null
          status?: string
          updated_at?: string | null
          young_person_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          edt_contact?: string | null
          follow_up_actions?: string | null
          found_by?: string | null
          found_location?: string | null
          id?: string
          last_known_location?: string | null
          missing_from?: string
          missing_reason?: string | null
          notes?: string | null
          outcome?: string | null
          police_notified?: boolean | null
          police_reference?: string | null
          reported_by?: string
          return_reason?: string | null
          returned_at?: string | null
          risks_encountered?: string | null
          status?: string
          updated_at?: string | null
          young_person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "missing_episodes_young_person_id_fkey"
            columns: ["young_person_id"]
            isOneToOne: false
            referencedRelation: "young_people"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          organization_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          organization_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          organization_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      risk_assessment_config: {
        Row: {
          created_at: string
          id: string
          sections: Json
          thresholds: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sections?: Json
          thresholds?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sections?: Json
          thresholds?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          assessed_by: string
          assessment_date: string
          created_at: string | null
          follow_up_needed: boolean | null
          id: string
          interventions_recommended: string | null
          level_change_flag: boolean | null
          linked_task_id: string | null
          notes: string | null
          previous_level: string | null
          protective_factors: string | null
          recommendations: string | null
          risk_factors: string | null
          risk_level: string
          risk_score: number
          section_scores: Json | null
          updated_at: string | null
          young_person_id: string
        }
        Insert: {
          assessed_by: string
          assessment_date: string
          created_at?: string | null
          follow_up_needed?: boolean | null
          id?: string
          interventions_recommended?: string | null
          level_change_flag?: boolean | null
          linked_task_id?: string | null
          notes?: string | null
          previous_level?: string | null
          protective_factors?: string | null
          recommendations?: string | null
          risk_factors?: string | null
          risk_level: string
          risk_score: number
          section_scores?: Json | null
          updated_at?: string | null
          young_person_id: string
        }
        Update: {
          assessed_by?: string
          assessment_date?: string
          created_at?: string | null
          follow_up_needed?: boolean | null
          id?: string
          interventions_recommended?: string | null
          level_change_flag?: boolean | null
          linked_task_id?: string | null
          notes?: string | null
          previous_level?: string | null
          protective_factors?: string | null
          recommendations?: string | null
          risk_factors?: string | null
          risk_level?: string
          risk_score?: number
          section_scores?: Json | null
          updated_at?: string | null
          young_person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_linked_task_id_fkey"
            columns: ["linked_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_young_person_id_fkey"
            columns: ["young_person_id"]
            isOneToOne: false
            referencedRelation: "young_people"
            referencedColumns: ["id"]
          },
        ]
      }
      safeguarding_risks: {
        Row: {
          added_by: string
          created_at: string | null
          date_added: string
          description: string
          id: string
          is_active: boolean | null
          mitigation_plan: string | null
          risk_category: string
          severity: string | null
          updated_at: string | null
          young_person_id: string
        }
        Insert: {
          added_by: string
          created_at?: string | null
          date_added?: string
          description: string
          id?: string
          is_active?: boolean | null
          mitigation_plan?: string | null
          risk_category: string
          severity?: string | null
          updated_at?: string | null
          young_person_id: string
        }
        Update: {
          added_by?: string
          created_at?: string | null
          date_added?: string
          description?: string
          id?: string
          is_active?: boolean | null
          mitigation_plan?: string | null
          risk_category?: string
          severity?: string | null
          updated_at?: string | null
          young_person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "safeguarding_risks_young_person_id_fkey"
            columns: ["young_person_id"]
            isOneToOne: false
            referencedRelation: "young_people"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string
          assigned_to_user_id: string | null
          assignee_type: string | null
          completed_at: string | null
          created_at: string | null
          created_by_user_id: string | null
          date_actioned: string | null
          description: string | null
          due_date: string | null
          expected_completion: string | null
          id: string
          importance: string
          reassigned_history: Json | null
          requires_support: string
          status: string
          support_required: boolean | null
          supporter_role: string | null
          title: string
          updated_at: string | null
          young_person_id: string
        }
        Insert: {
          assigned_to: string
          assigned_to_user_id?: string | null
          assignee_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          date_actioned?: string | null
          description?: string | null
          due_date?: string | null
          expected_completion?: string | null
          id?: string
          importance: string
          reassigned_history?: Json | null
          requires_support: string
          status?: string
          support_required?: boolean | null
          supporter_role?: string | null
          title: string
          updated_at?: string | null
          young_person_id: string
        }
        Update: {
          assigned_to?: string
          assigned_to_user_id?: string | null
          assignee_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          date_actioned?: string | null
          description?: string | null
          due_date?: string | null
          expected_completion?: string | null
          id?: string
          importance?: string
          reassigned_history?: Json | null
          requires_support?: string
          status?: string
          support_required?: boolean | null
          supporter_role?: string | null
          title?: string
          updated_at?: string | null
          young_person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_young_person_id_fkey"
            columns: ["young_person_id"]
            isOneToOne: false
            referencedRelation: "young_people"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      young_people: {
        Row: {
          activities_interests: string[] | null
          age: number | null
          allergies: string[] | null
          assigned_team: string | null
          attendance_concerns: boolean | null
          attendance_description: string | null
          care_legal_status: string | null
          communication_preferences: string[] | null
          court_orders: string | null
          created_at: string | null
          date_of_birth: string
          dietary_requirements: string[] | null
          disability_needs: string[] | null
          draft: boolean | null
          education_setting: string | null
          ehcp_review_date: string | null
          ehcp_status: string | null
          ethnicity: string | null
          first_name: string
          focus_id: string | null
          gender: string | null
          gp_practice: string | null
          health_support: string | null
          id: string
          id_details: string | null
          id_type: string | null
          id_value: string | null
          immigration_legal_status: string | null
          initial_risk_summary: string | null
          internal_notes: string | null
          interpreter_required: boolean | null
          iro_name: string | null
          key_worker_id: string | null
          known_risks: string[] | null
          last_name: string | null
          legal_status: string | null
          looked_after_child: boolean | null
          medical_conditions: string[] | null
          mental_health_next_appointment: string | null
          mental_health_service: string | null
          mental_health_support: boolean | null
          mental_health_worker: string | null
          nationality: string | null
          next_lac_review_date: string | null
          notes: string | null
          offending_details: Json | null
          offending_history: string | null
          photo_consent: string | null
          photo_url: string | null
          placement_address: string | null
          placement_info: string | null
          placement_postcode: string | null
          placement_road_name: string | null
          placement_start_date: string | null
          placement_type: string | null
          placing_authority: string | null
          preferred_name: string | null
          previous_placement: string | null
          primary_language: string | null
          pronouns: string | null
          protective_factors: string | null
          reason_for_placement: string | null
          reason_for_placement_notes: string | null
          religion: string | null
          residing_local_authority: string | null
          school_college: string | null
          social_media: string | null
          social_worker_email: string | null
          social_worker_name: string | null
          social_worker_phone: string | null
          tags: string[] | null
          time_looked_after: string | null
          triggers: string | null
          updated_at: string | null
          user_id: string
          visibility: string | null
          year_group: string | null
        }
        Insert: {
          activities_interests?: string[] | null
          age?: number | null
          allergies?: string[] | null
          assigned_team?: string | null
          attendance_concerns?: boolean | null
          attendance_description?: string | null
          care_legal_status?: string | null
          communication_preferences?: string[] | null
          court_orders?: string | null
          created_at?: string | null
          date_of_birth: string
          dietary_requirements?: string[] | null
          disability_needs?: string[] | null
          draft?: boolean | null
          education_setting?: string | null
          ehcp_review_date?: string | null
          ehcp_status?: string | null
          ethnicity?: string | null
          first_name: string
          focus_id?: string | null
          gender?: string | null
          gp_practice?: string | null
          health_support?: string | null
          id?: string
          id_details?: string | null
          id_type?: string | null
          id_value?: string | null
          immigration_legal_status?: string | null
          initial_risk_summary?: string | null
          internal_notes?: string | null
          interpreter_required?: boolean | null
          iro_name?: string | null
          key_worker_id?: string | null
          known_risks?: string[] | null
          last_name?: string | null
          legal_status?: string | null
          looked_after_child?: boolean | null
          medical_conditions?: string[] | null
          mental_health_next_appointment?: string | null
          mental_health_service?: string | null
          mental_health_support?: boolean | null
          mental_health_worker?: string | null
          nationality?: string | null
          next_lac_review_date?: string | null
          notes?: string | null
          offending_details?: Json | null
          offending_history?: string | null
          photo_consent?: string | null
          photo_url?: string | null
          placement_address?: string | null
          placement_info?: string | null
          placement_postcode?: string | null
          placement_road_name?: string | null
          placement_start_date?: string | null
          placement_type?: string | null
          placing_authority?: string | null
          preferred_name?: string | null
          previous_placement?: string | null
          primary_language?: string | null
          pronouns?: string | null
          protective_factors?: string | null
          reason_for_placement?: string | null
          reason_for_placement_notes?: string | null
          religion?: string | null
          residing_local_authority?: string | null
          school_college?: string | null
          social_media?: string | null
          social_worker_email?: string | null
          social_worker_name?: string | null
          social_worker_phone?: string | null
          tags?: string[] | null
          time_looked_after?: string | null
          triggers?: string | null
          updated_at?: string | null
          user_id: string
          visibility?: string | null
          year_group?: string | null
        }
        Update: {
          activities_interests?: string[] | null
          age?: number | null
          allergies?: string[] | null
          assigned_team?: string | null
          attendance_concerns?: boolean | null
          attendance_description?: string | null
          care_legal_status?: string | null
          communication_preferences?: string[] | null
          court_orders?: string | null
          created_at?: string | null
          date_of_birth?: string
          dietary_requirements?: string[] | null
          disability_needs?: string[] | null
          draft?: boolean | null
          education_setting?: string | null
          ehcp_review_date?: string | null
          ehcp_status?: string | null
          ethnicity?: string | null
          first_name?: string
          focus_id?: string | null
          gender?: string | null
          gp_practice?: string | null
          health_support?: string | null
          id?: string
          id_details?: string | null
          id_type?: string | null
          id_value?: string | null
          immigration_legal_status?: string | null
          initial_risk_summary?: string | null
          internal_notes?: string | null
          interpreter_required?: boolean | null
          iro_name?: string | null
          key_worker_id?: string | null
          known_risks?: string[] | null
          last_name?: string | null
          legal_status?: string | null
          looked_after_child?: boolean | null
          medical_conditions?: string[] | null
          mental_health_next_appointment?: string | null
          mental_health_service?: string | null
          mental_health_support?: boolean | null
          mental_health_worker?: string | null
          nationality?: string | null
          next_lac_review_date?: string | null
          notes?: string | null
          offending_details?: Json | null
          offending_history?: string | null
          photo_consent?: string | null
          photo_url?: string | null
          placement_address?: string | null
          placement_info?: string | null
          placement_postcode?: string | null
          placement_road_name?: string | null
          placement_start_date?: string | null
          placement_type?: string | null
          placing_authority?: string | null
          preferred_name?: string | null
          previous_placement?: string | null
          primary_language?: string | null
          pronouns?: string | null
          protective_factors?: string | null
          reason_for_placement?: string | null
          reason_for_placement_notes?: string | null
          religion?: string | null
          residing_local_authority?: string | null
          school_college?: string | null
          social_media?: string | null
          social_worker_email?: string | null
          social_worker_name?: string | null
          social_worker_phone?: string | null
          tags?: string[] | null
          time_looked_after?: string | null
          triggers?: string | null
          updated_at?: string | null
          user_id?: string
          visibility?: string | null
          year_group?: string | null
        }
        Relationships: []
      }
      young_person_contacts: {
        Row: {
          contact_name: string
          created_at: string | null
          email: string | null
          id: string
          is_emergency: boolean | null
          is_primary: boolean | null
          notes: string | null
          organisation: string | null
          phone: string | null
          relationship: string | null
          role: string | null
          updated_at: string | null
          young_person_id: string
        }
        Insert: {
          contact_name: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_emergency?: boolean | null
          is_primary?: boolean | null
          notes?: string | null
          organisation?: string | null
          phone?: string | null
          relationship?: string | null
          role?: string | null
          updated_at?: string | null
          young_person_id: string
        }
        Update: {
          contact_name?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_emergency?: boolean | null
          is_primary?: boolean | null
          notes?: string | null
          organisation?: string | null
          phone?: string | null
          relationship?: string | null
          role?: string | null
          updated_at?: string | null
          young_person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "young_person_contacts_young_person_id_fkey"
            columns: ["young_person_id"]
            isOneToOne: false
            referencedRelation: "young_people"
            referencedColumns: ["id"]
          },
        ]
      }
      young_person_documents: {
        Row: {
          created_at: string | null
          document_type: string
          expiry_date: string | null
          file_name: string
          file_path: string
          id: string
          updated_at: string | null
          young_person_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          expiry_date?: string | null
          file_name: string
          file_path: string
          id?: string
          updated_at?: string | null
          young_person_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          id?: string
          updated_at?: string | null
          young_person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "young_person_documents_young_person_id_fkey"
            columns: ["young_person_id"]
            isOneToOne: false
            referencedRelation: "young_people"
            referencedColumns: ["id"]
          },
        ]
      }
      young_person_medications: {
        Row: {
          created_at: string | null
          dosage: string | null
          frequency: string | null
          id: string
          medication_name: string
          notes: string | null
          updated_at: string | null
          young_person_id: string
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          medication_name: string
          notes?: string | null
          updated_at?: string | null
          young_person_id: string
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          medication_name?: string
          notes?: string | null
          updated_at?: string | null
          young_person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "young_person_medications_young_person_id_fkey"
            columns: ["young_person_id"]
            isOneToOne: false
            referencedRelation: "young_people"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_risk_level: {
        Args: { config_id: string; score: number }
        Returns: string
      }
      generate_missing_case_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "staff" | "keyworker" | "manager" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["staff", "keyworker", "manager", "admin"],
    },
  },
} as const
