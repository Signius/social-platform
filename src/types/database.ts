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
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          interests: string[] | null
          reputation_score: number
          subscription_tier: string
          subscription_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          interests?: string[] | null
          reputation_score?: number
          subscription_tier?: string
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          interests?: string[] | null
          reputation_score?: number
          subscription_tier?: string
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          cover_image_url: string | null
          location: string | null
          category: string | null
          privacy: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          cover_image_url?: string | null
          location?: string | null
          category?: string | null
          privacy?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          cover_image_url?: string | null
          location?: string | null
          category?: string | null
          privacy?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      events: {
        Row: {
          id: string
          group_id: string
          created_by: string | null
          title: string
          description: string | null
          location: string | null
          start_time: string
          end_time: string | null
          capacity: number | null
          difficulty_level: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          created_by?: string | null
          title: string
          description?: string | null
          location?: string | null
          start_time: string
          end_time?: string | null
          capacity?: number | null
          difficulty_level?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          created_by?: string | null
          title?: string
          description?: string | null
          location?: string | null
          start_time?: string
          end_time?: string | null
          capacity?: number | null
          difficulty_level?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      event_attendees: {
        Row: {
          id: string
          event_id: string
          user_id: string
          rsvp_status: string
          attended: boolean
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          rsvp_status?: string
          attended?: boolean
          rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          rsvp_status?: string
          attended?: boolean
          rating?: number | null
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          event_id: string
          user_id: string
          parent_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          parent_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          requester_id: string
          receiver_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          receiver_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          receiver_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          criteria: Json | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          criteria?: Json | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          criteria?: Json | null
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          payfast_subscription_id: string | null
          status: string | null
          plan: string | null
          amount: number | null
          billing_date: string | null
          next_billing_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          payfast_subscription_id?: string | null
          status?: string | null
          plan?: string | null
          amount?: number | null
          billing_date?: string | null
          next_billing_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          payfast_subscription_id?: string | null
          status?: string | null
          plan?: string | null
          amount?: number | null
          billing_date?: string | null
          next_billing_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string | null
          content: string | null
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title?: string | null
          content?: string | null
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string | null
          content?: string | null
          link?: string | null
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_stats: {
        Args: {
          p_user_id: string
        }
        Returns: {
          hosted_events: number
          attended_events: number
          groups_count: number
          connections_count: number
          avg_rating: number | null
        }[]
      }
      get_group_stats: {
        Args: {
          p_group_id: string
        }
        Returns: {
          members_count: number
          events_count: number
          upcoming_events: number
        }[]
      }
      increment_reputation: {
        Args: {
          p_user_id: string
          p_points: number
        }
        Returns: void
      }
      check_subscription_limit: {
        Args: {
          p_user_id: string
          p_limit_type: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

