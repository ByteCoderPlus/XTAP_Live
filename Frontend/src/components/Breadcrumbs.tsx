import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export default function Breadcrumbs({ items }: { items?: BreadcrumbItem[] }) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from path if not provided
  const breadcrumbs: BreadcrumbItem[] = items || (() => {
    const paths = location.pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/bench' }];
    
    const pathMap: Record<string, string> = {
      'bench': 'Bench Directory',
      'resource': 'Resource Details',
      'requirements': 'Requirements',
      'requirement': 'Requirement Details',
      'matching': 'AI Matching',
      'interviews': 'Interviews',
      'soft-blocks': 'Soft Blocks',
      'dashboard': 'Dashboard',
      'weekly-atp': 'Weekly ATP',
    };
    
    paths.forEach((path, index) => {
      const label = pathMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
      const isLast = index === paths.length - 1;
      crumbs.push({
        label,
        path: isLast ? undefined : `/${paths.slice(0, index + 1).join('/')}`,
      });
    });
    
    return crumbs;
  })();

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={index} className="flex items-center space-x-2">
            {index === 0 ? (
              <Link
                to={crumb.path || '#'}
                className="hover:text-primary-600 transition-colors"
              >
                <Home className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                {isLast || !crumb.path ? (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="hover:text-primary-600 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}
