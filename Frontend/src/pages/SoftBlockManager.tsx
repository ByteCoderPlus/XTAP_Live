import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Calendar, User, Plus, X } from 'lucide-react';
import { SoftBlock } from '../types';
import { resourceAPI, ApiResource } from '../services/api';
import { useToastContext } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { accountAPI } from '../services/api';

interface SoftBlockWithResource extends SoftBlock {
  resourceName: string;
  resourceDesignation: string;
  resourceLocation: string;
}

export default function SoftBlockManager() {
  const [softBlocks, setSoftBlocks] = useState<SoftBlockWithResource[]>([]);
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterActive, setFilterActive] = useState<boolean | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToastContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [resourcesResponse, accountsData] = await Promise.all([
          resourceAPI.getAllResources(),
          accountAPI.getAllAccounts(),
        ]);
        
        // Handle paginated response: { data: [...], pagination: {...} }
        let resourcesArray: any[] = [];
        if (Array.isArray(resourcesResponse)) {
          resourcesArray = resourcesResponse;
        } else if (resourcesResponse && typeof resourcesResponse === 'object' && Array.isArray(resourcesResponse.data)) {
          resourcesArray = resourcesResponse.data;
        } else {
          resourcesArray = [];
        }
        
        // Ensure accounts is an array
        const accountsArray = Array.isArray(accountsData) ? accountsData : [];
        
        setResources(resourcesArray);
        setAccounts(accountsArray);
        
        // Extract soft blocks from resources
        const allSoftBlocks: SoftBlockWithResource[] = resourcesArray
          .filter((r: ApiResource | any) => {
            const softBlocks = r.softBlocks || r.blocks || r.blockedDates || [];
            return Array.isArray(softBlocks) && softBlocks.length > 0;
          })
          .flatMap((resource: ApiResource | any, resourceIndex: number) => {
            const softBlocks = resource.softBlocks || resource.blocks || resource.blockedDates || [];
            const resourceId = resource.employeeId || resource.id || `resource-${resourceIndex}`;
            const resourceName = resource.name || resource.fullName || resource.resourceName || resource.employeeName || '';
            const resourceDesignation = resource.designation || resource.role || resource.title || resource.position || '';
            const resourceLocation = resource.location || resource.city || resource.baseLocation || resource.officeLocation || '';
            
            return softBlocks.map((block: any, blockIndex: number) => {
              // Handle API format: blockedUntil is the end date
              const endDate = block.blockedUntil || block.endDate;
              // Use resource's createdAt date as start date if not provided, or current date
              const resourceCreatedDate = resource.createdAt 
                ? new Date(resource.createdAt).toISOString().split('T')[0] 
                : new Date().toISOString().split('T')[0];
              const startDate = block.startDate || resourceCreatedDate;
              
              return {
                ...block,
                id: block.id || `${resourceId}-${block.accountId || blockIndex}-${endDate || blockIndex}`,
                resourceId: block.resourceId || resourceId,
                resourceName: resourceName || '',
                resourceDesignation: resourceDesignation || '',
                resourceLocation: resourceLocation || '',
                // Map API format to expected format
                startDate: startDate,
                endDate: endDate,
                reason: block.accountName || block.reason || 'Soft Block',
                createdBy: block.createdBy || 'System',
                createdAt: block.createdAt || resource.createdAt || new Date().toISOString(),
                // Keep API fields for reference
                accountId: block.accountId,
                accountName: block.accountName,
                blockedUntil: block.blockedUntil,
              };
            });
          });
        setSoftBlocks(allSoftBlocks);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load soft blocks';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showError]);

  const now = new Date();
  const filteredBlocks = softBlocks.filter(block => {
    if (filterActive === 'all') return true;
    const endDate = parseDate(block.endDate);
    if (!endDate) return false;
    return filterActive ? endDate > now : endDate <= now;
  });

  const activeBlocks = softBlocks.filter(b => {
    const endDate = parseDate(b.endDate);
    return endDate ? endDate > now : false;
  });
  const expiredBlocks = softBlocks.filter(b => {
    const endDate = parseDate(b.endDate);
    return endDate ? endDate <= now : false;
  });

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
            <Shield className="w-8 h-8 text-primary-600" />
            <span>Soft Block Management</span>
          </h1>
          <p className="text-gray-600 mt-1">Prevent double booking and manage resource reservations</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Soft Block</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Soft Blocks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{softBlocks.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{activeBlocks.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{expiredBlocks.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <X className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
        <select
          value={filterActive === true ? 'active' : filterActive === false ? 'expired' : 'all'}
          onChange={(e) => {
            const value = e.target.value;
            setFilterActive(value === 'active' ? true : value === 'expired' ? false : 'all');
          }}
          className="input-field"
        >
          <option value="all">All Soft Blocks</option>
          <option value="active">Active Only</option>
          <option value="expired">Expired Only</option>
        </select>
      </div>

      {/* Soft Blocks List */}
      <div className="space-y-4">
        {filteredBlocks.map((block, index) => (
          <SoftBlockCard 
            key={block.id || `${block.resourceId}-${block.startDate}-${block.endDate}-${index}`} 
            block={block} 
          />
        ))}
      </div>

      {filteredBlocks.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No soft blocks found.</p>
        </div>
      )}

      {/* New Soft Block Form Modal */}
      {showForm && (
        <SoftBlockFormModal 
          onClose={() => setShowForm(false)} 
          resources={resources}
          accounts={accounts}
          onSuccess={() => {
            setShowForm(false);
            // Refresh data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

// Helper function to safely parse dates
function parseDate(dateValue: any): Date | null {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // Handle string dates (both "YYYY-MM-DD" and ISO datetime formats)
  if (typeof dateValue === 'string') {
    // If it's just a date string (YYYY-MM-DD), ensure it's treated as UTC to avoid timezone issues
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const parsed = new Date(dateValue + 'T00:00:00Z');
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    // Otherwise try parsing as-is (handles ISO datetime strings)
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // If it's a number (timestamp), try to parse it
  if (typeof dateValue === 'number') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  return null;
}

// Helper function to format date safely
function formatDate(dateValue: any): string {
  const date = parseDate(dateValue);
  if (!date) return 'N/A';
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function SoftBlockCard({ block }: { block: SoftBlockWithResource }) {
  const now = new Date();
  const endDate = parseDate(block.endDate);
  const isActive = endDate ? endDate > now : false;
  const daysRemaining = isActive && endDate
    ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className={`card hover:shadow-lg transition-shadow ${isActive ? 'border-l-4 border-l-yellow-500' : 'opacity-75'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <Link
              to={`/resource/${block.resourceId}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
            >
              {block.resourceName}
            </Link>
            {isActive ? (
              <span className="badge bg-yellow-100 text-yellow-800">
                Active
              </span>
            ) : (
              <span className="badge bg-gray-100 text-gray-800">
                Expired
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-1">{block.resourceDesignation} • {block.resourceLocation}</p>
          <p className="text-sm text-gray-500 mb-3">{block.accountName || block.reason || 'Soft Block'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <div>
            <p className="text-xs text-gray-500">Start Date</p>
            <p className="font-medium text-gray-900">
              {formatDate(block.startDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <div>
            <p className="text-xs text-gray-500">End Date</p>
            <p className="font-medium text-gray-900">
              {formatDate(block.endDate)}
            </p>
          </div>
        </div>
        {isActive && (
          <div className="flex items-center text-sm text-yellow-600">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <div>
              <p className="text-xs text-yellow-500">Time Remaining</p>
              <p className="font-medium">
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center text-sm text-gray-500 mb-4">
        <User className="w-4 h-4 mr-2" />
        <span>Created by {block.createdBy || 'System'} on {formatDate(block.createdAt)}</span>
      </div>

      {/* <div className="flex gap-2 pt-4 border-t border-gray-200">
        {isActive && (
          <>
            <button className="flex-1 btn-secondary text-sm py-2">
              Extend Block
            </button>
            <button className="flex-1 btn-secondary text-sm py-2">
              Remove Block
            </button>
          </>
        )}
        <Link
          to={`/resource/${block.resourceId}`}
          className="btn-secondary text-sm py-2 text-center"
        >
          View Resource
        </Link>
      </div> */}
    </div>
  );
}

function SoftBlockFormModal({ 
  onClose, 
  resources, 
  accounts,
  onSuccess 
}: { 
  onClose: () => void;
  resources: ApiResource[];
  accounts: any[];
  onSuccess: () => void;
}) {
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [blockedUntil, setBlockedUntil] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { success, error: showError } = useToastContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceId || !selectedAccountId || !blockedUntil) {
      showError('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      await resourceAPI.softBlockResource(selectedResourceId, selectedAccountId, blockedUntil);
      success('Soft block created successfully');
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create soft block';
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Soft Block</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resource</label>
              <select 
                className="input-field"
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                required
              >
                <option value="">Select a resource...</option>
                {resources.map(r => (
                  <option key={r.id} value={r.employeeId || r.id}>
                    {r.name} - {r.designation} ({r.employeeId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
              <select 
                className="input-field"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                required
              >
                <option value="">Select an account...</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name || `Account ${account.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blocked Until</label>
              <input 
                type="date" 
                className="input-field"
                value={blockedUntil}
                onChange={(e) => setBlockedUntil(e.target.value)}
                min={today}
                required
              />
            </div>
          </div>
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose} 
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Soft Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
