// Generated from the SAVE Supabase project (puewobcjsgfiwcooxsmg).
// Regenerate after a migration rather than widening `any` casts: stale
// types are what let `decision_made_by` sit unwritten without the compiler
// ever noticing.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      applications: {
        Row: {
          ai_summary: string | null;
          ai_summary_generated_at: string | null;
          created_at: string;
          cycle_year: number | null;
          decision: string | null;
          decision_date: string | null;
          decision_actor_email: string | null;
          decision_actor_id: string | null;
          decision_actor_name: string | null;
          decision_made_by: string | null;
          decision_notes: string | null;
          findings_shared_at: string | null;
          id: string;
          immersive_discernment_notes: string | null;
          immersive_discernment_status: string | null;
          organization_id: string;
          relational_diligence_exception: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          ai_summary?: string | null;
          ai_summary_generated_at?: string | null;
          created_at?: string;
          cycle_year?: number | null;
          decision?: string | null;
          decision_date?: string | null;
          decision_actor_email?: string | null;
          decision_actor_id?: string | null;
          decision_actor_name?: string | null;
          decision_made_by?: string | null;
          decision_notes?: string | null;
          findings_shared_at?: string | null;
          id?: string;
          immersive_discernment_notes?: string | null;
          immersive_discernment_status?: string | null;
          organization_id: string;
          relational_diligence_exception?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          ai_summary?: string | null;
          ai_summary_generated_at?: string | null;
          created_at?: string;
          cycle_year?: number | null;
          decision?: string | null;
          decision_date?: string | null;
          decision_actor_email?: string | null;
          decision_actor_id?: string | null;
          decision_actor_name?: string | null;
          decision_made_by?: string | null;
          decision_notes?: string | null;
          findings_shared_at?: string | null;
          id?: string;
          immersive_discernment_notes?: string | null;
          immersive_discernment_status?: string | null;
          organization_id?: string;
          relational_diligence_exception?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      diligence_engagements: {
        Row: {
          application_id: string;
          character_confidence: "low" | "medium" | "high" | null;
          concerns: string[];
          created_actor_email: string | null;
          created_actor_id: string | null;
          created_actor_name: string | null;
          created_at: string;
          created_by: string | null;
          culture_confidence: "low" | "medium" | "high" | null;
          culture_observations: string | null;
          donor_excerpt: string | null;
          follow_ups: Json;
          id: string;
          kind:
            | "internal_leadership_review"
            | "onsite_visit"
            | "shared_meal"
            | "reference_conversation"
            | "video_call"
            | "other";
          leadership_character_observations: string | null;
          linked_voice_alignment_request_id: string | null;
          location: string | null;
          ministry_participants: Json;
          narrative: string | null;
          occurred_on: string | null;
          org_health_confidence: "low" | "medium" | "high" | null;
          org_health_observations: string | null;
          organization_id: string;
          private_notes: string | null;
          save_participants: string[];
          status: "scheduled" | "completed" | "written_up";
          strengths: string[];
          updated_at: string;
          visibility: "internal_only" | "summary_shareable";
        };
        Insert: {
          application_id: string;
          character_confidence?: "low" | "medium" | "high" | null;
          concerns?: string[];
          created_actor_email?: string | null;
          created_actor_id?: string | null;
          created_actor_name?: string | null;
          created_at?: string;
          created_by?: string | null;
          culture_confidence?: "low" | "medium" | "high" | null;
          culture_observations?: string | null;
          donor_excerpt?: string | null;
          follow_ups?: Json;
          id?: string;
          kind:
            | "internal_leadership_review"
            | "onsite_visit"
            | "shared_meal"
            | "reference_conversation"
            | "video_call"
            | "other";
          leadership_character_observations?: string | null;
          linked_voice_alignment_request_id?: string | null;
          location?: string | null;
          ministry_participants?: Json;
          narrative?: string | null;
          occurred_on?: string | null;
          org_health_confidence?: "low" | "medium" | "high" | null;
          org_health_observations?: string | null;
          organization_id: string;
          private_notes?: string | null;
          save_participants?: string[];
          status?: "scheduled" | "completed" | "written_up";
          strengths?: string[];
          updated_at?: string;
          visibility?: "internal_only" | "summary_shareable";
        };
        Update: {
          application_id?: string;
          character_confidence?: "low" | "medium" | "high" | null;
          concerns?: string[];
          created_actor_email?: string | null;
          created_actor_id?: string | null;
          created_actor_name?: string | null;
          created_at?: string;
          created_by?: string | null;
          culture_confidence?: "low" | "medium" | "high" | null;
          culture_observations?: string | null;
          donor_excerpt?: string | null;
          follow_ups?: Json;
          id?: string;
          kind?:
            | "internal_leadership_review"
            | "onsite_visit"
            | "shared_meal"
            | "reference_conversation"
            | "video_call"
            | "other";
          leadership_character_observations?: string | null;
          linked_voice_alignment_request_id?: string | null;
          location?: string | null;
          ministry_participants?: Json;
          narrative?: string | null;
          occurred_on?: string | null;
          org_health_confidence?: "low" | "medium" | "high" | null;
          org_health_observations?: string | null;
          organization_id?: string;
          private_notes?: string | null;
          save_participants?: string[];
          status?: "scheduled" | "completed" | "written_up";
          strengths?: string[];
          updated_at?: string;
          visibility?: "internal_only" | "summary_shareable";
        };
        Relationships: [
          {
            foreignKeyName: "diligence_engagements_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diligence_engagements_linked_voice_alignment_request_id_fkey";
            columns: ["linked_voice_alignment_request_id"];
            isOneToOne: false;
            referencedRelation: "voice_alignment_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diligence_engagements_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          application_id: string;
          document_type: string;
          file_name: string;
          file_size_bytes: number | null;
          id: string;
          review_notes: string | null;
          reviewed: boolean;
          reviewer_actor_email: string | null;
          reviewer_actor_id: string | null;
          reviewer_actor_name: string | null;
          reviewer_id: string | null;
          storage_path: string;
          uploaded_at: string;
          uploaded_by: string | null;
        };
        Insert: {
          application_id: string;
          document_type: string;
          file_name: string;
          file_size_bytes?: number | null;
          id?: string;
          review_notes?: string | null;
          reviewed?: boolean;
          reviewer_actor_email?: string | null;
          reviewer_actor_id?: string | null;
          reviewer_actor_name?: string | null;
          reviewer_id?: string | null;
          storage_path: string;
          uploaded_at?: string;
          uploaded_by?: string | null;
        };
        Update: {
          application_id?: string;
          document_type?: string;
          file_name?: string;
          file_size_bytes?: number | null;
          id?: string;
          review_notes?: string | null;
          reviewed?: boolean;
          reviewer_actor_email?: string | null;
          reviewer_actor_id?: string | null;
          reviewer_actor_name?: string | null;
          reviewer_id?: string | null;
          storage_path?: string;
          uploaded_at?: string;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      donor_briefs: {
        Row: {
          application_id: string;
          approved_actor_email: string | null;
          approved_actor_id: string | null;
          approved_actor_name: string | null;
          approved_at: string | null;
          approved_by: string | null;
          cautions: string[];
          commendations: string[];
          generated_actor_email: string | null;
          generated_actor_id: string | null;
          generated_actor_name: string | null;
          generated_at: string;
          generated_by: string | null;
          headline: string | null;
          id: string;
          include_voice_alignment: boolean;
          ministry_description: string | null;
          pdf_path: string | null;
          published: boolean;
          published_at: string | null;
          rationale: string | null;
          recommendation_level: string | null;
          review_outcome: string | null;
          review_note: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          reviewed_actor_id: string | null;
          reviewed_actor_name: string | null;
          reviewed_actor_email: string | null;
          slug: string | null;
        };
        Insert: {
          application_id: string;
          approved_actor_email?: string | null;
          approved_actor_id?: string | null;
          approved_actor_name?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          cautions?: string[];
          commendations?: string[];
          generated_actor_email?: string | null;
          generated_actor_id?: string | null;
          generated_actor_name?: string | null;
          generated_at?: string;
          generated_by?: string | null;
          headline?: string | null;
          id?: string;
          include_voice_alignment?: boolean;
          ministry_description?: string | null;
          pdf_path?: string | null;
          published?: boolean;
          published_at?: string | null;
          rationale?: string | null;
          recommendation_level?: string | null;
          review_outcome?: string | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewed_actor_id?: string | null;
          reviewed_actor_name?: string | null;
          reviewed_actor_email?: string | null;
          slug?: string | null;
        };
        Update: {
          application_id?: string;
          approved_actor_email?: string | null;
          approved_actor_id?: string | null;
          approved_actor_name?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          cautions?: string[];
          commendations?: string[];
          generated_actor_email?: string | null;
          generated_actor_id?: string | null;
          generated_actor_name?: string | null;
          generated_at?: string;
          generated_by?: string | null;
          headline?: string | null;
          id?: string;
          include_voice_alignment?: boolean;
          ministry_description?: string | null;
          pdf_path?: string | null;
          published?: boolean;
          published_at?: string | null;
          rationale?: string | null;
          recommendation_level?: string | null;
          review_outcome?: string | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewed_actor_id?: string | null;
          reviewed_actor_name?: string | null;
          reviewed_actor_email?: string | null;
          slug?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "donor_briefs_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      donor_requests: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          giving_focus: string;
          id: string;
          organization: string | null;
          referral_source: string;
          status: "pending" | "approved" | "declined";
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name: string;
          giving_focus: string;
          id?: string;
          organization?: string | null;
          referral_source: string;
          status?: "pending" | "approved" | "declined";
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          giving_focus?: string;
          id?: string;
          organization?: string | null;
          referral_source?: string;
          status?: "pending" | "approved" | "declined";
        };
        Relationships: [];
      };
      external_checks: {
        Row: {
          application_id: string;
          checked_actor_email: string | null;
          checked_actor_id: string | null;
          checked_actor_name: string | null;
          checked_at: string;
          checked_by: string | null;
          id: string;
          raw_result: Json;
          score_impact: number | null;
          source: string;
          status: string;
          summary: string | null;
        };
        Insert: {
          application_id: string;
          checked_actor_email?: string | null;
          checked_actor_id?: string | null;
          checked_actor_name?: string | null;
          checked_at?: string;
          checked_by?: string | null;
          id?: string;
          raw_result?: Json;
          score_impact?: number | null;
          source: string;
          status: string;
          summary?: string | null;
        };
        Update: {
          application_id?: string;
          checked_actor_email?: string | null;
          checked_actor_id?: string | null;
          checked_actor_name?: string | null;
          checked_at?: string;
          checked_by?: string | null;
          id?: string;
          raw_result?: Json;
          score_impact?: number | null;
          source?: string;
          status?: string;
          summary?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "external_checks_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      inquiry_events: {
        Row: {
          actor_id: string | null;
          actor_snapshot_email: string | null;
          actor_snapshot_id: string | null;
          actor_snapshot_name: string | null;
          application_id: string;
          created_at: string;
          id: string;
          kind: "submitted" | "more_info_requested" | "approved" | "rejected";
          ministry_message: string | null;
          occurred_at: string;
          staff_note: string | null;
        };
        Insert: {
          actor_id?: string | null;
          actor_snapshot_email?: string | null;
          actor_snapshot_id?: string | null;
          actor_snapshot_name?: string | null;
          application_id: string;
          created_at?: string;
          id?: string;
          kind: "submitted" | "more_info_requested" | "approved" | "rejected";
          ministry_message?: string | null;
          occurred_at?: string;
          staff_note?: string | null;
        };
        Update: {
          actor_id?: string | null;
          actor_snapshot_email?: string | null;
          actor_snapshot_id?: string | null;
          actor_snapshot_name?: string | null;
          application_id?: string;
          created_at?: string;
          id?: string;
          kind?: "submitted" | "more_info_requested" | "approved" | "rejected";
          ministry_message?: string | null;
          occurred_at?: string;
          staff_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "inquiry_events_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      inquiry_responses: {
        Row: {
          annual_reach: number | null;
          annual_revenue_range: string | null;
          application_id: string;
          audit_level: string | null;
          baptism_position: string | null;
          board_approved_budget: boolean | null;
          board_compensated: boolean | null;
          board_size: number | null;
          created_at: string;
          denomination: string | null;
          doctrinal_statement_url: string | null;
          files_990: boolean | null;
          financial_investigation: boolean | null;
          funding_rationale: string | null;
          funding_sources: string[];
          gospel_clarity: string | null;
          has_references: boolean | null;
          id: string;
          key_metric: string | null;
          lead_name: string | null;
          legal_action: boolean | null;
          moral_failure: boolean | null;
          ordination_status: string | null;
          raw_data: Json;
          referral_source: string | null;
          scripture_position: string | null;
          submitted_at: string | null;
          theological_education: string | null;
          updated_at: string;
          years_in_role: number | null;
        };
        Insert: {
          annual_reach?: number | null;
          annual_revenue_range?: string | null;
          application_id: string;
          audit_level?: string | null;
          baptism_position?: string | null;
          board_approved_budget?: boolean | null;
          board_compensated?: boolean | null;
          board_size?: number | null;
          created_at?: string;
          denomination?: string | null;
          doctrinal_statement_url?: string | null;
          files_990?: boolean | null;
          financial_investigation?: boolean | null;
          funding_rationale?: string | null;
          funding_sources?: string[];
          gospel_clarity?: string | null;
          has_references?: boolean | null;
          id?: string;
          key_metric?: string | null;
          lead_name?: string | null;
          legal_action?: boolean | null;
          moral_failure?: boolean | null;
          ordination_status?: string | null;
          raw_data?: Json;
          referral_source?: string | null;
          scripture_position?: string | null;
          submitted_at?: string | null;
          theological_education?: string | null;
          updated_at?: string;
          years_in_role?: number | null;
        };
        Update: {
          annual_reach?: number | null;
          annual_revenue_range?: string | null;
          application_id?: string;
          audit_level?: string | null;
          baptism_position?: string | null;
          board_approved_budget?: boolean | null;
          board_compensated?: boolean | null;
          board_size?: number | null;
          created_at?: string;
          denomination?: string | null;
          doctrinal_statement_url?: string | null;
          files_990?: boolean | null;
          financial_investigation?: boolean | null;
          funding_rationale?: string | null;
          funding_sources?: string[];
          gospel_clarity?: string | null;
          has_references?: boolean | null;
          id?: string;
          key_metric?: string | null;
          lead_name?: string | null;
          legal_action?: boolean | null;
          moral_failure?: boolean | null;
          ordination_status?: string | null;
          raw_data?: Json;
          referral_source?: string | null;
          scripture_position?: string | null;
          submitted_at?: string | null;
          theological_education?: string | null;
          updated_at?: string;
          years_in_role?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "inquiry_responses_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: true;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          assigned_reviewer_id: string | null;
          countries: string[];
          created_at: string;
          dba_name: string | null;
          ein: string | null;
          entity_type: string | null;
          geographic_scope: string[];
          id: string;
          legal_name: string;
          library_visible: boolean;
          notes: string | null;
          primary_focus: string[];
          state_of_incorporation: string | null;
          status: string;
          updated_at: string;
          website_url: string | null;
          year_founded: number | null;
        };
        Insert: {
          assigned_reviewer_id?: string | null;
          countries?: string[];
          created_at?: string;
          dba_name?: string | null;
          ein?: string | null;
          entity_type?: string | null;
          geographic_scope?: string[];
          id?: string;
          legal_name: string;
          library_visible?: boolean;
          notes?: string | null;
          primary_focus?: string[];
          state_of_incorporation?: string | null;
          status?: string;
          updated_at?: string;
          website_url?: string | null;
          year_founded?: number | null;
        };
        Update: {
          assigned_reviewer_id?: string | null;
          countries?: string[];
          created_at?: string;
          dba_name?: string | null;
          ein?: string | null;
          entity_type?: string | null;
          geographic_scope?: string[];
          id?: string;
          legal_name?: string;
          library_visible?: boolean;
          notes?: string | null;
          primary_focus?: string[];
          state_of_incorporation?: string | null;
          status?: string;
          updated_at?: string;
          website_url?: string | null;
          year_founded?: number | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          deactivated_at: string | null;
          id: string;
          organization_id: string | null;
          role: "admin" | "reviewer" | "analyst" | "ministry" | "donor";
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          deactivated_at?: string | null;
          id: string;
          organization_id?: string | null;
          role: "admin" | "reviewer" | "analyst" | "ministry" | "donor";
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          deactivated_at?: string | null;
          id?: string;
          organization_id?: string | null;
          role?: "admin" | "reviewer" | "analyst" | "ministry" | "donor";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      reviewer_notes: {
        Row: {
          application_id: string;
          created_at: string;
          id: string;
          is_internal: boolean;
          note: string;
          reviewer_actor_email: string | null;
          reviewer_actor_id: string | null;
          reviewer_actor_name: string | null;
          reviewer_id: string | null;
          section: string | null;
          updated_at: string;
        };
        Insert: {
          application_id: string;
          created_at?: string;
          id?: string;
          is_internal?: boolean;
          note: string;
          reviewer_actor_email?: string | null;
          reviewer_actor_id?: string | null;
          reviewer_actor_name?: string | null;
          reviewer_id?: string | null;
          section?: string | null;
          updated_at?: string;
        };
        Update: {
          application_id?: string;
          created_at?: string;
          id?: string;
          is_internal?: boolean;
          note?: string;
          reviewer_actor_email?: string | null;
          reviewer_actor_id?: string | null;
          reviewer_actor_name?: string | null;
          reviewer_id?: string | null;
          section?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviewer_notes_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      risk_flags: {
        Row: {
          application_id: string;
          category: string;
          description: string;
          flag_code: string;
          flagged_at: string;
          flagged_by: string;
          id: string;
          resolution_notes: string | null;
          resolved: boolean;
          resolved_actor_email: string | null;
          resolved_actor_id: string | null;
          resolved_actor_name: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          severity: "low" | "medium" | "high" | "hard_stop";
        };
        Insert: {
          application_id: string;
          category: string;
          description: string;
          flag_code: string;
          flagged_at?: string;
          flagged_by?: string;
          id?: string;
          resolution_notes?: string | null;
          resolved?: boolean;
          resolved_actor_email?: string | null;
          resolved_actor_id?: string | null;
          resolved_actor_name?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          severity: "low" | "medium" | "high" | "hard_stop";
        };
        Update: {
          application_id?: string;
          category?: string;
          description?: string;
          flag_code?: string;
          flagged_at?: string;
          flagged_by?: string;
          id?: string;
          resolution_notes?: string | null;
          resolved?: boolean;
          resolved_actor_email?: string | null;
          resolved_actor_id?: string | null;
          resolved_actor_name?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          severity?: "low" | "medium" | "high" | "hard_stop";
        };
        Relationships: [
          {
            foreignKeyName: "risk_flags_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      roadmap_items: {
        Row: {
          application_id: string;
          category: string | null;
          created_actor_email: string | null;
          created_actor_id: string | null;
          created_actor_name: string | null;
          created_at: string;
          created_by: string | null;
          detail: string | null;
          due_date: string | null;
          id: string;
          organization_id: string;
          owner: string | null;
          status: "open" | "in_progress" | "verified" | "waived";
          title: string;
          updated_at: string;
        };
        Insert: {
          application_id: string;
          category?: string | null;
          created_actor_email?: string | null;
          created_actor_id?: string | null;
          created_actor_name?: string | null;
          created_at?: string;
          created_by?: string | null;
          detail?: string | null;
          due_date?: string | null;
          id?: string;
          organization_id: string;
          owner?: string | null;
          status?: "open" | "in_progress" | "verified" | "waived";
          title: string;
          updated_at?: string;
        };
        Update: {
          application_id?: string;
          category?: string | null;
          created_actor_email?: string | null;
          created_actor_id?: string | null;
          created_actor_name?: string | null;
          created_at?: string;
          created_by?: string | null;
          detail?: string | null;
          due_date?: string | null;
          id?: string;
          organization_id?: string;
          owner?: string | null;
          status?: "open" | "in_progress" | "verified" | "waived";
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roadmap_items_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roadmap_items_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      score_components: {
        Row: {
          awarded_points: number;
          category: string;
          criterion: string;
          id: string;
          max_points: number;
          rationale: string | null;
          score_id: string;
        };
        Insert: {
          awarded_points: number;
          category: string;
          criterion: string;
          id?: string;
          max_points: number;
          rationale?: string | null;
          score_id: string;
        };
        Update: {
          awarded_points?: number;
          category?: string;
          criterion?: string;
          id?: string;
          max_points?: number;
          rationale?: string | null;
          score_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "score_components_score_id_fkey";
            columns: ["score_id"];
            isOneToOne: false;
            referencedRelation: "scores";
            referencedColumns: ["id"];
          },
        ];
      };
      scores: {
        Row: {
          application_id: string;
          calculated_at: string;
          calculated_by: string;
          doctrine_score: number | null;
          external_trust_score: number | null;
          financial_score: number | null;
          fruit_score: number | null;
          governance_score: number | null;
          hard_stop_reason: string | null;
          id: string;
          is_hard_stop: boolean;
          leadership_score: number | null;
          override_actor_email: string | null;
          override_actor_id: string | null;
          override_actor_name: string | null;
          override_by: string | null;
          override_notes: string | null;
          total_score: number | null;
        };
        Insert: {
          application_id: string;
          calculated_at?: string;
          calculated_by?: string;
          doctrine_score?: number | null;
          external_trust_score?: number | null;
          financial_score?: number | null;
          fruit_score?: number | null;
          governance_score?: number | null;
          hard_stop_reason?: string | null;
          id?: string;
          is_hard_stop?: boolean;
          leadership_score?: number | null;
          override_actor_email?: string | null;
          override_actor_id?: string | null;
          override_actor_name?: string | null;
          override_by?: string | null;
          override_notes?: string | null;
          total_score?: number | null;
        };
        Update: {
          application_id?: string;
          calculated_at?: string;
          calculated_by?: string;
          doctrine_score?: number | null;
          external_trust_score?: number | null;
          financial_score?: number | null;
          fruit_score?: number | null;
          governance_score?: number | null;
          hard_stop_reason?: string | null;
          id?: string;
          is_hard_stop?: boolean;
          leadership_score?: number | null;
          override_actor_email?: string | null;
          override_actor_id?: string | null;
          override_actor_name?: string | null;
          override_by?: string | null;
          override_notes?: string | null;
          total_score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "scores_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      vetting_responses: {
        Row: {
          annual_ed_review: boolean | null;
          application_id: string;
          attestation_name: string | null;
          attestation_signed_at: string | null;
          attestation_title: string | null;
          attests_doctrinal_alignment: boolean | null;
          attests_financial_integrity: boolean | null;
          attests_information_is_true: boolean | null;
          beneficiary_feedback: string | null;
          board_confrontation_willingness: number | null;
          board_meeting_frequency: string | null;
          compensation_set_by_board: boolean | null;
          conflict_of_interest_policy: boolean | null;
          created_at: string;
          decision_making_model: string | null;
          discipleship_outcomes: string | null;
          doctrinal_distinctives: string | null;
          doctrinal_non_negotiables: string | null;
          exec_salary_benchmark: string | null;
          family_on_board: boolean | null;
          governance_model: string | null;
          id: string;
          independent_board_count: number | null;
          leader_accountability: string | null;
          leader_conversion_narrative: string | null;
          leader_marital_status: string | null;
          leadership_conflict_notes: string | null;
          ministry_fruit_evidence: string | null;
          overhead_expense_pct: number | null;
          program_expense_pct: number | null;
          public_controversy_notes: string | null;
          raw_data: Json;
          recent_deficit: boolean | null;
          reference_check_summary: string | null;
          reputation_summary: string | null;
          reserve_fund_level: string | null;
          restricted_funds_misused: boolean | null;
          restricted_funds_tracked: boolean | null;
          sacramental_practice: string | null;
          statement_of_faith_alignment: string | null;
          submitted_at: string | null;
          updated_at: string;
          whistleblower_policy: boolean | null;
        };
        Insert: {
          annual_ed_review?: boolean | null;
          application_id: string;
          attestation_name?: string | null;
          attestation_signed_at?: string | null;
          attestation_title?: string | null;
          attests_doctrinal_alignment?: boolean | null;
          attests_financial_integrity?: boolean | null;
          attests_information_is_true?: boolean | null;
          beneficiary_feedback?: string | null;
          board_confrontation_willingness?: number | null;
          board_meeting_frequency?: string | null;
          compensation_set_by_board?: boolean | null;
          conflict_of_interest_policy?: boolean | null;
          created_at?: string;
          decision_making_model?: string | null;
          discipleship_outcomes?: string | null;
          doctrinal_distinctives?: string | null;
          doctrinal_non_negotiables?: string | null;
          exec_salary_benchmark?: string | null;
          family_on_board?: boolean | null;
          governance_model?: string | null;
          id?: string;
          independent_board_count?: number | null;
          leader_accountability?: string | null;
          leader_conversion_narrative?: string | null;
          leader_marital_status?: string | null;
          leadership_conflict_notes?: string | null;
          ministry_fruit_evidence?: string | null;
          overhead_expense_pct?: number | null;
          program_expense_pct?: number | null;
          public_controversy_notes?: string | null;
          raw_data?: Json;
          recent_deficit?: boolean | null;
          reference_check_summary?: string | null;
          reputation_summary?: string | null;
          reserve_fund_level?: string | null;
          restricted_funds_misused?: boolean | null;
          restricted_funds_tracked?: boolean | null;
          sacramental_practice?: string | null;
          statement_of_faith_alignment?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
          whistleblower_policy?: boolean | null;
        };
        Update: {
          annual_ed_review?: boolean | null;
          application_id?: string;
          attestation_name?: string | null;
          attestation_signed_at?: string | null;
          attestation_title?: string | null;
          attests_doctrinal_alignment?: boolean | null;
          attests_financial_integrity?: boolean | null;
          attests_information_is_true?: boolean | null;
          beneficiary_feedback?: string | null;
          board_confrontation_willingness?: number | null;
          board_meeting_frequency?: string | null;
          compensation_set_by_board?: boolean | null;
          conflict_of_interest_policy?: boolean | null;
          created_at?: string;
          decision_making_model?: string | null;
          discipleship_outcomes?: string | null;
          doctrinal_distinctives?: string | null;
          doctrinal_non_negotiables?: string | null;
          exec_salary_benchmark?: string | null;
          family_on_board?: boolean | null;
          governance_model?: string | null;
          id?: string;
          independent_board_count?: number | null;
          leader_accountability?: string | null;
          leader_conversion_narrative?: string | null;
          leader_marital_status?: string | null;
          leadership_conflict_notes?: string | null;
          ministry_fruit_evidence?: string | null;
          overhead_expense_pct?: number | null;
          program_expense_pct?: number | null;
          public_controversy_notes?: string | null;
          raw_data?: Json;
          recent_deficit?: boolean | null;
          reference_check_summary?: string | null;
          reputation_summary?: string | null;
          reserve_fund_level?: string | null;
          restricted_funds_misused?: boolean | null;
          restricted_funds_tracked?: boolean | null;
          sacramental_practice?: string | null;
          statement_of_faith_alignment?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
          whistleblower_policy?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "vetting_responses_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: true;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      voice_alignment_requests: {
        Row: {
          application_id: string;
          created_at: string;
          id: string;
          invite_token: string;
          invited_actor_email: string | null;
          invited_actor_id: string | null;
          invited_actor_name: string | null;
          invited_by: string | null;
          organization_id: string;
          relationship: string | null;
          request_type: "internal" | "external";
          responded_at: string | null;
          respondent_email: string;
          respondent_name: string;
          status: "pending" | "responded";
        };
        Insert: {
          application_id: string;
          created_at?: string;
          id?: string;
          invite_token?: string;
          invited_actor_email?: string | null;
          invited_actor_id?: string | null;
          invited_actor_name?: string | null;
          invited_by?: string | null;
          organization_id: string;
          relationship?: string | null;
          request_type: "internal" | "external";
          responded_at?: string | null;
          respondent_email: string;
          respondent_name: string;
          status?: "pending" | "responded";
        };
        Update: {
          application_id?: string;
          created_at?: string;
          id?: string;
          invite_token?: string;
          invited_actor_email?: string | null;
          invited_actor_id?: string | null;
          invited_actor_name?: string | null;
          invited_by?: string | null;
          organization_id?: string;
          relationship?: string | null;
          request_type?: "internal" | "external";
          responded_at?: string | null;
          respondent_email?: string;
          respondent_name?: string;
          status?: "pending" | "responded";
        };
        Relationships: [
          {
            foreignKeyName: "voice_alignment_requests_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "voice_alignment_requests_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      voice_alignment_responses: {
        Row: {
          additional_comments: string | null;
          application_id: string;
          concerns: string | null;
          concerns_inconsistencies: string | null;
          growth_areas: string | null;
          id: string;
          internal_culture: string | null;
          leader_character: string | null;
          org_leader_description: string | null;
          org_strengths: string | null;
          organization_id: string;
          positive_observations: string | null;
          request_id: string;
          request_type: "internal" | "external";
          respondent_email: string;
          respondent_name: string;
          role_relationship: string | null;
          submitted_at: string;
          support_recommendation: string | null;
          trust_recommendation: string | null;
          years_context_known: string | null;
        };
        Insert: {
          additional_comments?: string | null;
          application_id: string;
          concerns?: string | null;
          concerns_inconsistencies?: string | null;
          growth_areas?: string | null;
          id?: string;
          internal_culture?: string | null;
          leader_character?: string | null;
          org_leader_description?: string | null;
          org_strengths?: string | null;
          organization_id: string;
          positive_observations?: string | null;
          request_id: string;
          request_type: "internal" | "external";
          respondent_email: string;
          respondent_name: string;
          role_relationship?: string | null;
          submitted_at?: string;
          support_recommendation?: string | null;
          trust_recommendation?: string | null;
          years_context_known?: string | null;
        };
        Update: {
          additional_comments?: string | null;
          application_id?: string;
          concerns?: string | null;
          concerns_inconsistencies?: string | null;
          growth_areas?: string | null;
          id?: string;
          internal_culture?: string | null;
          leader_character?: string | null;
          org_leader_description?: string | null;
          org_strengths?: string | null;
          organization_id?: string;
          positive_observations?: string | null;
          request_id?: string;
          request_type?: "internal" | "external";
          respondent_email?: string;
          respondent_name?: string;
          role_relationship?: string | null;
          submitted_at?: string;
          support_recommendation?: string | null;
          trust_recommendation?: string | null;
          years_context_known?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "voice_alignment_responses_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "voice_alignment_responses_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "voice_alignment_responses_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: true;
            referencedRelation: "voice_alignment_requests";
            referencedColumns: ["id"];
          },
        ];
      };
      voice_alignment_summaries: {
        Row: {
          application_id: string;
          generated_at: string;
          id: string;
          organization_id: string;
          status:
            | "aligned"
            | "partially_aligned"
            | "misaligned"
            | "insufficient_data";
          summary: Json;
        };
        Insert: {
          application_id: string;
          generated_at?: string;
          id?: string;
          organization_id: string;
          status:
            | "aligned"
            | "partially_aligned"
            | "misaligned"
            | "insufficient_data";
          summary: Json;
        };
        Update: {
          application_id?: string;
          generated_at?: string;
          id?: string;
          organization_id?: string;
          status?:
            | "aligned"
            | "partially_aligned"
            | "misaligned"
            | "insufficient_data";
          summary?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "voice_alignment_summaries_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: true;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "voice_alignment_summaries_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

export type Organizations =
  Database["public"]["Tables"]["organizations"]["Row"];
export type Applications = Database["public"]["Tables"]["applications"]["Row"];
export type InquiryResponse =
  Database["public"]["Tables"]["inquiry_responses"]["Row"];
export type VettingResponse =
  Database["public"]["Tables"]["vetting_responses"]["Row"];
export type Score = Database["public"]["Tables"]["scores"]["Row"];
export type ScoreComponent =
  Database["public"]["Tables"]["score_components"]["Row"];
export type RiskFlag = Database["public"]["Tables"]["risk_flags"]["Row"];
export type ReviewerNote =
  Database["public"]["Tables"]["reviewer_notes"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type ExternalCheck =
  Database["public"]["Tables"]["external_checks"]["Row"];
export type DonorBrief = Database["public"]["Tables"]["donor_briefs"]["Row"];
export type DonorRequest =
  Database["public"]["Tables"]["donor_requests"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type VoiceAlignmentRequest =
  Database["public"]["Tables"]["voice_alignment_requests"]["Row"];
export type VoiceAlignmentResponse =
  Database["public"]["Tables"]["voice_alignment_responses"]["Row"];
export type VoiceAlignmentSummaryRecord =
  Database["public"]["Tables"]["voice_alignment_summaries"]["Row"];
export type DiligenceEngagement =
  Database["public"]["Tables"]["diligence_engagements"]["Row"];
export type RoadmapItem = Database["public"]["Tables"]["roadmap_items"]["Row"];
