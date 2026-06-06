// ─────────────────────────────────────────────
//  Global Type Definitions
//  Add shared interfaces and types here.
// ─────────────────────────────────────────────

export type ID = string | number;

export interface BaseEntity {
  id: ID;
  createdAt?: string;
  updatedAt?: string;
}

// Add more shared types below as the project grows.
