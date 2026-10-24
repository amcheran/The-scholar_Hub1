import { Opportunity, UserProfile, MatchScoreDetails } from '../types';

export function hasUserPreferences(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (user.isConfigured === true) return true;
  // Must have a positive GPA and an actual selected field of study
  const hasGpa = typeof user.gpa === 'number' && user.gpa > 0;
  const hasMajor = Boolean(user.major && user.major.trim());
  return Boolean(hasGpa && hasMajor);
}

export function calculateMatchScore(user: UserProfile, opp: Opportunity): MatchScoreDetails {
  let totalScore = 0;
  const breakdown: MatchScoreDetails['breakdown'] = [];

  // 1. GPA Evaluation (Max 35 points)
  if (user && typeof user.gpa === 'number' && user.gpa > 0) {
    const gpaDiff = user.gpa - opp.gpaRequirement;
    if (gpaDiff >= 0) {
      totalScore += 35;
      breakdown.push({
        category: 'GPA Requirement',
        passed: true,
        points: 35,
        description: `Your GPA (${user.gpa.toFixed(2)}) meets or exceeds the minimum ${opp.gpaRequirement.toFixed(1)} req`,
      });
    } else if (gpaDiff >= -0.2) {
      totalScore += 26;
      breakdown.push({
        category: 'GPA Requirement',
        passed: true,
        points: 26,
        description: `Your GPA (${user.gpa.toFixed(2)}) is close to the recommended ${opp.gpaRequirement.toFixed(1)} req`,
      });
    } else if (gpaDiff >= -0.5) {
      totalScore += 16;
      breakdown.push({
        category: 'GPA Requirement',
        passed: false,
        points: 16,
        description: `GPA (${user.gpa.toFixed(2)}) is below the preferred ${opp.gpaRequirement.toFixed(1)} threshold`,
      });
    } else {
      totalScore += 8;
      breakdown.push({
        category: 'GPA Requirement',
        passed: false,
        points: 8,
        description: `Significant GPA differential with the ${opp.gpaRequirement.toFixed(1)} requirement`,
      });
    }
  } else {
    // When GPA is not yet customized in profile, score based on inclusivity of GPA requirement
    const accessibleScore = opp.gpaRequirement <= 2.5 ? 30 : opp.gpaRequirement <= 3.0 ? 25 : opp.gpaRequirement <= 3.5 ? 18 : 12;
    totalScore += accessibleScore;
    breakdown.push({
      category: 'GPA Requirement',
      passed: opp.gpaRequirement <= 3.0,
      points: accessibleScore,
      description: `Requires minimum ${opp.gpaRequirement.toFixed(1)} GPA (Set profile GPA to calibrate)`,
    });
  }

  // 2. Education Level Evaluation (Max 30 points)
  const userLevel = user?.educationLevel || 'Undergraduate';
  const isLevelMatch = opp.educationLevels.includes(userLevel);
  if (isLevelMatch) {
    totalScore += 30;
    breakdown.push({
      category: 'Education Level',
      passed: true,
      points: 30,
      description: `Enrolled as ${userLevel}, fully eligible for this program`,
    });
  } else {
    totalScore += 10;
    breakdown.push({
      category: 'Education Level',
      passed: false,
      points: 10,
      description: `Targets ${opp.educationLevels.join(' / ')}, differs from ${userLevel}`,
    });
  }

  // 3. Major / Field of Study Evaluation (Max 25 points)
  const oppMajorLower = (opp.majorTag || '').toLowerCase();
  const isAllMajors = oppMajorLower === 'all majors' || oppMajorLower === 'all fields';

  if (user && user.major && user.major.trim()) {
    const userMajorLower = user.major.toLowerCase();
    const isExactMajor = userMajorLower.includes(oppMajorLower) || oppMajorLower.includes(userMajorLower);
    const isStemMatch = (oppMajorLower === 'stem') && (
      userMajorLower.includes('computer') ||
      userMajorLower.includes('software') ||
      userMajorLower.includes('engineer') ||
      userMajorLower.includes('math') ||
      userMajorLower.includes('data') ||
      userMajorLower.includes('science') ||
      userMajorLower.includes('biology')
    );
    const isHealthcareMatch = (oppMajorLower === 'healthcare') && (
      userMajorLower.includes('nursing') ||
      userMajorLower.includes('health') ||
      userMajorLower.includes('med') ||
      userMajorLower.includes('bio')
    );

    if (isAllMajors || isExactMajor || isStemMatch || isHealthcareMatch) {
      totalScore += 25;
      breakdown.push({
        category: 'Field of Study',
        passed: true,
        points: 25,
        description: isAllMajors
          ? `Open to all majors including ${user.major}`
          : `Your major (${user.major}) matches category ${opp.majorTag}`,
      });
    } else {
      totalScore += 10;
      breakdown.push({
        category: 'Field of Study',
        passed: false,
        points: 10,
        description: `Program prioritized for ${opp.majorTag} candidates`,
      });
    }
  } else {
    // If major not yet specified, open opportunities rank higher
    const majorScore = isAllMajors ? 25 : 16;
    totalScore += majorScore;
    breakdown.push({
      category: 'Field of Study',
      passed: isAllMajors,
      points: majorScore,
      description: isAllMajors ? 'Open to all academic fields' : `Targeted for ${opp.majorTag} scholars`,
    });
  }

  // 4. Financial Need & Profile Factors (Max 10 points)
  if (!opp.needBased) {
    totalScore += 10;
    breakdown.push({
      category: 'Need Assessment',
      passed: true,
      points: 10,
      description: 'Merit-based or general eligibility; no strict income restrictions',
    });
  } else {
    const needLevel = user?.financialNeed || 'Moderate';
    if (needLevel === 'High') {
      totalScore += 10;
      breakdown.push({
        category: 'Need Assessment',
        passed: true,
        points: 10,
        description: 'Prioritizes high financial need scholars (matches your profile)',
      });
    } else if (needLevel === 'Moderate') {
      totalScore += 7;
      breakdown.push({
        category: 'Need Assessment',
        passed: true,
        points: 7,
        description: 'Moderate financial need partially matches eligibility criteria',
      });
    } else {
      totalScore += 4;
      breakdown.push({
        category: 'Need Assessment',
        passed: false,
        points: 4,
        description: 'Grant prioritizes documented financial need assistance',
      });
    }
  }

  // 5. Target Destination Country Alignment
  if (user.targetCountry && user.targetCountry !== 'All Countries / Worldwide') {
    const oppText = `${opp.title} ${opp.description} ${opp.eligibility.join(' ')}`.toLowerCase();
    const targetLower = user.targetCountry.toLowerCase();
    const isCountryMatch =
      oppText.includes(targetLower) ||
      oppText.includes('international') ||
      oppText.includes('global') ||
      oppText.includes('worldwide') ||
      oppText.includes('africa') ||
      oppText.includes('all countries');

    breakdown.push({
      category: 'Destination Country',
      passed: isCountryMatch,
      points: isCountryMatch ? 5 : 0,
      description: isCountryMatch
        ? `Aligns with your target destination (${user.targetCountry})`
        : `May require checking residency eligibility for ${user.targetCountry}`,
    });
  }

  // Clamp score
  const finalScore = Math.min(99, Math.max(50, totalScore));

  let grade: MatchScoreDetails['grade'] = 'Fair';
  if (finalScore >= 92) grade = 'A+';
  else if (finalScore >= 85) grade = 'A';
  else if (finalScore >= 78) grade = 'B+';
  else if (finalScore >= 70) grade = 'B';

  return {
    score: finalScore,
    grade,
    breakdown,
  };
}

export function formatDeadlineCountdown(deadlineDateStr: string): {
  daysLeft: number;
  label: string;
  isUrgent: boolean;
  formattedDate: string;
} {
  // Current time reference anchor
  const now = new Date('2026-10-12T12:00:00Z');
  const target = new Date(`${deadlineDateStr}T23:59:59Z`);

  const diffTime = target.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const formattedDate = target.toLocaleDateString('en-US', options);

  if (daysLeft < 0) {
    return { daysLeft, label: 'Deadline Passed', isUrgent: true, formattedDate };
  }
  if (daysLeft === 0) {
    return { daysLeft, label: 'Due Today', isUrgent: true, formattedDate };
  }
  if (daysLeft === 1) {
    return { daysLeft, label: 'Due Tomorrow', isUrgent: true, formattedDate };
  }
  if (daysLeft <= 14) {
    return { daysLeft, label: `${daysLeft} days left`, isUrgent: true, formattedDate };
  }
  return { daysLeft, label: `${daysLeft} days left`, isUrgent: false, formattedDate };
}
