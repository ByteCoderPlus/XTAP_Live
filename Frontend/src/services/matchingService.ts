import { Resource, Requirement, MatchRecommendation } from '../types';

// Create a simple matching algorithm based on skills, location, and availability
export function calculateMatchScore(resource: Resource, requirement: Requirement): number {
  let score = 0;
  let factors = 0;

  // Skill matching (40% weight)
  if (Array.isArray(resource.skills) && Array.isArray(requirement.requiredSkills)) {
    const resourceSkillNames = resource.skills.map(s => s.name.toLowerCase());
    const requiredSkillNames = requirement.requiredSkills.map(s => s.name.toLowerCase());
    const matchedSkills = requiredSkillNames.filter(skill => 
      resourceSkillNames.some(rs => rs.includes(skill) || skill.includes(rs))
    );
    const skillMatchRatio = requiredSkillNames.length > 0 
      ? matchedSkills.length / requiredSkillNames.length 
      : 0;
    score += skillMatchRatio * 40;
    factors += 40;
  }

  // Location matching (20% weight)
  if (resource.location && requirement.location) {
    if (resource.location.toLowerCase() === requirement.location.toLowerCase()) {
      score += 20;
    } else if (resource.location.toLowerCase().includes(requirement.location.toLowerCase()) ||
               requirement.location.toLowerCase().includes(resource.location.toLowerCase())) {
      score += 10;
    }
    factors += 20;
  }

  // Availability (20% weight)
  if (resource.availabilityDate) {
    const availabilityDate = new Date(resource.availabilityDate);
    const requirementDate = new Date(requirement.startDate);
    if (availabilityDate <= requirementDate) {
      score += 20;
    } else {
      const daysDiff = Math.ceil((availabilityDate.getTime() - requirementDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 30) {
        score += 15;
      } else if (daysDiff <= 60) {
        score += 10;
      } else {
        score += 5;
      }
    }
    factors += 20;
  } else {
    // Immediate availability
    score += 20;
    factors += 20;
  }

  // Status (20% weight) - ATP resources get full points
  if (resource.status === 'ATP') {
    score += 20;
  } else if (resource.status === 'deployed') {
    score += 5;
  }
  factors += 20;

  // Normalize score
  return factors > 0 ? Math.round((score / factors) * 100) : 0;
}

export function findMatches(resources: Resource[], requirements: Requirement[]): MatchRecommendation[] {
  const matches: MatchRecommendation[] = [];

  resources.forEach(resource => {
    // Only match ATP resources or those with considerations
    if (resource.status !== 'ATP' && (!Array.isArray(resource.considerations) || resource.considerations.length === 0)) {
      return;
    }

    requirements.forEach(requirement => {
      const matchScore = calculateMatchScore(resource, requirement);
      
      // Only include matches with score >= 50
      if (matchScore >= 50) {
        const resourceSkillNames = Array.isArray(resource.skills) 
          ? resource.skills.map(s => s.name.toLowerCase())
          : [];
        const requiredSkillNames = Array.isArray(requirement.requiredSkills)
          ? requirement.requiredSkills.map(s => s.name.toLowerCase())
          : [];
        const preferredSkillNames = Array.isArray(requirement.preferredSkills)
          ? requirement.preferredSkills.map(s => s.name.toLowerCase())
          : [];

        const skillMatches = requiredSkillNames.filter(skill =>
          resourceSkillNames.some(rs => rs.includes(skill) || skill.includes(rs))
        );
        const skillGaps = requiredSkillNames.filter(skill =>
          !resourceSkillNames.some(rs => rs.includes(skill) || skill.includes(rs))
        );

        const reasons: string[] = [];
        if (skillMatches.length > 0) {
          reasons.push(`Strong match on ${skillMatches.length} required skill(s): ${skillMatches.slice(0, 3).join(', ')}`);
        }
        if (resource.location === requirement.location) {
          reasons.push('Location match');
        }
        if (resource.status === 'ATP') {
          reasons.push('Resource is available (ATP)');
        }
        if (resource.availabilityDate) {
          const availDate = new Date(resource.availabilityDate);
          const reqDate = new Date(requirement.startDate);
          if (availDate <= reqDate) {
            reasons.push('Available before requirement start date');
          }
        } else {
          reasons.push('Immediate availability');
        }
        if (Array.isArray(resource.projectExperience) && resource.projectExperience.length > 0) {
          reasons.push(`${resource.projectExperience.length} project(s) of relevant experience`);
        }

        matches.push({
          resource,
          requirement,
          matchScore,
          skillGaps,
          skillMatches,
          recommendedUpskilling: skillGaps.length > 0 
            ? skillGaps.map(gap => `Training on ${gap}`)
            : [],
          grossMargin: resource.billingHistory?.rate 
            ? Math.round((resource.billingHistory.rate * 0.4) / resource.billingHistory.rate * 100)
            : undefined,
          reasons: reasons.length > 0 ? reasons : ['Potential match based on profile'],
        });
      }
    });
  });

  // Sort by match score descending
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
