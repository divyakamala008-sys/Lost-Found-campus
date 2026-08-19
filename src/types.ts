export type ItemType = 'lost' | 'found';

export type ItemCategory =
  | 'electronics'
  | 'wallets_ids'
  | 'keys'
  | 'bags_backpacks'
  | 'water_bottles'
  | 'apparel_accessories'
  | 'books_supplies'
  | 'jewelry_watches'
  | 'sports_gear'
  | 'other';

export type ItemStatus = 'active' | 'pending_claim' | 'reunited';

export interface CampusLocation {
  id: string;
  name: string;
  building: string;
  zone: 'North Campus' | 'Central Quad' | 'South Campus' | 'East Academic' | 'West Sports Complex';
  mapCoords: { x: number; y: number }; // Percentage on map (0-100)
  hasOfficialDropoffDesk?: boolean;
  deskName?: string;
  deskHours?: string;
}

export interface VerificationQuestion {
  question: string;
  expectedAnswerHint?: string; //Finder/owner private hint
}

export interface CampusItem {
  id: string;
  type: ItemType; // 'lost' or 'found'
  title: string;
  category: ItemCategory;
  description: string;
  location: CampusLocation;
  specificLocationDetails?: string; // e.g. "2nd floor quiet study desk near window #4"
  dateReported: string; // ISO date
  dateOccurred: string; // Date lost or found
  imageUrl: string;
  colors: string[];
  brand?: string;
  tags: string[];
  distinctiveMarks?: string[]; // e.g. "scratch on top left corner", "NASA sticker"
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  rewardAmount?: number;
  status: ItemStatus;
  verificationQuestion?: VerificationQuestion;
  heldAtOfficialDesk?: boolean;
  officialDeskLocation?: string;
  claimedBy?: string;
  reunitedAt?: string;
  matchedItemId?: string;
}

export interface MatchAnalysis {
  matchScore: number; // 0 to 100
  confidenceLevel: 'High' | 'Medium' | 'Low';
  overallAssessment: string;
  reasons: string[];
  visualSimilarityScore: number;
  locationScore: number;
  timeScore: number;
  attributeMatches: {
    category: boolean;
    brand: boolean;
    color: boolean;
    keywords: string[];
  };
  suggestedVerificationPrompt?: string;
}

export interface ItemMatchResult {
  candidateItem: CampusItem;
  analysis: MatchAnalysis;
}

export interface AIAnalysisResult {
  title: string;
  category: ItemCategory;
  brand?: string;
  primaryColors: string[];
  distinctiveFeatures: string[];
  tags: string[];
  description: string;
  confidence: number;
}
