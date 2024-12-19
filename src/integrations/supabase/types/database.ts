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
          }
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
          }
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
          quoted_post_id: string | null
          reposts: number | null
          scheduled_for: string | null
          thread_parent_id: string | null
          thread_position: number | null
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
          quoted_post_id?: string | null
          reposts?: number | null
          scheduled_for?: string | null
          thread_parent_id?: string | null
          thread_position?: number | null
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
          quoted_post_id?: string | null
          reposts?: number | null
          scheduled_for?: string | null
          thread_parent_id?: string | null
          thread_position?: number | null
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
          }
        ]
      }
      polls: {
        Row: {
          id: string
          post_id: string | null
          question: string
          options: Json
          ends_at: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id?: string | null
          question: string
          options: Json
          ends_at: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string | null
          question?: string
          options?: Json
          ends_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      poll_votes: {
        Row: {
          id: string
          poll_id: string | null
          user_id: string | null
          option_index: number
          created_at: string
        }
        Insert: {
          id?: string
          poll_id?: string | null
          user_id?: string | null
          option_index: number
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string | null
          user_id?: string | null
          option_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          }
        ]
      }
      hashtags: {
        Row: {
          id: string
          name: string
          post_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          post_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          post_count?: number | null
          created_at?: string
        }
        Relationships: []
      }
      post_hashtags: {
        Row: {
          post_id: string
          hashtag_id: string
          created_at: string
        }
        Insert: {
          post_id: string
          hashtag_id: string
          created_at?: string
        }
        Update: {
          post_id?: string
          hashtag_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          }
        ]
      }
      lists: {
        Row: {
          id: string
          creator_id: string | null
          name: string
          description: string | null
          is_private: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          creator_id?: string | null
          name: string
          description?: string | null
          is_private?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string | null
          name?: string
          description?: string | null
          is_private?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lists_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      list_members: {
        Row: {
          list_id: string
          user_id: string
          added_at: string
        }
        Insert: {
          list_id: string
          user_id: string
          added_at?: string
        }
        Update: {
          list_id?: string
          user_id?: string
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_members_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          }
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
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
          }
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
          description: string
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
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: DbFunctions
    Enums: {
      space_role: "host" | "co_host" | "speaker" | "listener"
      space_status: "scheduled" | "live" | "ended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}