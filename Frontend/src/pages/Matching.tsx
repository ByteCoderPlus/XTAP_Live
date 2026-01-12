import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { MatchRecommendation, Resource, Requirement } from '../types';
import { resourceAPI } from '../services/api';
import { mapApiResourcesToResources } from '../services/resourceMapper';
import { findMatches } from '../services/matchingService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToastContext } from '../context/ToastContext';

export default function Matching() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const { error: showError } = useToastContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const resourcesResponse = await resourceAPI.getAllResources();
        
        // Handle paginated response: { data: [...], pagination: {...} }
        let resourcesData: any[] = [];
        if (Array.isArray(resourcesResponse)) {
          resourcesData = resourcesResponse;
        } else if (resourcesResponse && typeof resourcesResponse === 'object' && Array.isArray(resourcesResponse.data)) {
          resourcesData = resourcesResponse.data;
        } else {
          throw new Error('Invalid response format: resources data is not an array or paginated object');
        }

        // Convert API resources to app Resource type
        const convertedResources = mapApiResourcesToResources(resourcesData);

        setResources(convertedResources);

        // Derive requirements from resource considerations
        const derivedRequirements: Requirement[] = [];
        const requirementMap = new Map<string, Requirement>();

        convertedResources.forEach(resource => {
          if (Array.isArray(resource.considerations)) {
            resource.considerations.forEach((consideration: any) => {
              if (consideration.requirementId && !requirementMap.has(consideration.requirementId)) {
                // Create a requirement from consideration data
                requirementMap.set(consideration.requirementId, {
                  id: consideration.requirementId,
                  title: consideration.requirementTitle || `Requirement ${consideration.requirementId}`,
                  description: consideration.requirementDescription || 'Derived from resource considerations',
                  requiredSkills: consideration.requiredSkills || [],
                  preferredSkills: consideration.preferredSkills || [],
                  experienceLevel: consideration.experienceLevel || 'Not specified',
                  location: consideration.location || resource.location || 'Not specified',
                  domain: consideration.domain || 'General',
                  startDate: consideration.startDate || new Date().toISOString().split('T')[0],
                  status: consideration.status || 'open',
                  priority: consideration.priority || 'medium',
                  createdBy: consideration.createdBy || 'System',
                  createdAt: consideration.createdAt || new Date().toISOString(),
                  updatedAt: consideration.updatedAt || new Date().toISOString(),
                });
              }
            });
          }
        });

        // If no requirements from considerations, create sample ones based on common skills
        if (requirementMap.size === 0) {
          const commonSkills = new Set<string>();
          convertedResources.forEach(r => {
            if (Array.isArray(r.skills)) {
              r.skills.forEach(s => {
                if (s.type === 'primary') {
                  commonSkills.add(s.name);
                }
              });
            }
          });

          Array.from(commonSkills).slice(0, 3).forEach((skill, idx) => {
            const reqId = `req-${skill.toLowerCase().replace(/\s+/g, '-')}`;
            requirementMap.set(reqId, {
              id: reqId,
              title: `Senior ${skill} Developer`,
              description: `Looking for an experienced ${skill} developer`,
              requiredSkills: [{ name: skill, level: 'advanced', type: 'primary' }],
              preferredSkills: [],
              experienceLevel: '5+ years',
              location: 'Multiple',
              domain: 'Technology',
              startDate: new Date().toISOString().split('T')[0],
              status: 'open',
              priority: 'high',
              createdBy: 'System',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          });
        }

        setRequirements(Array.from(requirementMap.values()));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showError]);

  const matches = useMemo(() => {
    if (resources.length === 0 || requirements.length === 0) {
      return [];
    }
    return findMatches(resources, requirements);
  }, [resources, requirements]);

  const filteredMatches = useMemo(() => {
    let filtered = matches;
    
    if (selectedRequirement) {
      filtered = filtered.filter(m => m.requirement.id === selectedRequirement);
    }
    
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(m => m.resource.location === selectedLocation);
    }
    
    return filtered;
  }, [matches, selectedRequirement, selectedLocation]);

  const uniqueRequirements = Array.from(new Set(matches.map(m => m.requirement.id)));
  const uniqueLocations = Array.from(new Set(resources.map(r => r.location).filter(Boolean)));

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-primary-600" />
            <span>Profile Matching / Mapping</span>
          </h1>
          <p className="text-gray-600 mt-1">AI-powered skillset matching. Smart resource-role recommendations based on skills, experience, availability, and location</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uniqueRequirements.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Requirement</label>
              <select
                value={selectedRequirement || 'all'}
                onChange={(e) => setSelectedRequirement(e.target.value === 'all' ? null : e.target.value)}
                className="input-field"
              >
                <option value="all">All Requirements</option>
                {uniqueRequirements.map(reqId => {
                  const req = matches.find(m => m.requirement.id === reqId)?.requirement;
                  return req ? (
                    <option key={reqId} value={reqId}>{req.title}</option>
                  ) : null;
                })}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Location</label>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="input-field"
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Match Cards */}
      <div className="space-y-6">
        {filteredMatches.map((match, idx) => (
          <MatchCard key={idx} match={match} />
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No matches found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}

function MatchCard({ match }: { match: MatchRecommendation }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <Link
              to={`/resource/${match.resource.employeeId || match.resource.id}`}
              className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
            >
              {match.resource.name}
            </Link>
            <span className={`badge ${getScoreColor(match.matchScore)}`}>
              {match.matchScore}% Match
            </span>
          </div>
          <p className="text-gray-600 mb-1">{match.resource.designation} • {match.resource.location}</p>
          <p className="text-sm text-gray-500">
            For: <Link to={`/requirement/${match.requirement.id}`} className="hover:text-primary-600 underline">{match.requirement.title}</Link>
          </p>
        </div>
        {match.grossMargin && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Gross Margin</p>
            <p className="text-2xl font-bold text-green-600">{match.grossMargin}%</p>
          </div>
        )}
      </div>

      {/* Match Score Breakdown */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Match Score</span>
          <span className="text-sm text-gray-600">{match.matchScore}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              match.matchScore >= 90 ? 'bg-green-500' :
              match.matchScore >= 75 ? 'bg-blue-500' :
              match.matchScore >= 60 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${match.matchScore}%` }}
          />
        </div>
      </div>

      {/* Skill Matches */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-900">Matched Skills</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {match.skillMatches.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Skill Gaps */}
      {match.skillGaps.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h4 className="font-medium text-gray-900">Skill Gaps</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {match.skillGaps.map((gap, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800"
              >
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Upskilling */}
      {match.recommendedUpskilling.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Recommended Upskilling</h4>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {match.recommendedUpskilling.map((training, idx) => (
              <li key={idx}>{training}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Reasons */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Why this match?</h4>
        <ul className="space-y-1">
          {match.reasons.map((reason, idx) => (
            <li key={idx} className="text-sm text-gray-700 flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Resource Details */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 mb-1">Availability</p>
          <p className="text-sm font-medium text-gray-900">
            {match.resource.availabilityDate
              ? new Date(match.resource.availabilityDate).toLocaleDateString()
              : 'Immediate'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Location</p>
          <p className="text-sm font-medium text-gray-900">
            {match.resource.location}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Experience</p>
          <p className="text-sm font-medium text-gray-900">
            {match.resource.projectExperience.length} projects
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Certifications</p>
          <p className="text-sm font-medium text-gray-900">
            {match.resource.certifications.length} certified
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Link
          to={`/interviews`}
          className="flex-1 btn-primary flex items-center justify-center space-x-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Consider for Interview</span>
        </Link>
        <Link
          to={`/soft-blocks`}
          className="flex-1 btn-secondary flex items-center justify-center space-x-2"
        >
          <Clock className="w-4 h-4" />
          <span>Soft Block</span>
        </Link>
        <Link
          to={`/resource/${match.resource.employeeId || match.resource.id}`}
          className="btn-secondary"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
