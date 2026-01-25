# FeaturePulse Frontend

A modern React frontend for the FeaturePulse AI-powered PR analysis platform.

## Features

- **Homepage**: Hero section with overview and call-to-action
- **Features Page**: Detailed feature showcase with interactive tabs
- **GitHub Callback**: OAuth integration and authentication flow
- **Security Center**: API key and webhook management
- **Documentation**: Comprehensive API docs and guides

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd FeaturePulse-master/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   └── Navbar.jsx          # Main navigation component
├── pages/
│   ├── Homepage.jsx        # Landing page
│   ├── Features.jsx        # Features showcase
│   ├── GitHubCallback.jsx  # OAuth callback handler
│   ├── SecurityCenter.jsx  # Security settings
│   └── Documentation.jsx   # API documentation
├── services/
│   └── api.js              # API service layer
├── utils/
│   └── cn.js               # Utility function for className merging
├── App.jsx                 # Main app component with routing
├── main.jsx                # App entry point
└── index.css               # Global styles and Tailwind
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend connects to the backend API through the `apiService` in `src/services/api.js`. 

### Backend Integration Points

1. **GitHub OAuth**: `/api/auth/github` and `/api/auth/github/callback`
2. **PR Analysis**: `/api/analysis/:owner/:repo/:prNumber`
3. **Security**: `/api/security/keys` and `/api/webhooks`
4. **Dashboard**: `/api/dashboard/stats` and `/api/dashboard/analyses`

### Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)

## Styling

The project uses Tailwind CSS with custom utility classes defined in `index.css`:

- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style  
- `.card` - Card container style
- `.gradient-text` - Gradient text effect

## Contributing

1. Follow the existing code style
2. Use meaningful component and variable names
3. Add comments for complex logic
4. Test your changes before submitting

## License

MIT License - see LICENSE file for details
