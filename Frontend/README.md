# Bench Talent (ATP) Deployment Optimizer

An AI-driven Bench Talent Deployment Optimizer built with React and TypeScript. This application centralizes bench data, automates resource-role matching, predicts upcoming demands, and provides actionable recommendations for effective talent deployment.

## Features

### Core Functionality

- **Bench Resource Directory**: Unified view of all ATP resources with advanced filtering
- **Requirement Management**: Create and manage open role requirements
- **AI-Powered Matching**: Smart resource-role recommendations based on skills, experience, and availability
- **Interview Workflow Tracking**: Track interview statuses and outcomes
- **Soft Block Management**: Prevent double booking and manage resource reservations
- **Utilization Dashboard**: Real-time insights into resource utilization and trends
- **Weekly ATP Summary**: Automated reports for governance meetings

### Key Capabilities

- Real-time visibility into bench resources
- Multi-criteria resource-role matching
- Skill gap analysis and upskilling recommendations
- Soft block management with conflict warnings
- Interview workflow tracking
- Predictive forecasting for demand and availability
- Comprehensive dashboards and analytics

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   └── Layout.tsx   # Main layout with navigation
├── pages/           # Page components
│   ├── BenchDirectory.tsx
│   ├── Requirements.tsx
│   ├── Matching.tsx
│   ├── InterviewTracker.tsx
│   ├── SoftBlockManager.tsx
│   ├── Dashboard.tsx
│   └── WeeklyATP.tsx
├── types/           # TypeScript type definitions
│   └── index.ts
├── data/            # Mock data
│   └── mockData.ts
├── App.tsx          # Main app component with routing
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Pages Overview

### Bench Directory
- View all ATP resources
- Filter by status, location, skills
- Search functionality
- Resource cards with key information

### Requirements
- Create and manage open positions
- Track requirement status
- View skill requirements

### Matching
- AI-powered resource-role matching
- Match score visualization
- Skill gap analysis
- Upskilling recommendations

### Interview Tracker
- Track interview statuses
- Schedule and manage interviews
- Submit feedback
- View interview history

### Soft Block Manager
- Create and manage soft blocks
- View active and expired blocks
- Prevent double booking

### Dashboard
- Utilization trends
- Status distribution
- Skill demand heatmap
- Recent activity

### Weekly ATP
- Weekly summary report
- ATP by skill and location
- Detailed resource list
- Action items

## Customization

### Styling
The application uses Tailwind CSS. Customize colors and styles in `tailwind.config.js`.

### Mock Data
Update `src/data/mockData.ts` to modify sample data or connect to your backend API.

### Routing
Add new routes in `src/App.tsx`.

## Future Enhancements

- Backend API integration
- Real-time notifications
- Advanced analytics
- Export functionality
- User authentication
- Role-based access control
- Mobile app

## License

This project is proprietary software.

## Support

For questions or issues, please contact the development team.
