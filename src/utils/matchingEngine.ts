import { CampusItem, ItemMatchResult, MatchAnalysis } from '../types';

// Calculate string similarity using token overlap and character bigrams
function stringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9\s]/g, '');

  if (s1 === s2) return 1.0;

  const tokens1 = new Set(s1.split(/\s+/).filter((t) => t.length > 2));
  const tokens2 = new Set(s2.split(/\s+/).filter((t) => t.length > 2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let commonTokens = 0;
  for (const token of tokens1) {
    if (tokens2.has(token)) commonTokens++;
  }

  const tokenJaccard = commonTokens / (tokens1.size + tokens2.size - commonTokens);

  // Substring check for high relevance
  const containsSub = s1.includes(s2) || s2.includes(s1) ? 0.3 : 0;

  return Math.min(1.0, tokenJaccard * 0.8 + containsSub);
}

// Calculate location proximity score between two campus locations
function calculateLocationScore(loc1: CampusItem['location'], loc2: CampusItem['location']): number {
  if (loc1.id === loc2.id) return 1.0; // Same building/spot!
  if (loc1.zone === loc2.zone) return 0.85; // Same campus zone

  // Euclidean distance between map coordinates
  const dx = (loc1.mapCoords.x - loc2.mapCoords.x) / 100;
  const dy = (loc1.mapCoords.y - loc2.mapCoords.y) / 100;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Normalize distance: dist 0 -> 1.0, dist 1.0 -> 0.2
  return Math.max(0.1, 1 - dist * 0.9);
}

// Calculate time proximity score
function calculateTimeScore(dateStr1: string, dateStr2: string): number {
  try {
    const t1 = new Date(dateStr1).getTime();
    const t2 = new Date(dateStr2).getTime();
    const hoursDiff = Math.abs(t1 - t2) / (1000 * 60 * 60);

    if (hoursDiff <= 4) return 1.0;
    if (hoursDiff <= 24) return 0.9;
    if (hoursDiff <= 48) return 0.75;
    if (hoursDiff <= 120) return 0.55;
    return Math.max(0.2, 1 - hoursDiff / 500);
  } catch {
    return 0.5;
  }
}

// Heuristic matching algorithm
export function calculateLocalMatch(target: CampusItem, candidate: CampusItem): MatchAnalysis {
  // Opposites match: lost <-> found
  const categoryMatch = target.category === candidate.category;
  const brandMatch =
    Boolean(target.brand && candidate.brand) &&
    target.brand?.toLowerCase() === candidate.brand?.toLowerCase();

  // Color overlap
  const targetColors = (target.colors || []).map((c) => c.toLowerCase());
  const candidateColors = (candidate.colors || []).map((c) => c.toLowerCase());
  const colorMatches = targetColors.filter((c) => candidateColors.includes(c));
  const colorMatchScore =
    targetColors.length > 0 && candidateColors.length > 0
      ? colorMatches.length / Math.max(targetColors.length, candidateColors.length)
      : 0.4;

  // Title and Description semantic similarities
  const titleSim = stringSimilarity(target.title, candidate.title);
  const descSim = stringSimilarity(
    `${target.title} ${target.description} ${(target.tags || []).join(' ')}`,
    `${candidate.title} ${candidate.description} ${(candidate.tags || []).join(' ')}`
  );

  // Distinctive marks overlap
  const marks1 = (target.distinctiveMarks || []).join(' ').toLowerCase();
  const marks2 = (candidate.distinctiveMarks || []).join(' ').toLowerCase();
  const marksSim = stringSimilarity(marks1, marks2);

  // Location & Time scores
  const locationScore = calculateLocationScore(target.location, candidate.location);
  const timeScore = calculateTimeScore(target.dateOccurred, candidate.dateOccurred);

  // Visual/Textual overall similarity
  let visualTextScore = titleSim * 0.45 + descSim * 0.35 + (brandMatch ? 0.2 : 0) + colorMatchScore * 0.1;
  if (marksSim > 0.3) visualTextScore += 0.15;
  visualTextScore = Math.min(1.0, visualTextScore);

  // Weighted Total Score
  // Category match is critical (30% weight penalty if different category)
  const categoryWeight = categoryMatch ? 1.0 : 0.25;

  let compositeScore =
    (visualTextScore * 0.45 + locationScore * 0.3 + timeScore * 0.15 + (brandMatch ? 0.1 : 0)) *
    categoryWeight *
    100;

  compositeScore = Math.round(Math.min(99, Math.max(8, compositeScore)));

  // Generate explainable reasons
  const reasons: string[] = [];
  const matchedKeywords: string[] = [];

  if (categoryMatch) {
    reasons.push(`Matching category (${target.category.replace('_', ' ')})`);
  }
  if (brandMatch) {
    reasons.push(`Identical brand: ${target.brand}`);
    matchedKeywords.push(target.brand!);
  }
  if (colorMatches.length > 0) {
    reasons.push(`Shared color palette (${colorMatches.join(', ')})`);
  }
  if (target.location.id === candidate.location.id) {
    reasons.push(`Reported at the exact same building: ${target.location.name}`);
  } else if (target.location.zone === candidate.location.zone) {
    reasons.push(`Found in nearby zone: ${target.location.zone}`);
  }

  if (timeScore >= 0.85) {
    reasons.push('Incident timelines correlate closely (within 24 hours)');
  }
  if (marksSim > 0.25) {
    reasons.push('Distinctive visual markings / accessories noted by both parties');
  }

  let confidenceLevel: 'High' | 'Medium' | 'Low' = 'Low';
  if (compositeScore >= 75) {
    confidenceLevel = 'High';
  } else if (compositeScore >= 45) {
    confidenceLevel = 'Medium';
  }

  const overallAssessment =
    compositeScore >= 80
      ? `Strong candidate match with consistent attributes, location proximity, and timeframe.`
      : compositeScore >= 50
      ? `Moderate similarity in category and campus zone. Worth verifying with claimant.`
      : `Partial correlation based on basic keywords.`;

  return {
    matchScore: compositeScore,
    confidenceLevel,
    overallAssessment,
    reasons: reasons.length > 0 ? reasons : ['General category match on campus.'],
    visualSimilarityScore: Math.round(visualTextScore * 100),
    locationScore: Math.round(locationScore * 100),
    timeScore: Math.round(timeScore * 100),
    attributeMatches: {
      category: categoryMatch,
      brand: brandMatch,
      color: colorMatches.length > 0,
      keywords: matchedKeywords,
    },
    suggestedVerificationPrompt:
      candidate.verificationQuestion?.question ||
      target.verificationQuestion?.question ||
      `Can the owner identify specific scratches, stickers, or wallpaper details?`,
  };
}

// Find all matches for a given item against a collection of items
export async function findMatchesForItem(
  targetItem: CampusItem,
  allItems: CampusItem[],
  useAI: boolean = true
): Promise<ItemMatchResult[]> {
  // Opposites: if target is 'lost', candidate must be 'found', and vice-versa
  const candidates = allItems.filter(
    (item) => item.id !== targetItem.id && item.type !== targetItem.type && item.status !== 'reunited'
  );

  if (candidates.length === 0) {
    return [];
  }

  // First compute local heuristics
  const localResults: ItemMatchResult[] = candidates.map((candidate) => ({
    candidateItem: candidate,
    analysis: calculateLocalMatch(targetItem, candidate),
  }));

  // If AI matching is enabled and available, query the Gemini backend
  if (useAI) {
    try {
      // Filter candidates with at least minimal similarity to optimize Gemini payload
      const promisingCandidates = candidates.filter((c) => {
        const local = calculateLocalMatch(targetItem, c);
        return local.matchScore >= 20 || local.attributeMatches.category;
      });

      if (promisingCandidates.length > 0) {
        const res = await fetch('/api/match-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetItem,
            candidates: promisingCandidates.slice(0, 6),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.matches && Array.isArray(data.matches) && data.matches.length > 0) {
            // Merge AI enhancements into local results
            const aiMap = new Map<string, any>(data.matches.map((m: any) => [m.candidateId, m]));

            return localResults
              .map((r) => {
                const aiMatch = aiMap.get(r.candidateItem.id);
                if (aiMatch) {
                  return {
                    candidateItem: r.candidateItem,
                    analysis: {
                      ...r.analysis,
                      matchScore: Math.round((aiMatch.matchScore * 0.7 + r.analysis.matchScore * 0.3)),
                      confidenceLevel: aiMatch.confidenceLevel || r.analysis.confidenceLevel,
                      overallAssessment: aiMatch.overallAssessment || r.analysis.overallAssessment,
                      reasons: aiMatch.reasons && aiMatch.reasons.length > 0 ? aiMatch.reasons : r.analysis.reasons,
                      suggestedVerificationPrompt:
                        aiMatch.suggestedVerificationPrompt || r.analysis.suggestedVerificationPrompt,
                    },
                  };
                }
                return r;
              })
              .sort((a, b) => b.analysis.matchScore - a.analysis.matchScore);
          }
        }
      }
    } catch (err) {
      console.warn('AI matching API unavailable, using local intelligence engine:', err);
    }
  }

  // Return sorted results by match score
  return localResults.sort((a, b) => b.analysis.matchScore - a.analysis.matchScore);
}
