// ================================================================
// types/app.ts — Core Domain Types
// ================================================================

export type UserRole = 'user' | 'admin' | 'super_admin'

export type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'cancelled'
  | 'trialing'
  | 'past_due'

export type SubscriptionPlan = 'monthly' | 'yearly'

export type DrawMode = 'random' | 'algorithmic'

export type DrawStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export type DrawTier = 'jackpot' | 'silver' | 'bronze'

export type ProofStatus = 'pending' | 'approved' | 'rejected'

// ───────────────────────────────────────────────────────────────
// Domain Models
// ───────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  name: string
  avatarUrl: string | null
  role: UserRole
  subscriptionStatus: SubscriptionStatus
  subscriptionPlan: SubscriptionPlan | null
  subscriptionExpiresAt: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  orgId: string | null
  countryCode: string
  currency: string
  createdAt: string
  updatedAt: string
}

export interface Score {
  id: string
  userId: string
  score: number      // 1–45
  date: string       // "YYYY-MM-DD"
  notes: string | null
  createdAt: string
}

export interface Charity {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  websiteUrl: string | null
  registeredNumber: string | null
  isActive: boolean
  totalContributed: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Draw {
  id: string
  month: number
  year: number
  mode: DrawMode
  winningNumbers: number[]
  totalPool: number
  jackpotAmount: number
  prize4match: number
  prize3match: number
  jackpotRolledOver: boolean
  rolloverFromDrawId: string | null
  rolloverAmount: number
  charityId: string | null
  charityContribution: number
  charityPercentage: number
  participantCount: number
  status: DrawStatus
  runBy: string | null
  runAt: string | null
  createdAt: string
  // Joined relations
  charity?: Pick<Charity, 'id' | 'name' | 'logoUrl'>
  winners?: DrawWinner[]
}

export interface DrawWinner {
  id: string
  drawId: string
  userId: string
  tier: DrawTier
  matchCount: 3 | 4 | 5
  matchedNumbers: number[]
  userScores: number[]
  amount: number
  paidOut: boolean
  createdAt: string
  // Joined
  user?: Pick<Profile, 'id' | 'name' | 'avatarUrl'>
  proof?: WinnerProof
}

export interface WinnerProof {
  id: string
  drawWinnerId: string
  userId: string
  drawId: string
  proofUrl: string
  storagePath: string
  fileName: string | null
  fileSize: number | null
  mimeType: string | null
  status: ProofStatus
  adminNote: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  countryCode: string
  billingEmail: string | null
  plan: 'team' | 'corporate' | 'enterprise'
  seatLimit: number | null
  subscriptionStatus: SubscriptionStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  actorId: string | null
  action: string
  entityType: string
  entityId: string | null
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  payload: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

// ───────────────────────────────────────────────────────────────
// Derived / UI Types
// ───────────────────────────────────────────────────────────────

/** Minimal profile for public display (e.g. on draw winners list) */
export type PublicProfile = Pick<Profile, 'id' | 'name' | 'avatarUrl'>

/** Score with computed trend direction vs previous */
export interface ScoreWithTrend extends Score {
  trend: 'up' | 'down' | 'same' | null
}

/** Draw with the authenticated user's personal result */
export interface DrawWithMyResult extends Draw {
  myResult?: {
    tier: DrawTier | null
    matchCount: number
    matchedNumbers: number[]
    amount: number
    proofStatus: ProofStatus | null
  }
}
