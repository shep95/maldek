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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ad_analytics: {
        Row: {
          ad_id: string | null
          clicks: number | null
          completion_rate: number | null
          created_at: string | null
          date: string | null
          id: string
          views: number | null
        }
        Insert: {
          ad_id?: string | null
          clicks?: number | null
          completion_rate?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          views?: number | null
        }
        Update: {
          ad_id?: string | null
          clicks?: number | null
          completion_rate?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_analytics_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisements: {
        Row: {
          budget: number
          campaign_duration_days: number
          campaign_start_time: string
          click_count: number
          cost_per_click: number
          created_at: string
          daily_budget: number
          daily_spend: number
          description: string | null
          duration: number
          id: string
          status: string
          target_url: string
          thumbnail_url: string | null
          title: string
          user_id: string
          video_url: string
        }
        Insert: {
          budget: number
          campaign_duration_days?: number
          campaign_start_time?: string
          click_count?: number
          cost_per_click?: number
          created_at?: string
          daily_budget?: number
          daily_spend?: number
          description?: string | null
          duration: number
          id?: string
          status?: string
          target_url?: string
          thumbnail_url?: string | null
          title: string
          user_id: string
          video_url: string
        }
        Update: {
          budget?: number
          campaign_duration_days?: number
          campaign_start_time?: string
          click_count?: number
          cost_per_click?: number
          created_at?: string
          daily_budget?: number
          daily_spend?: number
          description?: string | null
          duration?: number
          id?: string
          status?: string
          target_url?: string
          thumbnail_url?: string | null
          title?: string
          user_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_insights: {
        Row: {
          created_at: string | null
          id: string
          insight_data: Json
          insight_type: string
          period_end: string
          period_start: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          insight_data: Json
          insight_type: string
          period_end: string
          period_start: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          insight_data?: Json
          insight_type?: string
          period_end?: string
          period_start?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_analytics: {
        Row: {
          active_users_count: number | null
          created_at: string | null
          date: string
          hourly_data: Json | null
          id: string
          new_signups_count: number | null
          peak_hour: number | null
        }
        Insert: {
          active_users_count?: number | null
          created_at?: string | null
          date?: string
          hourly_data?: Json | null
          id?: string
          new_signups_count?: number | null
          peak_hour?: number | null
        }
        Update: {
          active_users_count?: number | null
          created_at?: string | null
          date?: string
          hourly_data?: Json | null
          id?: string
          new_signups_count?: number | null
          peak_hour?: number | null
        }
        Relationships: []
      }
      app_versions: {
        Row: {
          build_number: number
          created_at: string
          file_path: string
          id: string
          is_latest: boolean | null
          platform: string
          release_notes: string | null
          version: string
        }
        Insert: {
          build_number: number
          created_at?: string
          file_path: string
          id?: string
          is_latest?: boolean | null
          platform: string
          release_notes?: string | null
          version: string
        }
        Update: {
          build_number?: number
          created_at?: string
          file_path?: string
          id?: string
          is_latest?: boolean | null
          platform?: string
          release_notes?: string | null
          version?: string
        }
        Relationships: []
      }
      bookmark_collection_items: {
        Row: {
          added_at: string | null
          bookmark_id: string
          collection_id: string
        }
        Insert: {
          added_at?: string | null
          bookmark_id: string
          collection_id: string
        }
        Update: {
          added_at?: string | null
          bookmark_id?: string
          collection_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmark_collection_items_bookmark_id_fkey"
            columns: ["bookmark_id"]
            isOneToOne: false
            referencedRelation: "bookmarks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmark_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "bookmark_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmark_collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_private: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmark_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          gif_url: string | null
          id: string
          parent_id: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          gif_url?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          gif_url?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_moderation: {
        Row: {
          created_at: string | null
          id: string
          is_safe: boolean
          media_url: string
          moderation_result: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_safe?: boolean
          media_url: string
          moderation_result: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_safe?: boolean
          media_url?: string
          moderation_result?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          is_request: boolean | null
          participant_ids: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          is_request?: boolean | null
          participant_ids: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          is_request?: boolean | null
          participant_ids?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      emperor_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emperor_chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hashtags: {
        Row: {
          created_at: string
          id: string
          name: string
          post_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          post_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          post_count?: number | null
        }
        Relationships: []
      }
      list_members: {
        Row: {
          added_at: string
          list_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          list_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          list_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_members_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          created_at: string
          creator_id: string | null
          description: string | null
          id: string
          is_private: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lists_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentions: {
        Row: {
          created_at: string | null
          id: string
          mentioned_user_id: string | null
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mentioned_user_id?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mentioned_user_id?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentions_mentioned_user_id_fkey"
            columns: ["mentioned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mercury_payment_data: {
        Row: {
          created_at: string | null
          id: string
          mercury_account_id: string | null
          mercury_customer_id: string | null
          mercury_payment_method_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mercury_account_id?: string | null
          mercury_customer_id?: string | null
          mercury_payment_method_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mercury_account_id?: string | null
          mercury_customer_id?: string | null
          mercury_payment_method_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mercury_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          mercury_transaction_id: string | null
          metadata: Json | null
          payment_type: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          mercury_transaction_id?: string | null
          metadata?: Json | null
          payment_type: string
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          mercury_transaction_id?: string | null
          metadata?: Json | null
          payment_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      message_group_members: {
        Row: {
          group_id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "message_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_groups: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          is_encrypted: boolean | null
          is_read: boolean | null
          media_url: string | null
          recipient_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_encrypted?: boolean | null
          is_read?: boolean | null
          media_url?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_encrypted?: boolean | null
          is_read?: boolean | null
          media_url?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          enabled: boolean | null
          id: string
          muted_until: string | null
          notification_type: string
          push_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          enabled?: boolean | null
          id?: string
          muted_until?: string | null
          notification_type: string
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          enabled?: boolean | null
          id?: string
          muted_until?: string | null
          notification_type?: string
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string
          archived: boolean | null
          category: string | null
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          post_id: string
          priority: string | null
          read: boolean | null
          recipient_id: string
          type: string
        }
        Insert: {
          actor_id: string
          archived?: boolean | null
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          post_id: string
          priority?: string | null
          read?: boolean | null
          recipient_id: string
          type: string
        }
        Update: {
          actor_id?: string
          archived?: boolean | null
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          post_id?: string
          priority?: string | null
          read?: boolean | null
          recipient_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          currency: string
          id: string
          metadata: Json | null
          payment_date: string | null
          payment_method_type: string | null
          status: string
          stripe_payment_id: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          currency?: string
          id?: string
          metadata?: Json | null
          payment_date?: string | null
          payment_method_type?: string | null
          status: string
          stripe_payment_id?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          currency?: string
          id?: string
          metadata?: Json | null
          payment_date?: string | null
          payment_method_type?: string | null
          status?: string
          stripe_payment_id?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          poll_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          poll_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          poll_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          options: Json
          post_id: string | null
          question: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          options: Json
          post_id?: string | null
          question: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          options?: Json
          post_id?: string | null
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_analytics: {
        Row: {
          comment_count: number | null
          content_type: string | null
          created_at: string | null
          date: string
          engagement_rate: number | null
          id: string
          like_count: number | null
          peak_hour: number | null
          post_id: string | null
          user_id: string | null
          view_count: number | null
          watch_time_seconds: number | null
        }
        Insert: {
          comment_count?: number | null
          content_type?: string | null
          created_at?: string | null
          date?: string
          engagement_rate?: number | null
          id?: string
          like_count?: number | null
          peak_hour?: number | null
          post_id?: string | null
          user_id?: string | null
          view_count?: number | null
          watch_time_seconds?: number | null
        }
        Update: {
          comment_count?: number | null
          content_type?: string | null
          created_at?: string | null
          date?: string
          engagement_rate?: number | null
          id?: string
          like_count?: number | null
          peak_hour?: number | null
          post_id?: string | null
          user_id?: string | null
          view_count?: number | null
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_drafts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          media_urls: string[] | null
          scheduled_for: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          media_urls?: string[] | null
          scheduled_for?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          media_urls?: string[] | null
          scheduled_for?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_hashtags: {
        Row: {
          created_at: string
          hashtag_id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          hashtag_id: string
          post_id: string
        }
        Update: {
          created_at?: string
          hashtag_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          community_id: string | null
          content: string
          created_at: string
          deleted_at: string | null
          edit_count: number | null
          engagement_score: number | null
          id: string
          is_community_post: boolean | null
          is_deleted: boolean | null
          is_edited: boolean | null
          is_pinned: boolean | null
          last_score_update: string | null
          likes: number | null
          media_urls: string[] | null
          original_content: string | null
          pinned_at: string | null
          quoted_post_id: string | null
          reposts: number | null
          scheduled_for: string | null
          thread_parent_id: string | null
          thread_position: number | null
          trending_score: number | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          community_id?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          edit_count?: number | null
          engagement_score?: number | null
          id?: string
          is_community_post?: boolean | null
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_pinned?: boolean | null
          last_score_update?: string | null
          likes?: number | null
          media_urls?: string[] | null
          original_content?: string | null
          pinned_at?: string | null
          quoted_post_id?: string | null
          reposts?: number | null
          scheduled_for?: string | null
          thread_parent_id?: string | null
          thread_position?: number | null
          trending_score?: number | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          community_id?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          edit_count?: number | null
          engagement_score?: number | null
          id?: string
          is_community_post?: boolean | null
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_pinned?: boolean | null
          last_score_update?: string | null
          likes?: number | null
          media_urls?: string[] | null
          original_content?: string | null
          pinned_at?: string | null
          quoted_post_id?: string | null
          reposts?: number | null
          scheduled_for?: string | null
          thread_parent_id?: string | null
          thread_position?: number | null
          trending_score?: number | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_quoted_post_id_fkey"
            columns: ["quoted_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_thread_parent_id_fkey"
            columns: ["thread_parent_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      private_data: {
        Row: {
          created_at: string | null
          encrypted_data: string
          id: string
          last_modified: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encrypted_data: string
          id?: string
          last_modified?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          encrypted_data?: string
          id?: string
          last_modified?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      private_posts: {
        Row: {
          content: string
          created_at: string | null
          encrypted_content: string | null
          encrypted_title: string | null
          id: string
          media_urls: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          encrypted_content?: string | null
          encrypted_title?: string | null
          id?: string
          media_urls?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          encrypted_content?: string | null
          encrypted_title?: string | null
          id?: string
          media_urls?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements: Json | null
          avatar_nft_data: Json | null
          avatar_url: string | null
          badges: Json | null
          banner_url: string | null
          bio: string | null
          created_at: string
          follower_count: number
          id: string
          is_avatar_animated: boolean | null
          is_suspended: boolean | null
          last_active: string | null
          last_post_time: string | null
          location: string | null
          security_code: string | null
          social_links: Json | null
          suspension_end: string | null
          suspension_reason: string | null
          theme_preference: string | null
          total_likes_received: number | null
          total_media: number | null
          total_posts: number | null
          total_views: number | null
          username: string
          website: string | null
        }
        Insert: {
          achievements?: Json | null
          avatar_nft_data?: Json | null
          avatar_url?: string | null
          badges?: Json | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          follower_count?: number
          id: string
          is_avatar_animated?: boolean | null
          is_suspended?: boolean | null
          last_active?: string | null
          last_post_time?: string | null
          location?: string | null
          security_code?: string | null
          social_links?: Json | null
          suspension_end?: string | null
          suspension_reason?: string | null
          theme_preference?: string | null
          total_likes_received?: number | null
          total_media?: number | null
          total_posts?: number | null
          total_views?: number | null
          username: string
          website?: string | null
        }
        Update: {
          achievements?: Json | null
          avatar_nft_data?: Json | null
          avatar_url?: string | null
          badges?: Json | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          follower_count?: number
          id?: string
          is_avatar_animated?: boolean | null
          is_suspended?: boolean | null
          last_active?: string | null
          last_post_time?: string | null
          location?: string | null
          security_code?: string | null
          social_links?: Json | null
          suspension_end?: string | null
          suspension_reason?: string | null
          theme_preference?: string | null
          total_likes_received?: number | null
          total_media?: number | null
          total_posts?: number | null
          total_views?: number | null
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_percentage: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_percentage: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_percentage?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
        }
        Relationships: []
      }
      push_notification_settings: {
        Row: {
          created_at: string
          daily_reminders: boolean | null
          featured_user_posts: boolean | null
          follow_notifications: boolean | null
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          daily_reminders?: boolean | null
          featured_user_posts?: boolean | null
          follow_notifications?: boolean | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          daily_reminders?: boolean | null
          featured_user_posts?: boolean | null
          follow_notifications?: boolean | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      space_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          space_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          space_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          space_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "space_chat_messages_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      space_participants: {
        Row: {
          joined_at: string | null
          role: Database["public"]["Enums"]["space_role"]
          space_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string | null
          role?: Database["public"]["Enums"]["space_role"]
          space_id: string
          user_id: string
        }
        Update: {
          joined_at?: string | null
          role?: Database["public"]["Enums"]["space_role"]
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_participants_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      space_reactions: {
        Row: {
          created_at: string | null
          id: string
          reaction_type: string
          space_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction_type: string
          space_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction_type?: string
          space_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "space_reactions_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      space_recording_purchases: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          space_id: string
          status: string | null
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          space_id: string
          status?: string | null
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          space_id?: string
          status?: string | null
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_recording_purchases_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_recording_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      space_speaker_requests: {
        Row: {
          id: string
          requested_at: string | null
          resolved_at: string | null
          resolved_by: string | null
          space_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          requested_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          space_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          requested_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          space_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "space_speaker_requests_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_speaker_requests_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_speaker_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spaces: {
        Row: {
          category: string | null
          chat_enabled: boolean | null
          created_at: string | null
          description: string | null
          ended_at: string | null
          features: Json | null
          host_id: string
          id: string
          max_speakers: number | null
          participants_count: number | null
          reactions_enabled: boolean | null
          recording_price: number | null
          recording_url: string | null
          scheduled_start: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["space_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          chat_enabled?: boolean | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          features?: Json | null
          host_id: string
          id?: string
          max_speakers?: number | null
          participants_count?: number | null
          reactions_enabled?: boolean | null
          recording_price?: number | null
          recording_url?: string | null
          scheduled_start?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["space_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          chat_enabled?: boolean | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          features?: Json | null
          host_id?: string
          id?: string
          max_speakers?: number | null
          participants_count?: number | null
          reactions_enabled?: boolean | null
          recording_price?: number | null
          recording_url?: string | null
          scheduled_start?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["space_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spaces_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          created_at: string
          duration: number | null
          expires_at: string
          id: string
          is_expired: boolean | null
          media_type: string
          media_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          expires_at?: string
          id?: string
          is_expired?: boolean | null
          media_type: string
          media_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          expires_at?: string
          id?: string
          is_expired?: boolean | null
          media_type?: string
          media_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string | null
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string | null
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string | null
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          checkmark_color: string
          created_at: string
          features: Json | null
          id: string
          is_lifetime: boolean | null
          max_pinned_posts: number | null
          max_upload_size_mb: number
          monthly_mentions: number
          name: string
          one_time_price: number | null
          post_character_limit: number | null
          price: number
          schedule_days_limit: number | null
          stripe_price_id: string | null
          supports_animated_avatars: boolean | null
          supports_gif_uploads: boolean | null
          supports_nft_avatars: boolean | null
          watermark_disabled: boolean | null
        }
        Insert: {
          checkmark_color: string
          created_at?: string
          features?: Json | null
          id?: string
          is_lifetime?: boolean | null
          max_pinned_posts?: number | null
          max_upload_size_mb?: number
          monthly_mentions: number
          name: string
          one_time_price?: number | null
          post_character_limit?: number | null
          price: number
          schedule_days_limit?: number | null
          stripe_price_id?: string | null
          supports_animated_avatars?: boolean | null
          supports_gif_uploads?: boolean | null
          supports_nft_avatars?: boolean | null
          watermark_disabled?: boolean | null
        }
        Update: {
          checkmark_color?: string
          created_at?: string
          features?: Json | null
          id?: string
          is_lifetime?: boolean | null
          max_pinned_posts?: number | null
          max_upload_size_mb?: number
          monthly_mentions?: number
          name?: string
          one_time_price?: number | null
          post_character_limit?: number | null
          price?: number
          schedule_days_limit?: number | null
          stripe_price_id?: string | null
          supports_animated_avatars?: boolean | null
          supports_gif_uploads?: boolean | null
          supports_nft_avatars?: boolean | null
          watermark_disabled?: boolean | null
        }
        Relationships: []
      }
      user_background_music: {
        Row: {
          created_at: string
          duration: number
          id: string
          music_url: string
          playlist_order: number | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration: number
          id?: string
          music_url: string
          playlist_order?: number | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number
          id?: string
          music_url?: string
          playlist_order?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_background_music_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_user_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          blocked_user_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          blocked_user_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_fk"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          continent: string | null
          created_at: string
          preferred_language: string
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          continent?: string | null
          created_at?: string
          preferred_language?: string
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          continent?: string | null
          created_at?: string
          preferred_language?: string
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          is_lifetime: boolean | null
          mentions_remaining: number
          mentions_used: number
          starts_at: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          is_lifetime?: boolean | null
          mentions_remaining?: number
          mentions_used?: number
          starts_at?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          is_lifetime?: boolean | null
          mentions_remaining?: number
          mentions_used?: number
          starts_at?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string
          description: string
          duration: number
          engagement_score: number | null
          id: string
          last_score_update: string | null
          thumbnail_url: string
          title: string
          trending_score: number | null
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description: string
          duration: number
          engagement_score?: number | null
          id?: string
          last_score_update?: string | null
          thumbnail_url: string
          title: string
          trending_score?: number | null
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string
          duration?: number
          engagement_score?: number | null
          id?: string
          last_score_update?: string | null
          thumbnail_url?: string
          title?: string
          trending_score?: number | null
          user_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_post_engagement_score: {
        Args: {
          views: number
          likes: number
          comments: number
          reposts: number
          age_hours: number
        }
        Returns: number
      }
      calculate_video_engagement_score: {
        Args: { views: number; watch_time_seconds: number; age_hours: number }
        Returns: number
      }
      check_username_availability: {
        Args: { username_to_check: string }
        Returns: boolean
      }
      delete_inactive_accounts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_account_with_code: {
        Args: { code: string }
        Returns: undefined
      }
      delete_user_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_data_with_code: {
        Args: { code: string }
        Returns: undefined
      }
      get_private_data_with_code: {
        Args: { code: string }
        Returns: {
          id: string
          user_id: string
          content: string
          media_urls: string[]
          created_at: string
          encrypted_title: string
        }[]
      }
      grant_manual_subscription: {
        Args: {
          target_user_id: string
          tier_name: string
          duration_months?: number
        }
        Returns: undefined
      }
      increment_ad_click: {
        Args: { ad_id: string }
        Returns: undefined
      }
      increment_ad_view: {
        Args: { ad_id: string }
        Returns: undefined
      }
      increment_post_view: {
        Args: { post_id: string }
        Returns: undefined
      }
      mark_expired_stories: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      mute_all_speakers: {
        Args: { space_id: string; admin_user_id: string }
        Returns: boolean
      }
      mute_participant: {
        Args: {
          space_id: string
          target_user_id: string
          admin_user_id: string
        }
        Returns: boolean
      }
      track_video_watch_time: {
        Args: { post_id: string; watch_seconds: number }
        Returns: undefined
      }
      update_app_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_security_code: {
        Args: { old_code: string; new_code: string }
        Returns: boolean
      }
      update_trending_scores: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      verify_security_code: {
        Args: { user_uuid: string; code: string }
        Returns: boolean
      }
    }
    Enums: {
      community_visibility: "public" | "private"
      continent_type:
        | "north_america"
        | "south_america"
        | "europe"
        | "asia"
        | "africa"
        | "oceania"
        | "global"
      notification_type: "like" | "comment" | "follow" | "mention" | "repost"
      profile_type: "primary" | "secondary"
      space_role: "host" | "co_host" | "speaker" | "listener"
      space_status: "scheduled" | "live" | "ended"
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
      community_visibility: ["public", "private"],
      continent_type: [
        "north_america",
        "south_america",
        "europe",
        "asia",
        "africa",
        "oceania",
        "global",
      ],
      notification_type: ["like", "comment", "follow", "mention", "repost"],
      profile_type: ["primary", "secondary"],
      space_role: ["host", "co_host", "speaker", "listener"],
      space_status: ["scheduled", "live", "ended"],
    },
  },
} as const
