// ================================================================
// types/api.ts — API Request/Response Types
// ================================================================

import type {
  Profile, Score, Draw, DrawWinner, Charity, WinnerProof,
  DrawMode, SubscriptionPlan, UserRole, SubscriptionStatus,
  ProofStatus, AuditLog,
} from './app'

// ───────────────────────────────────────────────────────────────
// Shared response wrapper
// ───────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiFailure {
  data: null
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// ───────────────────────────────────────────────────────────────
// Scores
// ───────────────────────────────────────────────────────────────

export interface AddScoreRequest {
  score: number         // 1–45
  date: string          // "YYYY-MM-DD"
  notes?: string
}

export type ScoresListResponse = ApiSuccess<Score[]>
export type AddScoreResponse = ApiSuccess<Score>

// ───────────────────────────────────────────────────────────────
// Draws
// ───────────────────────────────────────────────────────────────

export interface RunDrawRequest {
  month: number
  year: number
  mode: DrawMode
  totalPool: number
  charityId?: string
  charityPercentage?: number
}

export interface RunDrawResponse {
  drawId: string
  winningNumbers: number[]
  jackpotRolledOver: boolean
  jackpotAmount: number
  participantCount: number
  winners: Array<{
    userId: string
    tier: string
    amount: number
    matchCount: number
  }>
  charityContribution: number
}

export type DrawListResponse = PaginatedResponse<Draw>
export type DrawDetailResponse = ApiSuccess<Draw>

// ───────────────────────────────────────────────────────────────
// Charities
// ───────────────────────────────────────────────────────────────

export interface CreateCharityRequest {
  name: string
  description?: string
  logoUrl?: string
  websiteUrl?: string
  registeredNumber?: string
}

export interface UpdateCharityRequest extends Partial<CreateCharityRequest> {
  isActive?: boolean
}

export type CharityListResponse = ApiSuccess<Charity[]>
export type CharityDetailResponse = ApiSuccess<Charity>

// ───────────────────────────────────────────────────────────────
// Winner Proofs
// ───────────────────────────────────────────────────────────────

export interface UploadProofRequest {
  drawWinnerId: string
  drawId: string
  // File is sent as multipart/form-data — not typed here
}

export interface ReviewProofRequest {
  status: 'approved' | 'rejected'
  adminNote?: string
}

export type ProofListResponse = PaginatedResponse<WinnerProof>
export type ProofDetailResponse = ApiSuccess<WinnerProof>

// ───────────────────────────────────────────────────────────────
// Subscriptions
// ───────────────────────────────────────────────────────────────

export interface CreateCheckoutRequest {
  plan: SubscriptionPlan
}

export interface CreateCheckoutResponse {
  url: string
}

export interface SubscriptionStatusResponse {
  status: SubscriptionStatus
  plan: SubscriptionPlan | null
  expiresAt: string | null
  stripeSubscriptionId: string | null
}

// ───────────────────────────────────────────────────────────────
// Admin
// ───────────────────────────────────────────────────────────────

export interface UpdateUserRequest {
  role?: UserRole
  subscriptionStatus?: SubscriptionStatus
}

export interface AdminStatsResponse {
  totalActiveMembers: number
  pendingProofs: number
  totalCharityContributed: number
  currentJackpot: number
}

export type UserListResponse = PaginatedResponse<Profile>
export type AuditLogResponse = PaginatedResponse<AuditLog>
