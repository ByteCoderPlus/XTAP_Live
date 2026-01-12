import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Award, TrendingUp, Calendar, DollarSign, Grid, List } from 'lucide-react';
import { Resource, ResourceStatus } from '../types';
import Pagination from '../components/Pagination';
import { useToastContext } from '../context/ToastContext';
import { resourceAPI, extractArray } from '../services/api';
import { mapApiResourcesToResources } from '../services/resourceMapper';
import LoadingSpinner from '../components/LoadingSpinner';

const statusColors: Record<ResourceStatus, string> = {
  ATP: 'bg-green-100 text-green-800',
  deployed: 'bg-blue-100 text-blue-800',
  'soft-blocked': 'bg-yellow-100 text-yellow-800',
  notice: 'bg-red-100 text-red-800',
  leave: 'bg-purple-100 text-purple-800',
  trainee: 'bg-indigo-100 text-indigo-800',
  'interview-scheduled': 'bg-orange-100 text-orange-800',
};

export default function BenchDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ResourceStatus | 'all'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<number | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [resources, setResources] = useState<Resource[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]); // Store all resources for fallback
  const [locations, setLocations] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, atp: 0, deployed: 0, softBlocked: 0 });
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItemsFromAPI, setTotalItemsFromAPI] = useState<number | null>(null);
  const itemsPerPage = 9;
  const { error: showError, success } = useToastContext();

  // Fetch resources and related data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [resourcesResponse, locationsData, skillsData, statsData] = await Promise.all([
          resourceAPI.getAllResources(),
          resourceAPI.getAvailableLocations(),
          resourceAPI.getAvailableSkills(),
          resourceAPI.getResourceStatistics(),
        ]);

        // Handle paginated response: { data: [...], pagination: {...} }
        let resourcesArray: any[] = [];
        let paginationData: any = null;
        
        if (resourcesResponse && typeof resourcesResponse === 'object' && !Array.isArray(resourcesResponse)) {
          if (Array.isArray(resourcesResponse.data)) {
            // Paginated response
            resourcesArray = resourcesResponse.data;
            paginationData = resourcesResponse.pagination;
          } else {
            // Try to extract array using existing logic
            const extracted = extractArray<any[]>(resourcesResponse);
            resourcesArray = Array.isArray(extracted) ? extracted : [];
          }
        } else if (Array.isArray(resourcesResponse)) {
          // Direct array response
          resourcesArray = resourcesResponse;
        } else {
          console.error('Resources data is not in expected format:', resourcesResponse);
          throw new Error('Invalid response format: resources data is not an array or paginated object');
        }

        // Convert API resources to app Resource type
        const convertedResources = mapApiResourcesToResources(resourcesArray);

        setResources(convertedResources);
        setAllResources(convertedResources); // Store all resources for fallback
        
        // Store total items from pagination if available
        if (paginationData && paginationData.totalItems) {
          setTotalItemsFromAPI(paginationData.totalItems);
        } else {
          setTotalItemsFromAPI(null);
        }
        
        // Ensure locations and skills are arrays
        setLocations(Array.isArray(locationsData) ? locationsData : []);
        setSkills(Array.isArray(skillsData) ? skillsData : []);
        setStats({
          total: statsData.total || paginationData?.totalItems || convertedResources.length,
          atp: statsData.atp || convertedResources.filter(r => r.status === 'ATP').length,
          deployed: statsData.deployed || convertedResources.filter(r => r.status === 'deployed').length,
          softBlocked: statsData.softBlocked || convertedResources.filter(r => r.status === 'soft-blocked').length,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load resources';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showError]);

  // Use API search when skill, location, or experience filters are applied
  useEffect(() => {
    const shouldUseAPISearch = 
      selectedSkill !== 'all' || 
      selectedLocation !== 'all' || 
      (selectedExperience !== '' && selectedExperience !== null);

    if (shouldUseAPISearch && allResources.length > 0) {
      const performAPISearch = async () => {
        try {
          setSearching(true);
          const skillsToSearch = selectedSkill !== 'all' ? [selectedSkill] : [];
          
          // If search term contains skill names, add them to skills array
          if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            skills.forEach(skill => {
              if (skill.toLowerCase().includes(searchLower) && !skillsToSearch.includes(skill)) {
                skillsToSearch.push(skill);
              }
            });
          }

          const searchParams: any = {
            skills: skillsToSearch,
            page: currentPage - 1,
            limit: itemsPerPage,
          };

          if (selectedLocation !== 'all') {
            searchParams.location = selectedLocation;
          }

          if (selectedExperience !== '' && selectedExperience !== null) {
            searchParams.experience = Number(selectedExperience);
          }

          const searchResponse = await resourceAPI.searchBySkills(searchParams);
          // Handle paginated response: { data: [...], pagination: {...} }
          let searchResults: any[] = [];
          if (Array.isArray(searchResponse)) {
            searchResults = searchResponse;
          } else if (searchResponse && typeof searchResponse === 'object' && Array.isArray(searchResponse.data)) {
            searchResults = searchResponse.data;
          }
          const convertedResults = mapApiResourcesToResources(searchResults);
          
          // Apply status filter client-side if needed
          let filtered = convertedResults;
          if (selectedStatus !== 'all') {
            filtered = convertedResults.filter(r => r.status === selectedStatus);
          }

          // Apply search term filter client-side if needed
          if (searchTerm.trim() && skillsToSearch.length === 0) {
            filtered = filtered.filter(resource => {
              const matchesSearch = 
                (resource.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (resource.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (resource.designation || '').toLowerCase().includes(searchTerm.toLowerCase());
              return matchesSearch;
            });
          }

          setResources(filtered);
        } catch (err) {
          console.error('API search failed, using local filter:', err);
          // Fallback to local filtering
          setResources(allResources);
        } finally {
          setSearching(false);
        }
      };

      performAPISearch();
    } else if (allResources.length > 0) {
      // Use local filtering when no API search criteria
      setResources(allResources);
    }
  }, [selectedSkill, selectedLocation, selectedExperience, currentPage, searchTerm, allResources, skills, itemsPerPage, selectedStatus]);

  const filteredResources = useMemo(() => {
    if (!Array.isArray(resources) || resources.length === 0) {
      return [];
    }
    
    // If using API search, resources are already filtered, just apply search term and status
    if (selectedSkill !== 'all' || selectedLocation !== 'all' || (selectedExperience !== '' && selectedExperience !== null)) {
      // API search already applied skill, location, and experience filters
      // Just apply search term and status client-side
      return resources.filter(resource => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm.trim() || 
          (resource.name || '').toLowerCase().includes(searchLower) ||
          (resource.email || '').toLowerCase().includes(searchLower) ||
          (resource.designation || '').toLowerCase().includes(searchLower) ||
          (Array.isArray(resource.skills) && resource.skills.some(s => (s?.name || '').toLowerCase().includes(searchLower)));

        const matchesStatus = selectedStatus === 'all' || resource.status === selectedStatus;
        
        // Double-check experience filter in case API didn't apply it correctly
        const matchesExperience = selectedExperience === '' || selectedExperience === null || 
          (resource.totalExperience !== undefined && resource.totalExperience >= Number(selectedExperience));

        return matchesSearch && matchesStatus && matchesExperience;
      });
    }
    
    // Local filtering for all criteria
    return resources.filter(resource => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (resource.name || '').toLowerCase().includes(searchLower) ||
        (resource.email || '').toLowerCase().includes(searchLower) ||
        (resource.designation || '').toLowerCase().includes(searchLower) ||
        (Array.isArray(resource.skills) && resource.skills.some(s => (s?.name || '').toLowerCase().includes(searchLower)));

      const matchesStatus = selectedStatus === 'all' || resource.status === selectedStatus;
      const matchesLocation = selectedLocation === 'all' || resource.location === selectedLocation;
      const matchesSkill = selectedSkill === 'all' || (Array.isArray(resource.skills) && resource.skills.some(s => s?.name === selectedSkill));
      
      // Experience filter: check if resource's totalExperience meets minimum requirement
      const matchesExperience = selectedExperience === '' || selectedExperience === null || 
        (resource.totalExperience !== undefined && resource.totalExperience >= Number(selectedExperience));

      return matchesSearch && matchesStatus && matchesLocation && matchesSkill && matchesExperience;
    });
  }, [resources, searchTerm, selectedStatus, selectedLocation, selectedSkill, selectedExperience]);

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredResources.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredResources, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedLocation, selectedSkill, selectedExperience]);

  const handleExport = async () => {
    try {
      // Try API export first
      try {
        const blob = await resourceAPI.exportResources();
        
        // Check if blob is actually valid (has size > 0)
        if (blob.size === 0) {
          throw new Error('API returned empty file');
        }
        
        // Check if it's JSON (API error response)
        const firstBytes = await blob.slice(0, 1).arrayBuffer();
        const firstByte = new Uint8Array(firstBytes)[0];
        // JSON typically starts with '{' (0x7B) or '[' (0x5B)
        if (firstByte === 0x7B || firstByte === 0x5B) {
          const text = await blob.text();
          try {
            const json = JSON.parse(text);
            throw new Error(json.message || json.error || 'API returned JSON instead of Excel file');
          } catch {
            throw new Error('API returned invalid response format');
          }
        }
        
        // Ensure the blob has the correct MIME type for Excel
        const excelBlob = blob.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          ? blob 
          : new Blob([blob], { 
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
        
        const url = window.URL.createObjectURL(excelBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resources-export-${new Date().toISOString().split('T')[0]}.xlsx`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Clean up after a short delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
        
        success('Resources exported successfully');
        return;
      } catch (apiError) {
        console.warn('API export failed, falling back to CSV export:', apiError);
        // Fall through to CSV export
      }
      
      // Fallback: Generate CSV export client-side
      const csvData = generateCSVExport(filteredResources);
      const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resources-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      success('Resources exported as CSV successfully');
    } catch (err) {
      console.error('Export error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to export resources';
      showError(errorMessage);
    }
  };

  // Helper function to generate CSV export
  const generateCSVExport = (resourcesToExport: Resource[]): string => {
    const headers = [
      'Employee ID',
      'Name',
      'Email',
      'Designation',
      'Location',
      'Status',
      'Availability Date',
      'Release Date',
      'Primary Skills',
      'CTC',
      'Currency',
    ];
    
    const rows = resourcesToExport.map(resource => {
      const primarySkills = Array.isArray(resource.skills)
        ? resource.skills
            .filter(s => s && s.type === 'primary')
            .map(s => `${s.name} (${s.level})`)
            .join('; ')
        : '';
      
      return [
        resource.employeeId || resource.id || '',
        resource.name || '',
        resource.email || '',
        resource.designation || '',
        resource.location || '',
        resource.status || '',
        resource.availabilityDate || '',
        resource.releaseDate || '',
        primarySkills,
        resource.ctc?.toString() || '',
        resource.ctcCurrency || 'INR',
      ];
    });
    
    // Escape CSV values (handle commas, quotes, newlines)
    const escapeCSV = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };
    
    const csvRows = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(cell => escapeCSV(String(cell || ''))).join(','))
    ];
    
    // Add BOM for Excel UTF-8 support
    return '\uFEFF' + csvRows.join('\n');
  };

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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bench Resource Directory</h1>
          <p className="text-gray-600 mt-1">Manage and track all ATP resources</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Search Bar - Moved to right, larger size */}
          <div className="relative w-[500px]">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 pr-4 py-3.5 text-base w-full"
            />
          </div>
          <button onClick={handleExport} className="btn-primary whitespace-nowrap">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Resources</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalItemsFromAPI !== null ? totalItemsFromAPI : stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ATP Available</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.atp}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deployed</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.deployed}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Soft Blocked</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.softBlocked}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ResourceStatus | 'all')}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="ATP">ATP</option>
            <option value="deployed">Deployed</option>
            <option value="soft-blocked">Soft Blocked</option>
            <option value="notice">Notice</option>
            <option value="leave">Leave</option>
            <option value="trainee">Trainee</option>
          </select>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="input-field"
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="input-field"
          >
            <option value="all">All Skills</option>
            {skills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
          {/* <input
            type="number"
            placeholder="Min Experience (years)"
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value ? Number(e.target.value) : '')}
            min="0"
            className="input-field"
          /> */}
        </div>
        {searching && (
          <div className="mt-2 text-sm text-gray-600 flex items-center">
            <LoadingSpinner />
            <span className="ml-2">Searching resources...</span>
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {paginatedResources.length} of {filteredResources.length} resources
        </p>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Resources Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} isList />
          ))}
        </div>
      )}

      {filteredResources.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No resources found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredResources.length}
          />
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource, isList = false }: { resource: Resource; isList?: boolean }) {
  const primarySkills = Array.isArray(resource.skills) 
    ? resource.skills.filter(s => s && s.type === 'primary').slice(0, 3)
    : [];
  const hasSoftBlock = Array.isArray(resource.softBlocks) && resource.softBlocks.length > 0;
  const { success } = useToastContext();

  if (isList) {
    return (
      <div className="card hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Link
                  to={`/resource/${resource.employeeId || resource.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                >
                  {resource.name}
                </Link>
                <span className={`badge ${statusColors[resource.status]}`}>
                  {resource.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{resource.designation} • {resource.employeeId}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {resource.location}
                </span>
                {resource.availabilityDate && (
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Available from {new Date(resource.availabilityDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 max-w-xs">
              {primarySkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
          <div className="ml-4 flex gap-2">
            <Link
              to={`/resource/${resource.employeeId || resource.id}`}
              className="btn-primary text-sm py-2 px-4"
            >
              View Details
            </Link>
            <button className="btn-secondary text-sm py-2 px-4">
              Consider
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
          <p className="text-sm text-gray-600">{resource.designation}</p>
          <p className="text-xs text-gray-500 mt-1">{resource.employeeId}</p>
        </div>
        <span className={`badge ${statusColors[resource.status]}`}>
          {resource.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {resource.location}
        </div>

        {resource.availabilityDate && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            Available from {new Date(resource.availabilityDate).toLocaleDateString()}
          </div>
        )}

        {hasSoftBlock && Array.isArray(resource.softBlocks) && resource.softBlocks[0] && (
          <div className="flex items-center text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded">
            <Calendar className="w-4 h-4 mr-2" />
            Soft blocked until {resource.softBlocks[0].endDate ? new Date(resource.softBlocks[0].endDate).toLocaleDateString() : 'N/A'}
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Primary Skills</p>
          {primarySkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {primarySkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700"
                >
                  {skill?.name || 'N/A'}
                  {skill?.level && <span className="ml-1 text-primary-500">({skill.level})</span>}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No primary skills listed</p>
          )}
        </div>

        {Array.isArray(resource.certifications) && resource.certifications.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Certifications</p>
            <div className="flex flex-wrap gap-2">
              {resource.certifications.slice(0, 2).map((cert, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                >
                  <Award className="w-3 h-3 mr-1" />
                  {cert.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {resource.ctc && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>CTC: ₹{(resource.ctc / 100000).toFixed(1)}L {resource.ctcCurrency && `(${resource.ctcCurrency})`}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
        <Link
          to={`/resource/${resource.employeeId || resource.id}`}
          className="flex-1 btn-primary text-sm py-2 text-center"
        >
          View Details
        </Link>
        <button
          onClick={() => success(`${resource.name} added to consideration list`)}
          className="flex-1 btn-secondary text-sm py-2"
        >
          Consider for Role
        </button>
      </div>
    </div>
  );
}
