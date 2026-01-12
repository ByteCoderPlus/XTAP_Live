import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Briefcase, Award, Calendar, DollarSign, Mail, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { Resource } from '../types';
import Breadcrumbs from '../components/Breadcrumbs';
import { resourceAPI } from '../services/api';
import { mapApiResourceToResource, mapApiResourcesToResources } from '../services/resourceMapper';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        
        let data: any = null;
        let convertedResource: Resource | null = null;
        
        // Try to fetch individual resource first
        try {
          data = await resourceAPI.getResourceById(id);
          if (data && (data.employeeId || data.id || data.email)) {
            convertedResource = mapApiResourceToResource(data);
          }
        } catch (err) {
          console.log('getResourceById failed, trying getAllResources fallback:', err);
        }
        
        // If individual fetch failed or returned no data, fetch all and find the resource
        if (!convertedResource || !convertedResource.email) {
          const resourcesResponse = await resourceAPI.getAllResources();
          
          // Handle paginated response: { data: [...], pagination: {...} }
          let resourcesData: any[] = [];
          if (Array.isArray(resourcesResponse)) {
            resourcesData = resourcesResponse;
          } else if (resourcesResponse && typeof resourcesResponse === 'object' && Array.isArray(resourcesResponse.data)) {
            resourcesData = resourcesResponse.data;
          }
          
          // Find the resource by employeeId or id
          const foundResource = resourcesData.find((r: any) => 
            (r.employeeId && r.employeeId === id) || 
            (r.id && r.id === id) ||
            (r.employeeId && String(r.employeeId).toUpperCase() === String(id).toUpperCase())
          );
          
          if (foundResource) {
            data = foundResource;
            convertedResource = mapApiResourceToResource(foundResource);
          }
        }
        
        if (!convertedResource) {
          throw new Error('Resource not found');
        }
        
        // Ensure we have the ID from the route if not in data
        if (!convertedResource.id && !convertedResource.employeeId) {
          convertedResource.id = id;
          convertedResource.employeeId = id;
        }
        
        // Ensure email and location are set from raw data
        if (!convertedResource.email && data?.email) {
          convertedResource.email = data.email;
        }
        if (!convertedResource.location && data?.location) {
          convertedResource.location = data.location;
        }
        if (!convertedResource.name && data?.name) {
          convertedResource.name = data.name;
        }
        if (!convertedResource.designation && data?.designation) {
          convertedResource.designation = data.designation;
        }
        
        // Ensure skills are properly set
        if (!convertedResource.skills || convertedResource.skills.length === 0) {
          if (data?.skills && Array.isArray(data.skills)) {
            convertedResource.skills = data.skills.map((s: any) => ({
              ...s,
              type: s.type ? String(s.type).toLowerCase() : 'primary',
              level: s.level ? String(s.level).toLowerCase() : 'intermediate',
            }));
          }
        }
        
        console.log('Resource data received (raw API):', data);
        console.log('Converted resource:', convertedResource);
        console.log('Email:', convertedResource.email);
        console.log('Location:', convertedResource.location);
        console.log('All skills:', convertedResource.skills);
        
        setResource(convertedResource);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load resource';
        setError(errorMessage);
        console.error('Error loading resource:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !resource) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Resource not found'}</p>
        <Link to="/bench" className="btn-primary">Back to Bench Directory</Link>
      </div>
    );
  }

  // Filter skills - handle both normalized (lowercase) and API (uppercase) formats
  // The resourceMapper normalizes types to lowercase, so we check for 'primary' and 'secondary'
  const primarySkills = Array.isArray(resource.skills) 
    ? resource.skills.filter(s => {
        if (!s || !s.name) return false;
        const skillType = String(s.type || '').toLowerCase().trim();
        return skillType === 'primary';
      })
    : [];
  const secondarySkills = Array.isArray(resource.skills)
    ? resource.skills.filter(s => {
        if (!s || !s.name) return false;
        const skillType = String(s.type || '').toLowerCase().trim();
        return skillType === 'secondary';
      })
    : [];
  
  // Debug logging
  console.log('ResourceDetail - Resource:', resource);
  console.log('ResourceDetail - Email:', resource.email);
  console.log('ResourceDetail - Location:', resource.location);
  console.log('ResourceDetail - All Skills:', resource.skills);
  console.log('ResourceDetail - Primary Skills Count:', primarySkills.length);
  console.log('ResourceDetail - Secondary Skills Count:', secondarySkills.length);
  const activeSoftBlocks = Array.isArray(resource.softBlocks)
    ? resource.softBlocks.filter(sb => sb && sb.endDate && new Date(sb.endDate) > new Date())
    : [];

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{resource.name}</h1>
            <p className="text-gray-600 mt-1">{resource.designation} • {resource.employeeId}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">Export Profile</button>
          <button className="btn-primary">Consider for Role</button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Status</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{resource.status}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Location</p>
          <p className="text-xl font-semibold text-gray-900 mt-1 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-gray-500" />
            {resource.location || 'N/A'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Availability</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">
            {resource.availabilityDate
              ? new Date(resource.availabilityDate).toLocaleDateString()
              : 'Immediate'}
          </p>
        </div>
        {resource.ctc && (
          <div className="card">
            <p className="text-sm text-gray-600">CTC</p>
            <p className="text-xl font-semibold text-gray-900 mt-1 flex items-center">
              <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
              ₹{(resource.ctc / 100000).toFixed(1)}L {resource.ctcCurrency && `(${resource.ctcCurrency})`}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <Mail className="w-5 h-5 mr-3 text-gray-400" />
                {resource.email ? (
                  <a href={`mailto:${resource.email}`} className="hover:text-primary-600 text-primary-600">
                    {resource.email}
                  </a>
                ) : (
                  <span className="text-gray-500">No email available</span>
                )}
              </div>
              {resource.ctc && (
                <div className="flex items-center text-gray-700">
                  <DollarSign className="w-5 h-5 mr-3 text-gray-400" />
                  <span>CTC: ₹{(resource.ctc / 100000).toFixed(1)}L ({resource.ctcCurrency || 'INR'})</span>
                </div>
              )}
            </div>
          </div>

          {/* Primary Skills */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Primary Skills</h2>
            {primarySkills.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {primarySkills.map((skill, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{skill?.name || 'N/A'}</span>
                      <span className="text-xs text-gray-500 capitalize">{skill?.level || 'N/A'}</span>
                    </div>
                    {skill?.yearsOfExperience && (
                      <p className="text-sm text-gray-600">
                        {skill.yearsOfExperience} years experience
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No primary skills listed</p>
            )}
          </div>

          {/* Secondary Skills */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Secondary Skills</h2>
            {secondarySkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {secondarySkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700"
                  >
                    {skill?.name || 'N/A'} ({skill?.level ? String(skill.level).toLowerCase() : 'N/A'})
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No secondary skills listed</p>
            )}
          </div>

          {/* Certifications */}
          {Array.isArray(resource.certifications) && resource.certifications.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-primary-600" />
                Certifications
              </h2>
              <div className="space-y-3">
                {resource.certifications.map((cert, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{cert?.name || 'Unknown Certification'}</p>
                        <p className="text-sm text-gray-600">{cert?.issuer || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Issued: {cert?.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}
                        </p>
                        {cert?.expiryDate && (
                          <p className="text-xs text-gray-500">
                            Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Experience */}
          {Array.isArray(resource.projectExperience) && resource.projectExperience.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Experience</h2>
              <div className="space-y-4">
                {resource.projectExperience.map((project, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{project?.projectName || 'Unknown Project'}</h3>
                        <p className="text-sm text-gray-600">{project?.domain || 'N/A'} • {project?.role || 'N/A'}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{project?.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
                        <p>{project?.endDate ? `- ${new Date(project.endDate).toLocaleDateString()}` : project?.startDate ? '- Present' : ''}</p>
                      </div>
                    </div>
                    {Array.isArray(project?.technologies) && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {project.technologies.map((tech, techIdx) => (
                          <span
                            key={techIdx}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-primary-50 text-primary-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Soft Blocks */}
          {activeSoftBlocks.length > 0 && (
            <div className="card border-l-4 border-l-yellow-500">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                Active Soft Blocks
              </h2>
              <div className="space-y-3">
                {activeSoftBlocks.map((block) => (
                  <div key={block.id} className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{block.reason}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Until: {block.endDate ? new Date(block.endDate).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      By: {block.createdBy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/matching"
                className="w-full btn-primary text-left flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Consider for Role</span>
              </Link>
              <Link
                to="/soft-blocks"
                className="w-full btn-secondary text-left flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Create Soft Block</span>
              </Link>
              <Link
                to="/interviews"
                className="w-full btn-secondary text-left flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Interview</span>
              </Link>
              <button className="w-full btn-secondary text-left flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>View Resume</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
