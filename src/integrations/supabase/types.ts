export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          achievements: Json | null
          avatar_url: string | null
          badges: Json | null
          banner_url: string | null
          bio: string | null
          created_at: string
          follower_count: number
          id: string
          last_active: string | null
          location: string | null
          social_links: Json | null
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
          avatar_url?: string | null
          badges?: Json | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          follower_count?: number
          id: string
          last_active?: string | null
          location?: string | null
          social_links?: Json | null
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
          avatar_url?: string | null
          badges?: Json | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          follower_count?: number
          id?: string
          last_active?: string | null
          location?: string | null
          social_links?: Json | null
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
          created_at: string | null
          description: string | null
          ended_at: string | null
          host_id: string
          id: string
          max_speakers: number | null
          scheduled_start: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["space_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id: string
          id?: string
          max_speakers?: number | null
          scheduled_start?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["space_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id?: string
          id?: string
          max_speakers?: number | null
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
          id?: string
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
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_username_availability: {
        Args: {
          username_to_check: string
        }
        Returns: boolean
      }
      delete_user_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      increment_ad_click: {
        Args: {
          ad_id: string
        }
        Returns: undefined
      }
      increment_ad_view: {
        Args: {
          ad_id: string
        }
        Returns: undefined
      }
      increment_post_view: {
        Args: {
          post_id: string
        }
        Returns: undefined
      }
      track_video_watch_time: {
        Args: {
          post_id: string
          watch_seconds: number
        }
        Returns: undefined
      }
    }
    Enums: {
      space_role: "host" | "co_host" | "speaker" | "listener"
      space_status: "scheduled" | "live" | "ended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
