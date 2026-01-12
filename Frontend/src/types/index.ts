export type ResourceStatus = 
  | 'ATP' 
  | 'deployed' 
  | 'soft-blocked' 
  | 'notice' 
  | 'leave' 
  | 'trainee' 
  | 'interview-scheduled';

export type InterviewStatus = 
  | 'pending' 
  | 'scheduled' 
  | 'selected' 
  | 'rejected' 
  | 'pending-feedback';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  name: string;
  level: SkillLevel;
  type: 'primary' | 'secondary';
  yearsOfExperience?: number;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface ProjectExperience {
  projectName: string;
  domain: string;
  role: string;
  startDate: string;
  endDate?: string;
  technologies: string[];
}

export interface BillingHistory {
  billable: boolean;
  rate?: number;
  currency?: string;
  lastBilledDate?: string;
  totalBilledHours?: number;
}

export interface SoftBlock {
  id?: string;
  resourceId?: string;
  reason?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  createdAt?: string;
  // API response structure
  accountId?: number;
  accountName?: string;
  blockedUntil?: string;
}

export interface Consideration {
  id: string;
  resourceId: string;
  requirementId: string;
  interviewStatus: InterviewStatus;
  interviewDate?: string;
  feedback?: string;
  matchScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  location: string;
  status: ResourceStatus;
  availabilityDate?: string;
  releaseDate?: string;
  totalExperience?: number;
  skills: Skill[];
  certifications: Certification[];
  projectExperience: ProjectExperience[];
  billingHistory: BillingHistory;
  ctc?: number;
  ctcCurrency?: string;
  softBlocks: SoftBlock[];
  considerations: Consideration[];
  createdAt: string;
  updatedAt: string;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  requiredSkills: Skill[];
  preferredSkills: Skill[];
  experienceLevel: string;
  location: string;
  domain: string;
  startDate: string;
  endDate?: string;
  status: 'open' | 'filled' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget?: number;
}

export interface MatchRecommendation {
  resource: Resource;
  requirement: Requirement;
  matchScore: number;
  skillGaps: string[];
  skillMatches: string[];
  recommendedUpskilling: string[];
  grossMargin?: number;
  reasons: string[];
}

export interface SkillGapAnalysis {
  resourceId: string;
  requirementId: string;
  missingSkills: string[];
  suggestedTrainings: string[];
  estimatedTrainingDuration: string;
}

export interface UtilizationMetrics {
  totalResources: number;
  atpResources: number;
  deployedResources: number;
  utilizationRate: number;
  averageBenchDuration: number;
  skillDemandHeatmap: Record<string, number>;
}

export interface WeeklyATPSummary {
  week: string;
  totalATP: number;
  newATP: number;
  deployed: number;
  softBlocked: number;
  bySkill: Record<string, number>;
  byLocation: Record<string, number>;
  topRecommendations: MatchRecommendation[];
}

export type UserRole = 'delivery-manager' | 'atp-spoc' | 'sales-manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
