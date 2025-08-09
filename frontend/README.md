# Solar Capital Frontend

A modern React frontend for the Solar Capital investment platform, built with TypeScript, Tailwind CSS, and React Router.

## Features

- **Authentication System**: Registration, login, and OTP verification
- **Project Management**: Browse and subscribe to solar energy projects
- **Wallet Management**: Add funds, withdraw, and track transactions
- **KYC Verification**: Document upload and verification system
- **Dashboard**: Overview of investments, earnings, and portfolio
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Clean and intuitive user interface

## Tech Stack

- **React 18** with TypeScript
- **React Router v6** for navigation
- **Tailwind CSS** for styling
- **React Hook Form** for form handling
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with sidebar
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── Dashboard.tsx   # Dashboard page
│   ├── Login.tsx       # Login page
│   ├── Projects.tsx    # Projects page
│   ├── Profile.tsx     # Profile page
│   ├── Register.tsx    # Registration page
│   └── Wallet.tsx      # Wallet page
├── services/           # API services
│   └── api.ts         # API client and endpoints
├── types/              # TypeScript type definitions
│   └── index.ts       # Type interfaces
├── App.tsx            # Main app component
├── index.tsx          # App entry point
└── index.css          # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:8080`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

## API Integration

The frontend integrates with the Solar Capital backend API. Make sure your backend is running on `http://localhost:8080` or update the API base URL in `src/services/api.ts`.

### Available Endpoints

- **Authentication**: `/auth/*`
- **Projects**: `/api/projects/*`
- **Subscriptions**: `/api/subscriptions/*`
- **Wallet**: `/api/wallet/*`
- **Withdrawals**: `/api/withdrawal/*`
- **KYC**: `/api/kyc/*`
- **Energy**: `/api/energy/*`
- **Engagement**: `/api/engagement/*`

## Key Features

### Authentication
- User registration with email verification
- Login with JWT token management
- OTP verification system
- Protected routes

### Project Management
- Browse active solar projects
- View project details and pricing
- Subscribe to projects with payment integration
- Track subscription status

### Wallet System
- View account balance and earnings
- Add funds to wallet
- Request withdrawals
- Transaction history

### KYC Verification
- Document upload (Aadhar, PAN, Passport, etc.)
- KYC status tracking
- Admin approval workflow

### Dashboard
- Portfolio overview
- Recent activity
- Quick actions
- Performance metrics

## Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8080
```

## Development

### Code Style
- Use TypeScript for type safety
- Follow React functional component patterns
- Use Tailwind CSS for styling
- Implement proper error handling

### State Management
- React Context for global state (auth)
- Local state for component-specific data
- API calls with proper loading states

### Error Handling
- Toast notifications for user feedback
- Proper error boundaries
- API error handling with user-friendly messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository. 