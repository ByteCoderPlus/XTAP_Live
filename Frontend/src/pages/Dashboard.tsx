import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Briefcase, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { resourceAPI } from '../services/api';
import { mapApiResourcesToResources } from '../services/resourceMapper';
import LoadingSpinner from '../components/LoadingSpinner';

const utilizationData = [
  { month: 'Jan', utilization: 75, bench: 25 },
  { month: 'Feb', utilization: 78, bench: 22 },
  { month: 'Mar', utilization: 82, bench: 18 },
  { month: 'Apr', utilization: 80, bench: 20 },
  { month: 'May', utilization: 85, bench: 15 },
  { month: 'Jun', utilization: 88, bench: 12 },
];

const skillDemandData = [
  { skill: 'React', demand: 45, available: 12 },
  { skill: 'Java', demand: 38, available: 8 },
  { skill: 'Python', demand: 32, available: 15 },
  { skill: 'AWS', demand: 28, available: 10 },
  { skill: 'Node.js', demand: 25, available: 7 },
];

// Removed unused statusDistribution constant

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, atp: 0, deployed: 0, softBlocked: 0 });
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('Dashboard state - loading:', loading, 'resources:', resources.length, 'error:', error, 'stats:', stats);
  }, [loading, resources.length, error, stats]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let resourcesData: any[] = [];
        let statsData: any = null;
        
        try {
          const resourcesResponse = await resourceAPI.getAllResources();
          // Handle paginated response: { data: [...], pagination: {...} }
          if (Array.isArray(resourcesResponse)) {
            resourcesData = resourcesResponse;
          } else if (resourcesResponse && typeof resourcesResponse === 'object' && Array.isArray(resourcesResponse.data)) {
            resourcesData = resourcesResponse.data;
          } else {
            resourcesData = [];
          }
        } catch (err) {
          console.error('Failed to fetch resources:', err);
          resourcesData = [];
        }
        
        try {
          statsData = await resourceAPI.getResourceStatistics();
        } catch (err) {
          console.error('Failed to fetch statistics:', err);
          statsData = null;
        }
        
        if (!isMounted) return;
        
        // Convert to proper format with all fields
        let convertedResources: any[] = [];
        try {
          convertedResources = mapApiResourcesToResources(resourcesData);
        } catch (err) {
          console.error('Error mapping resources:', err);
          convertedResources = [];
        }
        
        setResources(convertedResources);
        setStats({
          total: statsData?.total || convertedResources.length || 0,
          atp: statsData?.atp || (convertedResources.filter((r: any) => r?.status === 'ATP').length || 0),
          deployed: statsData?.deployed || (convertedResources.filter((r: any) => r?.status === 'deployed').length || 0),
          softBlocked: statsData?.softBlocked || (convertedResources.filter((r: any) => r?.status === 'soft-blocked').length || 0),
        });
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        setResources([]);
        setStats({ total: 0, atp: 0, deployed: 0, softBlocked: 0 });
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
  }, []);

  // Calculate all memoized values at the top level (before any conditional returns)
  const statusDistributionData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    resources.forEach((r: any) => {
      if (r && r.status) {
        const status = r.status || 'ATP';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }
    });
    
    if (Object.keys(statusCounts).length === 0) {
      return [{ name: 'No Data', value: 1, color: '#6b7280' }];
    }
    
    const statusMap: Record<string, { name: string; color: string }> = {
      'deployed': { name: 'Deployed', color: '#0ea5e9' },
      'ATP': { name: 'ATP', color: '#10b981' },
      'soft-blocked': { name: 'Soft Blocked', color: '#f59e0b' },
      'notice': { name: 'Notice', color: '#ef4444' },
    };
    
    return Object.entries(statusCounts).map(([status, value]) => ({
      name: statusMap[status]?.name || status,
      value,
      color: statusMap[status]?.color || '#6b7280',
    }));
  }, [resources]);

  const statusDistributionColors = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    resources.forEach((r: any) => {
      if (r && r.status) {
        const status = r.status || 'ATP';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }
    });
    
    const statusMap: Record<string, string> = {
      'deployed': '#0ea5e9',
      'ATP': '#10b981',
      'soft-blocked': '#f59e0b',
      'notice': '#ef4444',
    };
    
    return Object.entries(statusCounts).map(([status, _]) => statusMap[status] || '#6b7280');
  }, [resources]);

  const recentActivities = useMemo(() => {
    if (!Array.isArray(resources) || resources.length === 0) {
      return [];
    }
    
    const activities: Array<{ action: string; time: string; type: string; link: string }> = [];
    
    // Get recent resources (sorted by updatedAt)
    const recentResources = [...resources]
      .filter(r => r && r.updatedAt)
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    recentResources.forEach(resource => {
      if (!resource || !resource.name) return;
      
      const updatedDate = new Date(resource.updatedAt || Date.now());
      const hoursAgo = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60));
      const timeStr = hoursAgo < 24 
        ? `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`
        : `${Math.floor(hoursAgo / 24)} day${Math.floor(hoursAgo / 24) !== 1 ? 's' : ''} ago`;

      if (resource.status === 'deployed') {
        activities.push({
          action: `${resource.name} deployed`,
          time: timeStr,
          type: 'deployment',
          link: `/resource/${resource.employeeId || resource.id}`,
        });
      } else if (Array.isArray(resource.softBlocks) && resource.softBlocks.length > 0) {
        const latestBlock = resource.softBlocks[resource.softBlocks.length - 1];
        if (latestBlock && latestBlock.endDate) {
          activities.push({
            action: `${resource.name} soft blocked until ${new Date(latestBlock.endDate).toLocaleDateString()}`,
            time: timeStr,
            type: 'softblock',
            link: `/soft-blocks`,
          });
        }
      } else if (resource.status === 'ATP') {
        activities.push({
          action: `${resource.name} available (ATP)`,
          time: timeStr,
          type: 'atp',
          link: `/resource/${resource.employeeId || resource.id}`,
        });
      }
    });

    return activities.slice(0, 4);
  }, [resources]);

  // Always render something, even if loading or error
  const utilizationRate = stats && stats.total > 0 
    ? Math.round((stats.deployed / stats.total) * 100) 
    : 0;
  const atpPercentage = stats && stats.total > 0 
    ? Math.round((stats.atp / stats.total) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bench Utilization</h1>
          <p className="text-gray-600 mt-1">Real-time insights into resource utilization and trends</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Ensure we always return valid JSX
  return (
    <div className="space-y-6">
      {/* Header - Always visible */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bench Utilization</h1>
        <p className="text-gray-600 mt-1">Real-time insights into resource utilization and trends</p>
      </div>

      {error && (
        <div className="card bg-yellow-50 border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            ⚠️ {error}. Showing available data.
          </p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Utilization</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">{utilizationRate}%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Real-time data
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Resources</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">Across all locations</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <Link to="/bench" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ATP Resources</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.atp}</p>
              <p className="text-xs text-gray-500 mt-1">{atpPercentage}% of total</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Soft Blocked</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.softBlocked}</p>
              <p className="text-xs text-gray-500 mt-1">resources</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Client Requirements Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Requirements</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link to="/requirements" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <p className="text-sm text-gray-600 mb-1">Total Requirements</p>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </Link>
          <Link to="/requirements?status=open" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
            <p className="text-sm text-gray-600 mb-1">Open Positions</p>
            <p className="text-2xl font-bold text-green-600">-</p>
          </Link>
          <Link to="/requirements?status=filled" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
            <p className="text-sm text-gray-600 mb-1">Closed Positions</p>
            <p className="text-2xl font-bold text-blue-600">-</p>
          </Link>
          <Link to="/requirements?priority=urgent" className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
            <p className="text-sm text-gray-600 mb-1">Priority / Urgent</p>
            <p className="text-2xl font-bold text-red-600">-</p>
          </Link>
          <Link to="/requirements?status=cancelled" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <p className="text-sm text-gray-600 mb-1">Obsolete Positions</p>
            <p className="text-2xl font-bold text-gray-600">-</p>
          </Link>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilization Trend</h3>
          {utilizationData && utilizationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="utilization" stroke="#0ea5e9" strokeWidth={2} name="Utilization %" />
                <Line type="monotone" dataKey="bench" stroke="#ef4444" strokeWidth={2} name="Bench %" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No utilization data available</p>
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Status Distribution</h3>
          {resources.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistributionColors.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No resource data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Resources by Skillset Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources by Skillset</h3>
        {resources.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={(() => {
              const skillCounts: Record<string, number> = {};
              resources.forEach((resource: any) => {
                if (resource && Array.isArray(resource.skills)) {
                  resource.skills.forEach((skill: any) => {
                    if (skill && skill.type === 'primary' && skill.name) {
                      skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
                    }
                  });
                }
              });
              const skillData = Object.entries(skillCounts)
                .map(([skill, count]) => ({ skill, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
              return skillData.length > 0 ? skillData : [{ skill: 'No data', count: 0 }];
            })()} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="skill" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" name="Resources" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No resource data available</p>
          </div>
        )}
      </div>

      {/* Skill Demand vs Availability */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Demand vs Availability</h3>
        {skillDemandData && skillDemandData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={skillDemandData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="skill" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="demand" fill="#0ea5e9" name="Demand" />
              <Bar dataKey="available" fill="#10b981" name="Available" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No skill demand data available</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivities.map((activity, idx) => (
            <Link
              key={idx}
              to={activity.link}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'deployment' ? 'bg-green-500' :
                  activity.type === 'requirement' ? 'bg-blue-500' :
                  activity.type === 'softblock' ? 'bg-yellow-500' : 'bg-orange-500'
                }`} />
                <span className="text-sm text-gray-700">{activity.action}</span>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </Link>
          ))}
          {resources.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
