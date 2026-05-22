export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "tenant" | "landlord" | "admin";
export type NidStatus = "pending" | "approved" | "rejected";
export type MovingRequestStatus = "pending" | "confirmed" | "completed";
export type ListingStatus = "draft" | "pending" | "approved" | "rejected" | "archived";
export type RentalType = "family_flat" | "bachelor" | "sublet" | "shop" | "office";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string;
          name: string | null;
          role: UserRole;
          nid_status: NidStatus;
          welcome_seen_at: string | null;
          suspended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone: string;
          name?: string | null;
          role?: UserRole;
          nid_status?: NidStatus;
          welcome_seen_at?: string | null;
          suspended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          name?: string | null;
          role?: UserRole;
          nid_status?: NidStatus;
          welcome_seen_at?: string | null;
          suspended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      nid_documents: {
        Row: {
          id: string;
          user_id: string;
          front_path: string;
          back_path: string;
          selfie_path: string;
          status: NidStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          front_path: string;
          back_path: string;
          selfie_path: string;
          status?: NidStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          front_path?: string;
          back_path?: string;
          selfie_path?: string;
          status?: NidStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "nid_documents_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      listings: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          rental_type: RentalType;
          rent: number;
          beds: number | null;
          baths: number | null;
          area_sqft: number | null;
          area_name: string;
          division: string | null;
          district: string | null;
          lat: number | null;
          lng: number | null;
          status: ListingStatus;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title?: string;
          description?: string | null;
          rental_type?: RentalType;
          rent?: number;
          beds?: number | null;
          baths?: number | null;
          area_sqft?: number | null;
          area_name?: string;
          division?: string | null;
          district?: string | null;
          lat?: number | null;
          lng?: number | null;
          status?: ListingStatus;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          rental_type?: RentalType;
          rent?: number;
          beds?: number | null;
          baths?: number | null;
          area_sqft?: number | null;
          area_name?: string;
          division?: string | null;
          district?: string | null;
          lat?: number | null;
          lng?: number | null;
          status?: ListingStatus;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      listing_images: {
        Row: {
          id: string;
          listing_id: string;
          path: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          path: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          path?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
      moving_requests: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          phone: string;
          from_area: string;
          to_area: string;
          flat_details: string | null;
          requested_date: string | null;
          status: MovingRequestStatus;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          phone: string;
          from_area: string;
          to_area: string;
          flat_details?: string | null;
          requested_date?: string | null;
          status?: MovingRequestStatus;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          phone?: string;
          from_area?: string;
          to_area?: string;
          flat_details?: string | null;
          requested_date?: string | null;
          status?: MovingRequestStatus;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "moving_requests_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      user_role: UserRole;
      nid_status: NidStatus;
      moving_request_status: MovingRequestStatus;
      listing_status: ListingStatus;
      rental_type: RentalType;
    };
    CompositeTypes: Record<never, never>;
  };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type NidDocumentRow = Database["public"]["Tables"]["nid_documents"]["Row"];
export type MovingRequestRow = Database["public"]["Tables"]["moving_requests"]["Row"];
export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
export type ListingImageRow = Database["public"]["Tables"]["listing_images"]["Row"];
