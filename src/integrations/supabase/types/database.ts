import { DbFunctions } from './functions';

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
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
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
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          removed_by_recipient: boolean | null
          sender_id: string
          status: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          removed_by_recipient?: boolean | null
          sender_id: string
          status?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          removed_by_recipient?: boolean | null
          sender_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          post_id: string
          read: boolean | null
          recipient_id: string
          type: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          post_id: string
          read?: boolean | null
          recipient_id: string
          type: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          post_id?: string
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
      post_analytics: {
        Row: {
          comment_count: number | null
          created_at: string | null
          date: string
          id: string
          like_count: number | null
          post_id: string | null
          user_id: string | null
          view_count: number | null
          watch_time_seconds: number | null
        }
        Insert: {
          comment_count?: number | null
          created_at?: string | null
          date?: string
          id?: string
          like_count?: number | null
          post_id?: string | null
          user_id?: string | null
          view_count?: number | null
          watch_time_seconds?: number | null
        }
        Update: {
          comment_count?: number | null
          created_at?: string | null
          date?: string
          id?: string
          like_count?: number | null
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
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          likes: number | null
          media_urls: string[] | null
          pinned_at: string | null
          reposts: number | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes?: number | null
          media_urls?: string[] | null
          pinned_at?: string | null
          reposts?: number | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes?: number | null
          media_urls?: string[] | null
          pinned_at?: string | null
          reposts?: number | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string
          follower_count: number
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          follower_count?: number
          id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          follower_count?: number
          id?: string
          username?: string
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          checkmark_color: string
          created_at: string
          id: string
          monthly_mentions: number
          name: string
          price: number
        }
        Insert: {
          checkmark_color: string
          created_at?: string
          id?: string
          monthly_mentions: number
          name: string
          price: number
        }
        Update: {
          checkmark_color?: string
          created_at?: string
          id?: string
          monthly_mentions?: number
          name?: string
          price?: number
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          preferred_language: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          preferred_language?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          preferred_language?: string
          updated_at?: string
          user_id: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          ends_at: string
          id: string
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
          id: string
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
          id: string
          thumbnail_url: string
          title: string
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string
          duration: number
          id?: string
          thumbnail_url: string
          title: string
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string
          duration?: number
          id?: string
          thumbnail_url?: string
          title?: string
          user_id: string
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

      user_background_music: {
        Row: {
          id: string
          user_id: string
          music_url: string
          title: string
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          music_url: string
          title: string
          duration: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          music_url?: string
          title?: string
          duration?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_background_music_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      
      app_versions: {
        Row: {
          id: string
          version: string
          platform: string
          download_url: string | null
          release_notes: string | null
          release_date: string
          is_latest: boolean
          created_at: string
        }
        Insert: {
          id?: string
          version: string
          platform: string
          download_url?: string | null
          release_notes?: string | null
          release_date?: string
          is_latest?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          version?: string
          platform?: string
          download_url?: string | null
          release_notes?: string | null
          release_date?: string
          is_latest?: boolean
          created_at?: string
        }
        Relationships: []
      }
      private_data: {
        Row: {
          id: string
          user_id: string
          created_at: string
          encrypted_data: string
          last_modified: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          encrypted_data: string
          last_modified?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          encrypted_data?: string
          last_modified?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          name: string
          user_id: string
          participant_id: string | null
          last_message: string | null
          last_message_at: string | null
          unread_count: number
          encrypted_metadata: string | null
          is_group: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          participant_id?: string | null
          last_message?: string | null
          last_message_at?: string | null
          unread_count?: number
          encrypted_metadata?: string | null
          is_group?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          participant_id?: string | null
          last_message?: string | null
          last_message_at?: string | null
          unread_count?: number
          encrypted_metadata?: string | null
          is_group?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      },
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          file_url: string | null
          file_type: string | null
          file_name: string | null
          encrypted_metadata: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          file_url?: string | null
          file_type?: string | null
          file_name?: string | null
          encrypted_metadata?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          file_url?: string | null
          file_type?: string | null
          file_name?: string | null
          encrypted_metadata?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: DbFunctions
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
