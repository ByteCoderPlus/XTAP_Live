import { useState, useEffect, useMemo } from 'react';
import { Calendar, Download, Users, TrendingUp, MapPin, Award } from 'lucide-react';
import { Resource } from '../types';
import { resourceAPI } from '../services/api';
import { mapApiResourcesToResources } from '../services/resourceMapper';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToastContext } from '../context/ToastContext';
import SortableTable from '../components/SortableTable';
import { Link } from 'react-router-dom';

export default function WeeklyATP() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToastContext();

  // Debug logging
  useEffect(() => {
    console.log('WeeklyATP state - loading:', loading, 'resources:', resources.length, 'error:', error);
  }, [loading, resources.length, error]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let resourcesData: any[] = [];
        try {
          const data = await resourceAPI.getAllResources();
          // Handle paginated response: { data: [...], pagination: {...} }
          if (Array.isArray(data)) {
            resourcesData = data;
          } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
            resourcesData = data.data;
          } else {
            resourcesData = [];
          }
        } catch (err) {
          console.error('Failed to fetch resources:', err);
          resourcesData = [];
        }
        
        if (!isMounted) return;
        
        if (resourcesData.length === 0) {
          console.warn('No resources data received from API');
        }

        let convertedResources: Resource[] = [];
        try {
          convertedResources = mapApiResourcesToResources(resourcesData);
        } catch (err) {
          console.error('Error mapping resources:', err);
          convertedResources = [];
        }
        
        if (isMounted) {
          setResources(convertedResources);
        }
      } catch (err) {
        if (!isMounted) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to load resources';
        console.error('Error loading WeeklyATP data:', err);
        setError(errorMessage);
        showError(errorMessage);
        setResources([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [showError]);

  // All hooks must be called at the top level, before any conditional returns
  const atpResources = useMemo(() => {
    if (!Array.isArray(resources)) return [];
    return resources.filter(r => r && r.status === 'ATP');
  }, [resources]);

  // Calculate stats for this week
  const weekStats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const newThisWeek = resources.filter(r => {
      if (!r.createdAt) return false;
      const created = new Date(r.createdAt);
      return created >= weekAgo && r.status === 'ATP';
    }).length;

    const deployedThisWeek = resources.filter(r => {
      if (!r.updatedAt) return false;
      const updated = new Date(r.updatedAt);
      return updated >= weekAgo && r.status === 'deployed';
    }).length;

    return { newThisWeek, deployedThisWeek };
  }, [resources]);

  // Group by skill and location (computed values, not hooks)
  const bySkill: Record<string, number> = {};
  atpResources.forEach(resource => {
    if (Array.isArray(resource.skills)) {
      resource.skills.forEach(skill => {
        if (skill && skill.type === 'primary' && skill.name) {
          bySkill[skill.name] = (bySkill[skill.name] || 0) + 1;
        }
      });
    }
  });

  const byLocation: Record<string, number> = {};
  atpResources.forEach(resource => {
    if (resource.location) {
      byLocation[resource.location] = (byLocation[resource.location] || 0) + 1;
    }
  });

  const currentWeek = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-primary-600" />
              <span>Weekly ATP Summary</span>
            </h1>
            <p className="text-gray-600 mt-1">Tuesday Meeting Report - Week of {currentWeek}</p>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Ensure we always return valid JSX
  return (
    <div className="space-y-6">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Calendar className="w-8 h-8 text-primary-600" />
            <span>Weekly ATP Summary</span>
          </h1>
          <p className="text-gray-600 mt-1">Tuesday Meeting Report - Week of {currentWeek}</p>
        </div>
        <button 
          onClick={async () => {
            try {
              const blob = await resourceAPI.exportResources();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `weekly-atp-report-${new Date().toISOString().split('T')[0]}.xlsx`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            } catch (err) {
              console.error('Export failed:', err);
            }
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Export Report</span>
        </button>
      </div>

      {error && (
        <div className="card bg-yellow-50 border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            ⚠️ {error}. Showing available data.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total ATP</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{atpResources.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New This Week</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{weekStats.newThisWeek}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deployed This Week</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{weekStats.deployedThisWeek}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Soft Blocked</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {atpResources.filter(r => Array.isArray(r.softBlocks) && r.softBlocks.length > 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ATP by Skill */}
      {Object.keys(bySkill).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Award className="w-5 h-5 text-primary-600" />
            <span>ATP Resources by Primary Skill</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(bySkill)
              .sort(([, a], [, b]) => b - a)
              .map(([skill, count]) => (
                <div key={skill} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{skill}</span>
                    <span className="text-2xl font-bold text-primary-600">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ATP by Location */}
      {Object.keys(byLocation).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            <span>ATP Resources by Location</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(byLocation)
              .sort(([, a], [, b]) => b - a)
              .map(([location, count]) => (
                <div key={location} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{location}</span>
                    <span className="text-2xl font-bold text-primary-600">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Detailed ATP List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed ATP Resource List</h3>
        {atpResources.length > 0 ? (
          <SortableTable
            data={atpResources}
            columns={[
              {
                key: 'name',
                label: 'Resource',
                sortable: true,
                render: (resource) => (
                  <div>
                    <Link
                      to={`/resource/${resource.employeeId || resource.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600"
                    >
                      {resource.name}
                    </Link>
                    <div className="text-sm text-gray-500">{resource.designation}</div>
                  </div>
                ),
              },
              {
                key: 'location',
                label: 'Location',
                sortable: true,
                render: (resource) => <span className="text-sm text-gray-900">{resource.location || 'N/A'}</span>,
              },
              {
                key: 'skills',
                label: 'Primary Skills',
                sortable: false,
                render: (resource) => (
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(resource.skills) && resource.skills
                      .filter(s => s && s.type === 'primary')
                      .slice(0, 3)
                      .map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-50 text-primary-700"
                        >
                          {skill?.name || 'N/A'}
                        </span>
                      ))}
                    {(!Array.isArray(resource.skills) || resource.skills.length === 0) && (
                      <span className="text-xs text-gray-400">No skills listed</span>
                    )}
                  </div>
                ),
              },
              {
                key: 'availabilityDate',
                label: 'Availability',
                sortable: true,
                render: (resource) => (
                  <span className="text-sm text-gray-900">
                    {resource.availabilityDate
                      ? new Date(resource.availabilityDate).toLocaleDateString()
                      : 'Immediate'}
                  </span>
                ),
              },
              {
                key: 'softBlocks',
                label: 'Status',
                sortable: false,
                render: (resource) => (
                  Array.isArray(resource.softBlocks) && resource.softBlocks.length > 0 ? (
                    <span className="badge bg-yellow-100 text-yellow-800">
                      Soft Blocked
                    </span>
                  ) : (
                    <span className="badge bg-green-100 text-green-800">
                      Available
                    </span>
                  )
                ),
              },
            ]}
            keyExtractor={(resource) => resource.id}
            onRowClick={(resource) => {
              window.location.href = `/resource/${resource.employeeId || resource.id}`;
            }}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No ATP resources available</p>
          </div>
        )}
      </div>

      {/* Action Items */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Items for This Week</h3>
        <div className="space-y-3">
          {[
            'Follow up on pending interviews for React developers',
            'Review soft blocks expiring this week',
            'Coordinate with Sales on upcoming proposals requiring Java skills',
            'Schedule reskilling sessions for resources with skill gaps',
          ].map((item, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-5 h-5 rounded-full border-2 border-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-primary-600 rounded-full" />
              </div>
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
