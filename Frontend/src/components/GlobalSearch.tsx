import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Briefcase, GitBranch } from 'lucide-react';
import { resourceAPI } from '../services/api';
import { mapApiResourcesToResources } from '../services/resourceMapper';
import { Resource, Requirement } from '../types';

interface SearchResult {
  type: 'resource' | 'requirement';
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  url: string;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [resources, setResources] = useState<Resource[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resourcesResponse = await resourceAPI.getAllResources();
        
        // Handle paginated response: { data: [...], pagination: {...} }
        let resourcesData: any[] = [];
        if (Array.isArray(resourcesResponse)) {
          resourcesData = resourcesResponse;
        } else if (resourcesResponse && typeof resourcesResponse === 'object' && Array.isArray(resourcesResponse.data)) {
          resourcesData = resourcesResponse.data;
        }
        
        if (resourcesData.length > 0) {
          const convertedResources = mapApiResourcesToResources(resourcesData);
          setResources(convertedResources);

          // Derive requirements from considerations
          const requirementMap = new Map<string, Requirement>();
          convertedResources.forEach(resource => {
            if (Array.isArray(resource.considerations)) {
              resource.considerations.forEach((consideration: any) => {
                if (consideration.requirementId && !requirementMap.has(consideration.requirementId)) {
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

          setRequirements(Array.from(requirementMap.values()));
        }
      } catch (err) {
        console.error('Failed to load search data:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (query.trim().length > 0) {
      const searchResults: SearchResult[] = [];

      // Search resources
      resources.forEach(resource => {
        const queryLower = query.toLowerCase();
        const matchesName = (resource.name || '').toLowerCase().includes(queryLower);
        const matchesEmail = (resource.email || '').toLowerCase().includes(queryLower);
        const matchesDesignation = (resource.designation || '').toLowerCase().includes(queryLower);
        const matchesSkills = Array.isArray(resource.skills) && 
          resource.skills.some(s => (s?.name || '').toLowerCase().includes(queryLower));

        if (matchesName || matchesEmail || matchesDesignation || matchesSkills) {
          searchResults.push({
            type: 'resource',
            id: resource.id,
            title: resource.name,
            subtitle: `${resource.designation} • ${resource.location}`,
            icon: User,
            url: `/resource/${resource.employeeId || resource.id}`,
          });
        }
      });

      // Search requirements
      requirements.forEach(requirement => {
        const queryLower = query.toLowerCase();
        const matchesTitle = requirement.title.toLowerCase().includes(queryLower);
        const matchesDescription = requirement.description.toLowerCase().includes(queryLower);
        const matchesDomain = requirement.domain.toLowerCase().includes(queryLower);
        const matchesSkills = Array.isArray(requirement.requiredSkills) &&
          requirement.requiredSkills.some(s => (s?.name || '').toLowerCase().includes(queryLower));

        if (matchesTitle || matchesDescription || matchesDomain || matchesSkills) {
          searchResults.push({
            type: 'requirement',
            id: requirement.id,
            title: requirement.title,
            subtitle: `${requirement.domain} • ${requirement.location}`,
            icon: Briefcase,
            url: `/requirement/${requirement.id}`,
          });
        }
      });

      setResults(searchResults.slice(0, 8));
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, resources, requirements]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      } else if (event.key === 'ArrowDown' && isOpen && results.length > 0) {
        event.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      } else if (event.key === 'ArrowUp' && isOpen && results.length > 0) {
        event.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (event.key === 'Enter' && isOpen && results.length > 0) {
        event.preventDefault();
        navigate(results[selectedIndex].url);
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, results, selectedIndex, navigate]);

  const handleResultClick = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl mx-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search resources, requirements..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            {results.map((result, index) => {
              const Icon = result.icon;
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result.url)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left
                    ${index === selectedIndex ? 'bg-primary-50' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    result.type === 'resource' ? 'bg-primary-100' : 'bg-blue-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      result.type === 'resource' ? 'text-primary-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{result.title}</p>
                    <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    result.type === 'resource' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {result.type === 'resource' ? 'Resource' : 'Requirement'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isOpen && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-500">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
