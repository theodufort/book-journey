export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          created_at: string | null;
          id: string;
          instance_id: string | null;
          ip_address: string;
          payload: Json | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          instance_id?: string | null;
          ip_address?: string;
          payload?: Json | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          instance_id?: string | null;
          ip_address?: string;
          payload?: Json | null;
        };
        Relationships: [];
      };
      flow_state: {
        Row: {
          auth_code: string;
          auth_code_issued_at: string | null;
          authentication_method: string;
          code_challenge: string;
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"];
          created_at: string | null;
          id: string;
          provider_access_token: string | null;
          provider_refresh_token: string | null;
          provider_type: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          auth_code: string;
          auth_code_issued_at?: string | null;
          authentication_method: string;
          code_challenge: string;
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"];
          created_at?: string | null;
          id: string;
          provider_access_token?: string | null;
          provider_refresh_token?: string | null;
          provider_type: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          auth_code?: string;
          auth_code_issued_at?: string | null;
          authentication_method?: string;
          code_challenge?: string;
          code_challenge_method?: Database["auth"]["Enums"]["code_challenge_method"];
          created_at?: string | null;
          id?: string;
          provider_access_token?: string | null;
          provider_refresh_token?: string | null;
          provider_type?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      identities: {
        Row: {
          created_at: string | null;
          email: string | null;
          id: string;
          identity_data: Json;
          last_sign_in_at: string | null;
          provider: string;
          provider_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          id?: string;
          identity_data: Json;
          last_sign_in_at?: string | null;
          provider: string;
          provider_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          id?: string;
          identity_data?: Json;
          last_sign_in_at?: string | null;
          provider?: string;
          provider_id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      instances: {
        Row: {
          created_at: string | null;
          id: string;
          raw_base_config: string | null;
          updated_at: string | null;
          uuid: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          raw_base_config?: string | null;
          updated_at?: string | null;
          uuid?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          raw_base_config?: string | null;
          updated_at?: string | null;
          uuid?: string | null;
        };
        Relationships: [];
      };
      mfa_amr_claims: {
        Row: {
          authentication_method: string;
          created_at: string;
          id: string;
          session_id: string;
          updated_at: string;
        };
        Insert: {
          authentication_method: string;
          created_at: string;
          id: string;
          session_id: string;
          updated_at: string;
        };
        Update: {
          authentication_method?: string;
          created_at?: string;
          id?: string;
          session_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mfa_amr_claims_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      mfa_challenges: {
        Row: {
          created_at: string;
          factor_id: string;
          id: string;
          ip_address: unknown;
          verified_at: string | null;
        };
        Insert: {
          created_at: string;
          factor_id: string;
          id: string;
          ip_address: unknown;
          verified_at?: string | null;
        };
        Update: {
          created_at?: string;
          factor_id?: string;
          id?: string;
          ip_address?: unknown;
          verified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "mfa_challenges_auth_factor_id_fkey";
            columns: ["factor_id"];
            isOneToOne: false;
            referencedRelation: "mfa_factors";
            referencedColumns: ["id"];
          }
        ];
      };
      mfa_factors: {
        Row: {
          created_at: string;
          factor_type: Database["auth"]["Enums"]["factor_type"];
          friendly_name: string | null;
          id: string;
          secret: string | null;
          status: Database["auth"]["Enums"]["factor_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at: string;
          factor_type: Database["auth"]["Enums"]["factor_type"];
          friendly_name?: string | null;
          id: string;
          secret?: string | null;
          status: Database["auth"]["Enums"]["factor_status"];
          updated_at: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          factor_type?: Database["auth"]["Enums"]["factor_type"];
          friendly_name?: string | null;
          id?: string;
          secret?: string | null;
          status?: Database["auth"]["Enums"]["factor_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mfa_factors_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      one_time_tokens: {
        Row: {
          created_at: string;
          id: string;
          relates_to: string;
          token_hash: string;
          token_type: Database["auth"]["Enums"]["one_time_token_type"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          relates_to: string;
          token_hash: string;
          token_type: Database["auth"]["Enums"]["one_time_token_type"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          relates_to?: string;
          token_hash?: string;
          token_type?: Database["auth"]["Enums"]["one_time_token_type"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "one_time_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      refresh_tokens: {
        Row: {
          created_at: string | null;
          id: number;
          instance_id: string | null;
          parent: string | null;
          revoked: boolean | null;
          session_id: string | null;
          token: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          instance_id?: string | null;
          parent?: string | null;
          revoked?: boolean | null;
          session_id?: string | null;
          token?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          instance_id?: string | null;
          parent?: string | null;
          revoked?: boolean | null;
          session_id?: string | null;
          token?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      saml_providers: {
        Row: {
          attribute_mapping: Json | null;
          created_at: string | null;
          entity_id: string;
          id: string;
          metadata_url: string | null;
          metadata_xml: string;
          name_id_format: string | null;
          sso_provider_id: string;
          updated_at: string | null;
        };
        Insert: {
          attribute_mapping?: Json | null;
          created_at?: string | null;
          entity_id: string;
          id: string;
          metadata_url?: string | null;
          metadata_xml: string;
          name_id_format?: string | null;
          sso_provider_id: string;
          updated_at?: string | null;
        };
        Update: {
          attribute_mapping?: Json | null;
          created_at?: string | null;
          entity_id?: string;
          id?: string;
          metadata_url?: string | null;
          metadata_xml?: string;
          name_id_format?: string | null;
          sso_provider_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "saml_providers_sso_provider_id_fkey";
            columns: ["sso_provider_id"];
            isOneToOne: false;
            referencedRelation: "sso_providers";
            referencedColumns: ["id"];
          }
        ];
      };
      saml_relay_states: {
        Row: {
          created_at: string | null;
          flow_state_id: string | null;
          for_email: string | null;
          id: string;
          redirect_to: string | null;
          request_id: string;
          sso_provider_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          flow_state_id?: string | null;
          for_email?: string | null;
          id: string;
          redirect_to?: string | null;
          request_id: string;
          sso_provider_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          flow_state_id?: string | null;
          for_email?: string | null;
          id?: string;
          redirect_to?: string | null;
          request_id?: string;
          sso_provider_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "saml_relay_states_flow_state_id_fkey";
            columns: ["flow_state_id"];
            isOneToOne: false;
            referencedRelation: "flow_state";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saml_relay_states_sso_provider_id_fkey";
            columns: ["sso_provider_id"];
            isOneToOne: false;
            referencedRelation: "sso_providers";
            referencedColumns: ["id"];
          }
        ];
      };
      schema_migrations: {
        Row: {
          version: string;
        };
        Insert: {
          version: string;
        };
        Update: {
          version?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          aal: Database["auth"]["Enums"]["aal_level"] | null;
          created_at: string | null;
          factor_id: string | null;
          id: string;
          ip: unknown | null;
          not_after: string | null;
          refreshed_at: string | null;
          tag: string | null;
          updated_at: string | null;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null;
          created_at?: string | null;
          factor_id?: string | null;
          id: string;
          ip?: unknown | null;
          not_after?: string | null;
          refreshed_at?: string | null;
          tag?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null;
          created_at?: string | null;
          factor_id?: string | null;
          id?: string;
          ip?: unknown | null;
          not_after?: string | null;
          refreshed_at?: string | null;
          tag?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      sso_domains: {
        Row: {
          created_at: string | null;
          domain: string;
          id: string;
          sso_provider_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          domain: string;
          id: string;
          sso_provider_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          domain?: string;
          id?: string;
          sso_provider_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sso_domains_sso_provider_id_fkey";
            columns: ["sso_provider_id"];
            isOneToOne: false;
            referencedRelation: "sso_providers";
            referencedColumns: ["id"];
          }
        ];
      };
      sso_providers: {
        Row: {
          created_at: string | null;
          id: string;
          resource_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          resource_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          resource_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          aud: string | null;
          banned_until: string | null;
          confirmation_sent_at: string | null;
          confirmation_token: string | null;
          confirmed_at: string | null;
          created_at: string | null;
          deleted_at: string | null;
          email: string | null;
          email_change: string | null;
          email_change_confirm_status: number | null;
          email_change_sent_at: string | null;
          email_change_token_current: string | null;
          email_change_token_new: string | null;
          email_confirmed_at: string | null;
          encrypted_password: string;
          id: string;
          instance_id: string | null;
          invited_at: string | null;
          is_anonymous: boolean;
          is_sso_user: boolean;
          is_super_admin: boolean | null;
          last_sign_in_at: string | null;
          phone: string | null;
          phone_change: string | null;
          phone_change_sent_at: string | null;
          phone_change_token: string | null;
          phone_confirmed_at: string | null;
          raw_app_meta_data: Json | null;
          raw_user_meta_data: Json | null;
          reauthentication_sent_at: string | null;
          reauthentication_token: string | null;
          recovery_sent_at: string | null;
          recovery_token: string | null;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          aud?: string | null;
          banned_until?: string | null;
          confirmation_sent_at?: string | null;
          confirmation_token?: string | null;
          confirmed_at?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          email_change?: string | null;
          email_change_confirm_status?: number | null;
          email_change_sent_at?: string | null;
          email_change_token_current?: string | null;
          email_change_token_new?: string | null;
          email_confirmed_at?: string | null;
          encrypted_password: string;
          id: string;
          instance_id?: string | null;
          invited_at?: string | null;
          is_anonymous?: boolean;
          is_sso_user?: boolean;
          is_super_admin?: boolean | null;
          last_sign_in_at?: string | null;
          phone?: string | null;
          phone_change?: string | null;
          phone_change_sent_at?: string | null;
          phone_change_token?: string | null;
          phone_confirmed_at?: string | null;
          raw_app_meta_data?: Json | null;
          raw_user_meta_data?: Json | null;
          reauthentication_sent_at?: string | null;
          reauthentication_token?: string | null;
          recovery_sent_at?: string | null;
          recovery_token?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          aud?: string | null;
          banned_until?: string | null;
          confirmation_sent_at?: string | null;
          confirmation_token?: string | null;
          confirmed_at?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          email_change?: string | null;
          email_change_confirm_status?: number | null;
          email_change_sent_at?: string | null;
          email_change_token_current?: string | null;
          email_change_token_new?: string | null;
          email_confirmed_at?: string | null;
          encrypted_password?: string;
          id?: string;
          instance_id?: string | null;
          invited_at?: string | null;
          is_anonymous?: boolean;
          is_sso_user?: boolean;
          is_super_admin?: boolean | null;
          last_sign_in_at?: string | null;
          phone?: string | null;
          phone_change?: string | null;
          phone_change_sent_at?: string | null;
          phone_change_token?: string | null;
          phone_confirmed_at?: string | null;
          raw_app_meta_data?: Json | null;
          raw_user_meta_data?: Json | null;
          reauthentication_sent_at?: string | null;
          reauthentication_token?: string | null;
          recovery_sent_at?: string | null;
          recovery_token?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      email: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      jwt: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      uid: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      aal_level: "aal1" | "aal2" | "aal3";
      code_challenge_method: "s256" | "plain";
      factor_status: "unverified" | "verified";
      factor_type: "totp" | "webauthn";
      one_time_token_type:
        | "confirmation_token"
        | "reauthentication_token"
        | "recovery_token"
        | "email_change_token_new"
        | "email_change_token_current"
        | "phone_change_token";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string | null;
          id: string;
          messages: Json;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          messages: Json;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          messages?: Json;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      article_categories: {
        Row: {
          article_id: number;
          category_id: number;
        };
        Insert: {
          article_id: number;
          category_id: number;
        };
        Update: {
          article_id?: number;
          category_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "article_categories_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "blog_articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "article_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "blog_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      blog_articles: {
        Row: {
          content: string;
          created_at: string | null;
          description: string | null;
          id: number;
          image_alt: string | null;
          image_url: string | null;
          isbn_13: string | null;
          published_at: string | null;
          slug: string;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          description?: string | null;
          id?: number;
          image_alt?: string | null;
          image_url?: string | null;
          isbn_13?: string | null;
          published_at?: string | null;
          slug: string;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          description?: string | null;
          id?: number;
          image_alt?: string | null;
          image_url?: string | null;
          isbn_13?: string | null;
          published_at?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      blog_categories: {
        Row: {
          description: string | null;
          id: number;
          name: string;
          slug: string;
        };
        Insert: {
          description?: string | null;
          id?: number;
          name: string;
          slug: string;
        };
        Update: {
          description?: string | null;
          id?: number;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      books: {
        Row: {
          added_at: string;
          data: Json;
          isbn_13: string;
        };
        Insert: {
          added_at?: string;
          data: Json;
          isbn_13: string;
        };
        Update: {
          added_at?: string;
          data?: Json;
          isbn_13?: string;
        };
        Relationships: [];
      };
      books_like: {
        Row: {
          books: string[];
          id: string;
        };
        Insert: {
          books: string[];
          id: string;
        };
        Update: {
          books?: string[];
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "books_like_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "books";
            referencedColumns: ["isbn_13"];
          }
        ];
      };
      books_modifications: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_approved: boolean | null;
          is_reviewed: boolean | null;
          isbn_13: string;
          page_count: number | null;
          title: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_approved?: boolean | null;
          is_reviewed?: boolean | null;
          isbn_13: string;
          page_count?: number | null;
          title?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_approved?: boolean | null;
          is_reviewed?: boolean | null;
          isbn_13?: string;
          page_count?: number | null;
          title?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "books_modifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      friends: {
        Row: {
          created_at: string | null;
          friend_id: string | null;
          id: number;
          status: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          friend_id?: string | null;
          id?: number;
          status?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          friend_id?: string | null;
          id?: number;
          status?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "friends_friend_id_fkey";
            columns: ["friend_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friends_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      habits: {
        Row: {
          created_at: string;
          id: string;
          metric: string;
          periodicity: string;
          progress_value: number;
          streak: Json[] | null;
          user_id: string | null;
          value: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metric: string;
          periodicity: string;
          progress_value?: number;
          streak?: Json[] | null;
          user_id?: string | null;
          value?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          metric?: string;
          periodicity?: string;
          progress_value?: number;
          streak?: Json[] | null;
          user_id?: string | null;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      indie_authors: {
        Row: {
          author_id: string;
          birth_date: string | null;
          first_book_published_year: string | null;
          is_approved: boolean;
          main_writing_genres: string[];
          name: string | null;
          personal_favorite_genres: string[];
          picture_link: string;
          presentation: string | null;
          type_of_books: string[];
          website: string | null;
        };
        Insert: {
          author_id: string;
          birth_date?: string | null;
          first_book_published_year?: string | null;
          is_approved?: boolean;
          main_writing_genres: string[];
          name?: string | null;
          personal_favorite_genres: string[];
          picture_link: string;
          presentation?: string | null;
          type_of_books: string[];
          website?: string | null;
        };
        Update: {
          author_id?: string;
          birth_date?: string | null;
          first_book_published_year?: string | null;
          is_approved?: boolean;
          main_writing_genres?: string[];
          name?: string | null;
          personal_favorite_genres?: string[];
          picture_link?: string;
          presentation?: string | null;
          type_of_books?: string[];
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "indie_authors_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "indie_authors_author_id_fkey1";
            columns: ["author_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      indie_authors_books: {
        Row: {
          author_id: string | null;
          book_id: string;
          categories: string[];
          cover_image_large_link: string;
          cover_image_small_link: string;
          description: string;
          is_approved: boolean;
          release_date: string | null;
          title: string;
        };
        Insert: {
          author_id?: string | null;
          book_id: string;
          categories: string[];
          cover_image_large_link: string;
          cover_image_small_link: string;
          description: string;
          is_approved?: boolean;
          release_date?: string | null;
          title: string;
        };
        Update: {
          author_id?: string | null;
          book_id?: string;
          categories?: string[];
          cover_image_large_link?: string;
          cover_image_small_link?: string;
          description?: string;
          is_approved?: boolean;
          release_date?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_author_books";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "indie_authors";
            referencedColumns: ["author_id"];
          },
          {
            foreignKeyName: "indie_authors_books_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "indie_authors";
            referencedColumns: ["author_id"];
          }
        ];
      };
      indie_authors_books_links: {
        Row: {
          book_id: string;
          label: string;
          link: string;
        };
        Insert: {
          book_id?: string;
          label: string;
          link: string;
        };
        Update: {
          book_id?: string;
          label?: string;
          link?: string;
        };
        Relationships: [
          {
            foreignKeyName: "indie_authors_books_links_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: true;
            referencedRelation: "indie_authors_books";
            referencedColumns: ["book_id"];
          }
        ];
      };
      indie_authors_social: {
        Row: {
          author_id: string | null;
          link: string | null;
          social_media_id: string;
          social_media_name: string | null;
        };
        Insert: {
          author_id?: string | null;
          link?: string | null;
          social_media_id: string;
          social_media_name?: string | null;
        };
        Update: {
          author_id?: string | null;
          link?: string | null;
          social_media_id?: string;
          social_media_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_author_social";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "indie_authors";
            referencedColumns: ["author_id"];
          },
          {
            foreignKeyName: "indie_authors_social_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "indie_authors";
            referencedColumns: ["author_id"];
          }
        ];
      };
      libraries: {
        Row: {
          city_ascii: string;
          county_name: string;
          created_at: string;
          display_name: string;
          id: string;
          lat: string | null;
          lon: string | null;
          state_id: string;
          state_name: string;
        };
        Insert: {
          city_ascii: string;
          county_name: string;
          created_at?: string;
          display_name: string;
          id?: string;
          lat?: string | null;
          lon?: string | null;
          state_id: string;
          state_name: string;
        };
        Update: {
          city_ascii?: string;
          county_name?: string;
          created_at?: string;
          display_name?: string;
          id?: string;
          lat?: string | null;
          lon?: string | null;
          state_id?: string;
          state_name?: string;
        };
        Relationships: [];
      };
      onboarding: {
        Row: {
          id: string;
          onboarded: boolean;
          onboarded_at: string;
          tour_name: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          onboarded?: boolean;
          onboarded_at?: string;
          tour_name: string;
          user_id: string;
        };
        Update: {
          id?: string;
          onboarded?: boolean;
          onboarded_at?: string;
          tour_name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      point_transactions: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: number;
          points: number | null;
          type: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: number;
          points?: number | null;
          type?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: number;
          points?: number | null;
          type?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "point_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          created_at: string | null;
          customer_id: string | null;
          email: string | null;
          has_access: boolean | null;
          id: string;
          inactivity_email_sent: boolean;
          last_sign_in_at: string | null;
          price_id: string | null;
          raw_app_meta_data: Json | null;
          raw_user_meta_data: Json | null;
          username: string | null;
        };
        Insert: {
          created_at?: string | null;
          customer_id?: string | null;
          email?: string | null;
          has_access?: boolean | null;
          id: string;
          inactivity_email_sent?: boolean;
          last_sign_in_at?: string | null;
          price_id?: string | null;
          raw_app_meta_data?: Json | null;
          raw_user_meta_data?: Json | null;
          username?: string | null;
        };
        Update: {
          created_at?: string | null;
          customer_id?: string | null;
          email?: string | null;
          has_access?: boolean | null;
          id?: string;
          inactivity_email_sent?: boolean;
          last_sign_in_at?: string | null;
          price_id?: string | null;
          raw_app_meta_data?: Json | null;
          raw_user_meta_data?: Json | null;
          username?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      questions_notes: {
        Row: {
          answer: string | null;
          book_id: string;
          created_at: string;
          id: string;
          question: string;
          user_id: string;
        };
        Insert: {
          answer?: string | null;
          book_id: string;
          created_at?: string;
          id?: string;
          question: string;
          user_id: string;
        };
        Update: {
          answer?: string | null;
          book_id?: string;
          created_at?: string;
          id?: string;
          question?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_notes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      quotes: {
        Row: {
          author: string;
          id: string;
          text: string;
        };
        Insert: {
          author: string;
          id?: string;
          text: string;
        };
        Update: {
          author?: string;
          id?: string;
          text?: string;
        };
        Relationships: [];
      };
      reading_list: {
        Row: {
          book_id: string;
          finished_at: string | null;
          format: string | null;
          id: string;
          pages_read: number;
          pointsAwardedFinished: boolean;
          pointsAwardedRating: boolean;
          pointsAwardedTextReview: boolean;
          rating: number | null;
          reading_at: string | null;
          review: string | null;
          reviewPublic: boolean;
          status: string | null;
          tags: string[] | null;
          toread_at: string | null;
          user_id: string | null;
        };
        Insert: {
          book_id: string;
          finished_at?: string | null;
          format?: string | null;
          id?: string;
          pages_read?: number;
          pointsAwardedFinished?: boolean;
          pointsAwardedRating?: boolean;
          pointsAwardedTextReview?: boolean;
          rating?: number | null;
          reading_at?: string | null;
          review?: string | null;
          reviewPublic?: boolean;
          status?: string | null;
          tags?: string[] | null;
          toread_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          book_id?: string;
          finished_at?: string | null;
          format?: string | null;
          id?: string;
          pages_read?: number;
          pointsAwardedFinished?: boolean;
          pointsAwardedRating?: boolean;
          pointsAwardedTextReview?: boolean;
          rating?: number | null;
          reading_at?: string | null;
          review?: string | null;
          reviewPublic?: boolean;
          status?: string | null;
          tags?: string[] | null;
          toread_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reading_list_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      reading_sessions: {
        Row: {
          end_page: number;
          ended_at: string | null;
          id: string;
          reading_list_id: string | null;
          start_page: number;
          started_at: string | null;
        };
        Insert: {
          end_page: number;
          ended_at?: string | null;
          id?: string;
          reading_list_id?: string | null;
          start_page: number;
          started_at?: string | null;
        };
        Update: {
          end_page?: number;
          ended_at?: string | null;
          id?: string;
          reading_list_id?: string | null;
          start_page?: number;
          started_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reading_sessions_reading_list_id_fkey";
            columns: ["reading_list_id"];
            isOneToOne: false;
            referencedRelation: "reading_list";
            referencedColumns: ["id"];
          }
        ];
      };
      reading_stats: {
        Row: {
          books_read: number | null;
          pages_read: number | null;
          reading_time_minutes: number | null;
          user_id: string;
        };
        Insert: {
          books_read?: number | null;
          pages_read?: number | null;
          reading_time_minutes?: number | null;
          user_id: string;
        };
        Update: {
          books_read?: number | null;
          pages_read?: number | null;
          reading_time_minutes?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reading_stats_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      referrals: {
        Row: {
          referred_id: string;
          referrer_id: string;
        };
        Insert: {
          referred_id?: string;
          referrer_id: string;
        };
        Update: {
          referred_id?: string;
          referrer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey";
            columns: ["referrer_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      reviews: {
        Row: {
          book_id: string;
          created_at: string | null;
          id: number;
          notes: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          book_id: string;
          created_at?: string | null;
          id?: number;
          notes?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          book_id?: string;
          created_at?: string | null;
          id?: number;
          notes?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "book_notes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      roadmap: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          is_approved: boolean;
          status: string;
          tags: string[];
          title: string;
          votes: number;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          is_approved?: boolean;
          status?: string;
          tags?: string[];
          title: string;
          votes?: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          is_approved?: boolean;
          status?: string;
          tags?: string[];
          title?: string;
          votes?: number;
        };
        Relationships: [];
      };
      roadmap_votes: {
        Row: {
          increment: boolean | null;
          roadmap_id: string;
          user_id: string;
        };
        Insert: {
          increment?: boolean | null;
          roadmap_id: string;
          user_id: string;
        };
        Update: {
          increment?: boolean | null;
          roadmap_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roadmap_votes_roadmap_id_fkey";
            columns: ["roadmap_id"];
            isOneToOne: true;
            referencedRelation: "roadmap";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roadmap_votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      session_notes: {
        Row: {
          book_id: string;
          content: string;
          created_at: string;
          end_page: number | null;
          id: string;
          is_public: boolean;
          label: string;
          reading_session_id: string | null;
          start_page: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          book_id: string;
          content: string;
          created_at?: string;
          end_page?: number | null;
          id?: string;
          is_public?: boolean;
          label: string;
          reading_session_id?: string | null;
          start_page?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          book_id?: string;
          content?: string;
          created_at?: string;
          end_page?: number | null;
          id?: string;
          is_public?: boolean;
          label?: string;
          reading_session_id?: string | null;
          start_page?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_notes_reading_session_id_fkey";
            columns: ["reading_session_id"];
            isOneToOne: false;
            referencedRelation: "reading_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_notes_user_id_fkey1";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_activity: {
        Row: {
          activity_type: string | null;
          created_at: string | null;
          details: Json | null;
          id: number;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          activity_type?: string | null;
          created_at?: string | null;
          details?: Json | null;
          id?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          activity_type?: string | null;
          created_at?: string | null;
          details?: Json | null;
          id?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_connection_activity: {
        Row: {
          active_at: string;
          id: string;
          user_id: string | null;
        };
        Insert: {
          active_at?: string;
          id?: string;
          user_id?: string | null;
        };
        Update: {
          active_at?: string;
          id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_connection_activity_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_point_streak: {
        Row: {
          day1: string | null;
          day2: string | null;
          day3: string | null;
          day4: string | null;
          day5: string | null;
          day6: string | null;
          day7: string | null;
          reward_awarded: boolean[] | null;
          user_id: string;
        };
        Insert: {
          day1?: string | null;
          day2?: string | null;
          day3?: string | null;
          day4?: string | null;
          day5?: string | null;
          day6?: string | null;
          day7?: string | null;
          reward_awarded?: boolean[] | null;
          user_id?: string;
        };
        Update: {
          day1?: string | null;
          day2?: string | null;
          day3?: string | null;
          day4?: string | null;
          day5?: string | null;
          day6?: string | null;
          day7?: string | null;
          reward_awarded?: boolean[] | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_point_streak_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_points: {
        Row: {
          points_earned: number | null;
          points_earned_referrals: number;
          points_redeemed: number | null;
          user_id: string;
        };
        Insert: {
          points_earned?: number | null;
          points_earned_referrals?: number;
          points_redeemed?: number | null;
          user_id: string;
        };
        Update: {
          points_earned?: number | null;
          points_earned_referrals?: number;
          points_redeemed?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_preferences: {
        Row: {
          bio: string | null;
          onboarded: boolean;
          preferred_book_language: string | null;
          preferred_categories: string[] | null;
          preferred_ui_language: string | null;
          profile_picture_url: string | null;
          user_id: string;
          username: string | null;
        };
        Insert: {
          bio?: string | null;
          onboarded?: boolean;
          preferred_book_language?: string | null;
          preferred_categories?: string[] | null;
          preferred_ui_language?: string | null;
          profile_picture_url?: string | null;
          user_id: string;
          username?: string | null;
        };
        Update: {
          bio?: string | null;
          onboarded?: boolean;
          preferred_book_language?: string | null;
          preferred_categories?: string[] | null;
          preferred_ui_language?: string | null;
          profile_picture_url?: string | null;
          user_id?: string;
          username?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      vocal_notes: {
        Row: {
          end_time: string;
          endpoint_url: string;
          id: string;
          start_time: string;
          text_content: string | null;
          user_id: string;
        };
        Insert: {
          end_time: string;
          endpoint_url: string;
          id?: string;
          start_time?: string;
          text_content?: string | null;
          user_id?: string;
        };
        Update: {
          end_time?: string;
          endpoint_url?: string;
          id?: string;
          start_time?: string;
          text_content?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vocal_notes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      append_habit_streak: {
        Args: {
          habit_id: string;
          day: string;
          progress_value: number;
        };
        Returns: undefined;
      };
      check_book_exists: {
        Args: {
          p_isbn_13: string;
        };
        Returns: Json;
      };
      check_inactive_users: {
        Args: {
          days: number;
        };
        Returns: {
          aud: string | null;
          banned_until: string | null;
          confirmation_sent_at: string | null;
          confirmation_token: string | null;
          confirmed_at: string | null;
          created_at: string | null;
          deleted_at: string | null;
          email: string | null;
          email_change: string | null;
          email_change_confirm_status: number | null;
          email_change_sent_at: string | null;
          email_change_token_current: string | null;
          email_change_token_new: string | null;
          email_confirmed_at: string | null;
          encrypted_password: string;
          id: string;
          instance_id: string | null;
          invited_at: string | null;
          is_anonymous: boolean;
          is_sso_user: boolean;
          is_super_admin: boolean | null;
          last_sign_in_at: string | null;
          phone: string | null;
          phone_change: string | null;
          phone_change_sent_at: string | null;
          phone_change_token: string | null;
          phone_confirmed_at: string | null;
          raw_app_meta_data: Json | null;
          raw_user_meta_data: Json | null;
          reauthentication_sent_at: string | null;
          reauthentication_token: string | null;
          recovery_sent_at: string | null;
          recovery_token: string | null;
          role: string | null;
          updated_at: string | null;
        }[];
      };
      get_basic_article_info: {
        Args: {
          p_slug: string;
        };
        Returns: {
          id: number;
          slug: string;
          title: string;
          description: string;
          isbn13: string;
          image_url: string;
          image_alt: string;
          published_at: string;
        }[];
      };
      get_cumulative_books_per_users_by_day: {
        Args: Record<PropertyKey, never>;
        Returns: {
          date: string;
          cumulative_users: number;
        }[];
      };
      get_full_article_content: {
        Args: {
          p_slug: string;
        };
        Returns: {
          id: number;
          content: string;
        }[];
      };
      get_user_metadata: {
        Args: {
          user_id: string;
        };
        Returns: Json;
      };
      increment: {
        Args: {
          inc: number;
          userid: string;
        };
        Returns: undefined;
      };
      increment_points_earned: {
        Args: {
          _user_id: string;
          _points_to_add: number;
        };
        Returns: undefined;
      };
      increment_votes: {
        Args: {
          row_id: string;
          increment: boolean;
        };
        Returns: boolean;
      };
      return_books_with_no_article: {
        Args: Record<PropertyKey, never>;
        Returns: {
          isbn_13: string;
          data: Json;
        }[];
      };
      update_habit_progress: {
        Args: {
          _metric: string;
          _user_id: string;
          _progress_value: number;
        };
        Returns: undefined;
      };
      update_reading_stats: {
        Args: {
          p_user_id: string;
          p_books_read: number;
          p_pages_read: number;
          p_reading_time_minutes: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
