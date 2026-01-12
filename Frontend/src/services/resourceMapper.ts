import { Resource, ResourceStatus } from '../types';
import { ApiResource } from './api';

/**
 * Maps API resource data to application Resource type
 * Handles different possible API response structures
 */
// Helper to normalize status values
function normalizeStatus(status: any): ResourceStatus {
  if (!status) return 'ATP';
  const statusStr = String(status).toUpperCase();
  const statusMap: Record<string, ResourceStatus> = {
    'ATP': 'ATP',
    'DEPLOYED': 'deployed',
    'SOFT_BLOCKED': 'soft-blocked',
    'NOTICE': 'notice',
    'LEAVE': 'leave',
    'TRAINEE': 'trainee',
    'INTERVIEW_SCHEDULED': 'interview-scheduled',
  };
  return statusMap[statusStr] || 'ATP';
}

// Helper to normalize skill levels and types
function normalizeSkills(skills: any[]): any[] {
  if (!Array.isArray(skills)) return [];
  return skills.map(skill => ({
    ...skill,
    level: skill.level ? String(skill.level).toLowerCase() : 'intermediate',
    type: skill.type ? String(skill.type).toLowerCase() : 'primary',
  }));
}

export function mapApiResourceToResource(r: ApiResource | any): Resource {
  // Handle different possible API response structures
  const name = r.name || r.fullName || r.resourceName || r.employeeName || '';
  const employeeId = r.employeeId || r.id || r.empId || r.employeeCode || '';
  const id = r.id || r.employeeId || employeeId || '';
  
  // Normalize soft blocks from API format
  const rawSoftBlocks = Array.isArray(r.softBlocks) 
    ? r.softBlocks 
    : (Array.isArray(r.blocks) ? r.blocks : (Array.isArray(r.blockedDates) ? r.blockedDates : []));
  
  const normalizedSoftBlocks = rawSoftBlocks.map((block: any) => {
    // If API format (has blockedUntil), convert to expected format
    if (block.blockedUntil) {
      return {
        id: block.id || `${employeeId}-${block.accountId || 'block'}-${block.blockedUntil}`,
        resourceId: block.resourceId || employeeId,
        reason: block.accountName || block.reason || 'Soft Block',
        startDate: block.startDate || new Date().toISOString().split('T')[0], // Use current date as start if not provided
        endDate: block.blockedUntil,
        createdBy: block.createdBy || 'System',
        createdAt: block.createdAt || new Date().toISOString(),
        accountId: block.accountId,
        accountName: block.accountName,
        blockedUntil: block.blockedUntil,
      };
    }
    // If already in expected format, return as-is
    return block;
  });
  
  return {
    id: id || '',
    employeeId: employeeId || id || '',
    name: name || '',
    email: r.email || r.emailAddress || r.emailId || '',
    designation: r.designation || r.role || r.title || r.position || '',
    location: r.location || r.city || r.baseLocation || r.officeLocation || '',
    status: normalizeStatus(r.status),
    availabilityDate: r.availabilityDate || r.availableFrom || r.availability || r.availableDate,
    releaseDate: r.releaseDate || r.releasedDate || r.releaseFrom,
    totalExperience: r.totalExperience || r.experience || r.yearsOfExperience || undefined,
    skills: normalizeSkills(Array.isArray(r.skills) 
      ? r.skills 
      : (Array.isArray(r.skillSet) ? r.skillSet : (Array.isArray(r.technicalSkills) ? r.technicalSkills : []))),
    certifications: Array.isArray(r.certifications) 
      ? r.certifications 
      : (Array.isArray(r.certificate) ? r.certificate : (Array.isArray(r.certs) ? r.certs : [])),
    projectExperience: Array.isArray(r.projectExperience) 
      ? r.projectExperience 
      : (Array.isArray(r.projects) ? r.projects : (Array.isArray(r.experience) ? r.experience : [])),
    billingHistory: r.billingHistory || { billable: false },
    ctc: r.ctc || r.salary || r.compensation,
    ctcCurrency: r.ctcCurrency || r.currency || 'INR',
    softBlocks: normalizedSoftBlocks,
    considerations: Array.isArray(r.considerations) 
      ? r.considerations 
      : (Array.isArray(r.consideration) ? r.consideration : (Array.isArray(r.matches) ? r.matches : [])),
    createdAt: r.createdAt || r.createdDate || r.created || new Date().toISOString(),
    updatedAt: r.updatedAt || r.updatedDate || r.updated || new Date().toISOString(),
  };
}

/**
 * Maps array of API resources to application Resource array
 */
export function mapApiResourcesToResources(resourcesData: ApiResource[] | any[]): Resource[] {
  if (!Array.isArray(resourcesData)) {
    console.warn('mapApiResourcesToResources: resourcesData is not an array', resourcesData);
    return [];
  }
  
  try {
    return resourcesData.map((r, index) => {
      try {
        return mapApiResourceToResource(r);
      } catch (err) {
        console.error(`Error mapping resource at index ${index}:`, err, r);
        // Return a minimal valid resource object
        return {
          id: r?.id || r?.employeeId || `unknown-${index}`,
          employeeId: r?.employeeId || r?.id || `unknown-${index}`,
          name: r?.name || r?.fullName || r?.resourceName || '',
          email: r?.email || '',
          designation: r?.designation || '',
          location: r?.location || '',
          status: (r?.status as any) || 'ATP',
          availabilityDate: r?.availabilityDate,
          releaseDate: r?.releaseDate,
          skills: [],
          certifications: [],
          projectExperience: [],
          billingHistory: { billable: false },
          ctc: r?.ctc,
          ctcCurrency: r?.ctcCurrency || 'INR',
          softBlocks: [],
          considerations: [],
          createdAt: r?.createdAt || new Date().toISOString(),
          updatedAt: r?.updatedAt || new Date().toISOString(),
        };
      }
    });
  } catch (err) {
    console.error('Error in mapApiResourcesToResources:', err);
    return [];
  }
}
