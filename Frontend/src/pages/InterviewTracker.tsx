import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, User, Briefcase } from 'lucide-react';
import { InterviewStatus, Resource } from '../types';
import { resourceAPI } from '../services/api';
import { mapApiResourcesToResources } from '../services/resourceMapper';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToastContext } from '../context/ToastContext';

interface Interview {
  id: string;
  resourceName: string;
  resourceId: string;
  requirementTitle: string;
  requirementId: string;
  interviewDate: string;
  interviewStatus: InterviewStatus;
  matchScore: number;
  feedback?: string;
  interviewer?: string;
}

const statusConfig: Record<InterviewStatus, { color: string; icon: any; label: string }> = {
  pending: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Pending' },
  scheduled: { color: 'bg-blue-100 text-blue-800', icon: Calendar, label: 'Scheduled' },
  selected: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Selected' },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
  'pending-feedback': { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Pending Feedback' },
};

export default function InterviewTracker() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<InterviewStatus | 'all'>('all');
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

        const convertedResources = mapApiResourcesToResources(resourcesData);

        setResources(convertedResources);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load interviews';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showError]);

  // Derive interviews from resource considerations
  const interviews = useMemo(() => {
    const interviewList: Interview[] = [];
    
    resources.forEach(resource => {
      if (Array.isArray(resource.considerations)) {
        resource.considerations.forEach((consideration: any, idx: number) => {
          if (consideration.interviewStatus) {
            interviewList.push({
              id: `${resource.id}-${consideration.id || idx}`,
              resourceName: resource.name,
              resourceId: resource.employeeId || resource.id,
              requirementTitle: consideration.requirementTitle || `Requirement ${consideration.requirementId}`,
              requirementId: consideration.requirementId || 'unknown',
              interviewDate: consideration.interviewDate || consideration.createdAt || new Date().toISOString(),
              interviewStatus: consideration.interviewStatus as InterviewStatus,
              matchScore: consideration.matchScore || 0,
              feedback: consideration.feedback,
              interviewer: consideration.interviewer,
            });
          }
        });
      }
    });

    return interviewList;
  }, [resources]);

  const filteredInterviews = useMemo(() => {
    return filterStatus === 'all'
      ? interviews
      : interviews.filter(i => i.interviewStatus === filterStatus);
  }, [interviews, filterStatus]);

  const stats = useMemo(() => ({
    total: interviews.length,
    scheduled: interviews.filter(i => i.interviewStatus === 'scheduled').length,
    pendingFeedback: interviews.filter(i => i.interviewStatus === 'pending-feedback').length,
    selected: interviews.filter(i => i.interviewStatus === 'selected').length,
  }), [interviews]);

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
          <h1 className="text-3xl font-bold text-gray-900">Candidate Interview</h1>
          <p className="text-gray-600 mt-1">Track and manage interview statuses and outcomes</p>
        </div>
      </div>

      {/* Stats - Present Date */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">As of today</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.scheduled}</p>
                <p className="text-xs text-gray-500 mt-1">As of today</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Feedback</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pendingFeedback}</p>
                <p className="text-xs text-gray-500 mt-1">As of today</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.selected}</p>
                <p className="text-xs text-gray-500 mt-1">As of today</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Week Historical Data */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Last Week Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Interviews</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">15</p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">8</p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Pending Feedback</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">5</p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Selected</p>
            <p className="text-2xl font-bold text-green-600 mt-1">7</p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as InterviewStatus | 'all')}
          className="input-field"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="scheduled">Scheduled</option>
          <option value="pending-feedback">Pending Feedback</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {filteredInterviews.map((interview) => (
          <InterviewCard key={interview.id} interview={interview} />
        ))}
      </div>

      {filteredInterviews.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No interviews found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

function InterviewCard({ interview }: { interview: Interview }) {
  const status = statusConfig[interview.interviewStatus];
  const StatusIcon = status.icon;

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <Link
              to={`/resource/${interview.resourceId}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
            >
              {interview.resourceName}
            </Link>
            <span className={`badge ${status.color} flex items-center space-x-1`}>
              <StatusIcon className="w-3 h-3" />
              <span>{status.label}</span>
            </span>
            <span className="badge bg-primary-100 text-primary-700">
              {interview.matchScore}% Match
            </span>
          </div>
          <p className="text-gray-600 mb-1 flex items-center space-x-2">
            <Briefcase className="w-4 h-4" />
            <Link
              to={`/requirement/${interview.requirementId}`}
              className="hover:text-primary-600 underline"
            >
              {interview.requirementTitle}
            </Link>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <div>
            <p className="font-medium text-gray-900">
              {new Date(interview.interviewDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(interview.interviewDate).toLocaleTimeString()}
            </p>
          </div>
        </div>
        {interview.interviewer && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <span>{interview.interviewer}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>
            {interview.interviewStatus === 'scheduled' && new Date(interview.interviewDate) > new Date()
              ? `${Math.ceil((new Date(interview.interviewDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`
              : 'Interview completed'}
          </span>
        </div>
      </div>

      {interview.feedback && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-1">Feedback</p>
          <p className="text-sm text-gray-600">{interview.feedback}</p>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {interview.interviewStatus === 'scheduled' && (
          <>
            <button className="flex-1 btn-primary text-sm py-2">
              Update Status
            </button>
            <button className="flex-1 btn-secondary text-sm py-2">
              Reschedule
            </button>
          </>
        )}
        {interview.interviewStatus === 'pending-feedback' && (
          <>
            <button className="flex-1 btn-primary text-sm py-2">
              Submit Feedback
            </button>
            <Link
              to={`/resource/${interview.resourceId}`}
              className="flex-1 btn-secondary text-sm py-2 text-center"
            >
              View Resource
            </Link>
          </>
        )}
        {['selected', 'rejected'].includes(interview.interviewStatus) && (
          <Link
            to={`/resource/${interview.resourceId}`}
            className="flex-1 btn-secondary text-sm py-2 text-center"
          >
            View Resource
          </Link>
        )}
      </div>
    </div>
  );
}
