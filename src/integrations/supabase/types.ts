export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          file_name: string
          id: string
          org_id: string | null
          project_id: string
          task_id: string | null
          url: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          org_id?: string | null
          project_id: string
          task_id?: string | null
          url: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          org_id?: string | null
          project_id?: string
          task_id?: string | null
          url?: string
        }
        Relationships: []
      }
      budget_lines: {
        Row: {
          amount: number | null
          budget_id: string
          created_at: string
          id: string
          name: string
          org_id: string | null
        }
        Insert: {
          amount?: number | null
          budget_id: string
          created_at?: string
          id?: string
          name: string
          org_id?: string | null
        }
        Update: {
          amount?: number | null
          budget_id?: string
          created_at?: string
          id?: string
          name?: string
          org_id?: string | null
        }
        Relationships: []
      }
      budgets: {
        Row: {
          created_at: string
          id: string
          org_id: string
          project_id: string
          total_amount: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          project_id: string
          total_amount?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          project_id?: string
          total_amount?: number | null
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          checklist_id: string
          created_at: string
          done: boolean
          id: string
          org_id: string
          project_id: string
          seq: number
          task_id: string
          title: string
        }
        Insert: {
          checklist_id: string
          created_at?: string
          done?: boolean
          id?: string
          org_id: string
          project_id: string
          seq?: number
          task_id: string
          title: string
        }
        Update: {
          checklist_id?: string
          created_at?: string
          done?: boolean
          id?: string
          org_id?: string
          project_id?: string
          seq?: number
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          created_at: string
          id: string
          org_id: string
          project_id: string
          task_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          project_id: string
          task_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          project_id?: string
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          id: string
          name: string
          org_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          org_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          org_id?: string
        }
        Relationships: []
      }
      cross_org_timesheets: {
        Row: {
          approved_by_client: boolean
          created_at: string
          date: string
          id: string
          match_id: string
          minutes: number
          worker_user_id: string
        }
        Insert: {
          approved_by_client?: boolean
          created_at?: string
          date: string
          id?: string
          match_id: string
          minutes: number
          worker_user_id: string
        }
        Update: {
          approved_by_client?: boolean
          created_at?: string
          date?: string
          id?: string
          match_id?: string
          minutes?: number
          worker_user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          org_id: string
          severity: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          org_id: string
          severity?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          org_id?: string
          severity?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      intercompany_contracts: {
        Row: {
          client_org_id: string
          created_at: string
          id: string
          terms: Json | null
          vendor_org_id: string
        }
        Insert: {
          client_org_id: string
          created_at?: string
          id?: string
          terms?: Json | null
          vendor_org_id: string
        }
        Update: {
          client_org_id?: string
          created_at?: string
          id?: string
          terms?: Json | null
          vendor_org_id?: string
        }
        Relationships: []
      }
      invoice_lines: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          org_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          org_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          org_id?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          org_id: string
          status: string
          total: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          org_id: string
          status?: string
          total?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          org_id?: string
          status?: string
          total?: number | null
        }
        Relationships: []
      }
      labor_matches: {
        Row: {
          created_at: string
          id: string
          offer_id: string
          request_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          offer_id: string
          request_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          offer_id?: string
          request_id?: string
          status?: string
        }
        Relationships: []
      }
      labor_offers: {
        Row: {
          available_from: string | null
          available_to: string | null
          created_at: string
          id: string
          org_id_vendor: string
          profile_id: string
        }
        Insert: {
          available_from?: string | null
          available_to?: string | null
          created_at?: string
          id?: string
          org_id_vendor: string
          profile_id: string
        }
        Update: {
          available_from?: string | null
          available_to?: string | null
          created_at?: string
          id?: string
          org_id_vendor?: string
          profile_id?: string
        }
        Relationships: []
      }
      labor_profiles: {
        Row: {
          certs: Json | null
          created_at: string
          id: string
          org_id: string
          skills: Json | null
          user_id: string
        }
        Insert: {
          certs?: Json | null
          created_at?: string
          id?: string
          org_id: string
          skills?: Json | null
          user_id: string
        }
        Update: {
          certs?: Json | null
          created_at?: string
          id?: string
          org_id?: string
          skills?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      labor_requests: {
        Row: {
          created_at: string
          id: string
          needed_from: string | null
          needed_to: string | null
          org_id_client: string
          project_id: string | null
          qty: number
          role: string
        }
        Insert: {
          created_at?: string
          id?: string
          needed_from?: string | null
          needed_to?: string | null
          org_id_client: string
          project_id?: string | null
          qty?: number
          role: string
        }
        Update: {
          created_at?: string
          id?: string
          needed_from?: string | null
          needed_to?: string | null
          org_id_client?: string
          project_id?: string | null
          qty?: number
          role?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          created_at: string
          id: string
          name: string
          org_id: string
          sku: string | null
          unit: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          org_id: string
          sku?: string | null
          unit?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          sku?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          org_id: string
          project_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          org_id: string
          project_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          org_id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          org_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          whatsapp_phone: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          whatsapp_phone?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          org_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          org_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          org_id?: string
        }
        Relationships: []
      }
      phase_templates: {
        Row: {
          created_at: string
          id: string
          name: string
          org_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          org_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          org_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          phone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          phone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      project_assignments: {
        Row: {
          accepted_at: string | null
          created_at: string
          employer_org_id: string
          id: string
          is_external: boolean
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          employer_org_id: string
          id?: string
          is_external?: boolean
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          employer_org_id?: string
          id?: string
          is_external?: boolean
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_employer_org_id_fkey"
            columns: ["employer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_budget_lines: {
        Row: {
          category: string
          created_at: string
          currency: string
          id: string
          name: string
          org_id: string
          planned_amount: number | null
          project_id: string
        }
        Insert: {
          category: string
          created_at?: string
          currency?: string
          id?: string
          name: string
          org_id: string
          planned_amount?: number | null
          project_id: string
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          id?: string
          name?: string
          org_id?: string
          planned_amount?: number | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_budget_lines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          employer_org_id: string
          expires_at: string
          id: string
          project_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          employer_org_id: string
          expires_at: string
          id?: string
          project_id: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          employer_org_id?: string
          expires_at?: string
          id?: string
          project_id?: string
          token?: string
        }
        Relationships: []
      }
      project_participants: {
        Row: {
          created_at: string
          org_id: string
          project_id: string
          role: string
        }
        Insert: {
          created_at?: string
          org_id: string
          project_id: string
          role: string
        }
        Update: {
          created_at?: string
          org_id?: string
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_participants_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          name: string
          org_id: string
          project_id: string
          seq: number
          start_date: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          org_id: string
          project_id: string
          seq?: number
          start_date?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          org_id?: string
          project_id?: string
          seq?: number
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_rates: {
        Row: {
          bill_rate: number
          cost_rate: number | null
          currency: string
          employer_org_id: string
          id: string
          project_id: string
          user_id: string | null
        }
        Insert: {
          bill_rate: number
          cost_rate?: number | null
          currency?: string
          employer_org_id: string
          id?: string
          project_id: string
          user_id?: string | null
        }
        Update: {
          bill_rate?: number
          cost_rate?: number | null
          currency?: string
          employer_org_id?: string
          id?: string
          project_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_rates_employer_org_id_fkey"
            columns: ["employer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_rates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string
          id: string
          name: string
          org_id: string
          status: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          id?: string
          name: string
          org_id: string
          status?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          id: string
          org_id: string
          status: string
          total: number | null
          vendor: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          status?: string
          total?: number | null
          vendor: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          status?: string
          total?: number | null
          vendor?: string
        }
        Relationships: []
      }
      rate_cards: {
        Row: {
          created_at: string
          currency: string
          hourly_eur: number
          id: string
          org_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          hourly_eur: number
          id?: string
          org_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          hourly_eur?: number
          id?: string
          org_id?: string
          profile_id?: string
        }
        Relationships: []
      }
      settlements: {
        Row: {
          contract_id: string
          created_at: string
          id: string
          period_end: string
          period_start: string
          subtotal: number | null
          total: number | null
          vat: number | null
        }
        Insert: {
          contract_id: string
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          subtotal?: number | null
          total?: number | null
          vat?: number | null
        }
        Update: {
          contract_id?: string
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          subtotal?: number | null
          total?: number | null
          vat?: number | null
        }
        Relationships: []
      }
      shifts: {
        Row: {
          created_at: string
          end_at: string | null
          id: string
          org_id: string
          project_id: string | null
          start_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_at?: string | null
          id?: string
          org_id: string
          project_id?: string | null
          start_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_at?: string | null
          id?: string
          org_id?: string
          project_id?: string | null
          start_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          assignee_user_id: string
          created_at: string
          id: string
          org_id: string | null
          task_id: string
        }
        Insert: {
          assignee_user_id: string
          created_at?: string
          id?: string
          org_id?: string | null
          task_id: string
        }
        Update: {
          assignee_user_id?: string
          created_at?: string
          id?: string
          org_id?: string | null
          task_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee: string | null
          created_at: string
          due_date: string | null
          id: string
          org_id: string | null
          phase_id: string | null
          planned_hours: number | null
          project_id: string
          seq: number
          status: string
          title: string
        }
        Insert: {
          assignee?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          org_id?: string | null
          phase_id?: string | null
          planned_hours?: number | null
          project_id: string
          seq?: number
          status?: string
          title: string
        }
        Update: {
          assignee?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          org_id?: string | null
          phase_id?: string | null
          planned_hours?: number | null
          project_id?: string
          seq?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_phase_fk"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_logs: {
        Row: {
          assignment_id: string | null
          bill_to_org_id: string | null
          created_at: string
          employer_org_id: string | null
          ended_at: string | null
          id: string
          minutes: number | null
          note: string | null
          org_id: string
          project_id: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          assignment_id?: string | null
          bill_to_org_id?: string | null
          created_at?: string
          employer_org_id?: string | null
          ended_at?: string | null
          id?: string
          minutes?: number | null
          note?: string | null
          org_id: string
          project_id: string
          started_at: string
          status?: string
          user_id: string
        }
        Update: {
          assignment_id?: string | null
          bill_to_org_id?: string | null
          created_at?: string
          employer_org_id?: string | null
          ended_at?: string | null
          id?: string
          minutes?: number | null
          note?: string | null
          org_id?: string
          project_id?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_locations: {
        Row: {
          created_at: string
          id: string
          lat: number
          lng: number
          org_id: string
          project_id: string | null
          recorded_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lat: number
          lng: number
          org_id: string
          project_id?: string | null
          recorded_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          org_id?: string
          project_id?: string | null
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_project_budget_summary: {
        Row: {
          actual_hours: number | null
          currency: string | null
          planned_total: number | null
          project_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_budget_lines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_project_invite: {
        Args: { invite_id: string }
        Returns: boolean
      }
      create_org_with_admin: {
        Args: { org_name: string }
        Returns: string
      }
      ensure_participant: {
        Args: { project: string; org: string }
        Returns: boolean
      }
      has_org_role: {
        Args: { check_org: string; roles: string[] }
        Returns: boolean
      }
      is_org_member: {
        Args: { check_org: string }
        Returns: boolean
      }
      project_owner_org: {
        Args: { p_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
