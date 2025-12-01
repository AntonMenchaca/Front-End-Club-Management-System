# Front-End-Club-Management-System

A modern Next.js 14 application built with TypeScript and Ant Design for managing university clubs, members, events, budgets, and requests. 
## Features

- **Dashboard** - Overview of club statistics, recent activities, and key metrics
- **Club Management** - Browse, create, and manage clubs with approval workflow
- **Member Management** - Add, edit, and manage club members with search and filtering
- **Event Management** - Create and track club events with attendance management
- **Budget Management** - View and manage club budgets and expenditures
- **Request Management** - Handle club creation requests and membership requests
- **Profile Management** - User profile viewing and editing
- **Settings** - Configure application preferences
- **Modern UI** - Built with Ant Design 5 components for a professional look
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Fast Performance** - Next.js 14 with App Router for optimal performance
- **Type Safety** - Full TypeScript support for better developer experience

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Ant Design 5** - Comprehensive UI component library
- **Axios** - HTTP client for API requests
- **Day.js** - Lightweight date handling library
- **React 18** - UI library

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see Backend README for setup)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/AntonMenchaca/Front-End-Club-Management-System.git
```

2. Install dependencies:
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

**Note**: The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser.

### 4. Run the Application

Start the development server:

```bash
npm run dev
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Runs the app in development mode with hot reload
- `npm run build` - Builds the app for production
- `npm start` - Runs the production build
- `npm run lint` - Runs ESLint to check code quality


## Features Overview

### Dashboard

- View club statistics at a glance with interactive cards
- Monitor recent activities in a table view
- Track growth metrics and key performance indicators
- Quick access to pending requests and approvals

### Clubs

- Browse all available clubs with search and filtering
- Create new club requests
- View club details including members, events, and budgets
- Manage club information (for club leaders and admins)
- Approve or reject club creation requests (for faculty and admins)

### Members

- Complete member directory with search and filter capabilities
- Add new members with form validation
- Edit and delete member records
- View member profiles and club memberships
- Status tracking (active/inactive)

### Events

- Event listing with visual status indicators
- Create new events with detailed information
- Track event status (upcoming, ongoing, completed)
- View event details including date, location, and attendees
- Manage event guests

### Requests

- View all pending requests (club creation, membership)
- Approve or reject requests based on role
- Filter requests by type and status
- Track request history

### Profile

- View and edit user profile information
- Update personal details and preferences
- View club memberships and roles

### Settings

- Configure application preferences
- Manage notification settings
- Update user account information

## API Integration

The application integrates with the backend API through a centralized API client configured in `lib/api.ts`. The axios instance includes:

- Automatic authentication token handling from localStorage
- Request interceptors to attach JWT tokens
- Response interceptors for error handling
- Automatic redirects on authentication failures
- Base URL configuration from environment variables

### API Configuration

Configure the API base URL using the `NEXT_PUBLIC_API_BASE_URL` environment variable in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Authentication Flow

1. User logs in through `/login` page
2. JWT token is stored in localStorage
3. Token is automatically attached to all API requests
4. On token expiration or invalid token, user is redirected to login
5. Token can be refreshed using the refresh endpoint

## Role-Based Access Control

The frontend implements role-based access control (RBAC) with the following roles:

- **Admin** - Full access to all features and administrative functions
- **Faculty** - Can approve club creation requests and budget expenditures
- **Student** - Can create clubs, manage events, and join clubs
- **Club Leader** - Can manage their specific clubs
- **Club Member** - Can view club information and join events

Permissions are checked using utilities in `lib/permissions.ts` and `lib/rbac.ts` to conditionally render UI elements and restrict access to certain pages.

## Customization

### Theme

The app uses Ant Design's ConfigProvider for theming. Customize the theme in `app/layout.tsx`:

```typescript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff', // Change primary color
      borderRadius: 6,          // Change border radius
    },
  }}
>
```

### Routes

Next.js 14 uses the App Router with file-system based routing. Add new pages by creating folders in the `app/(main)` directory:

- Create a new folder: `app/(main)/new-page/`
- Add a `page.tsx` file inside the folder
- The route will be available at `/new-page`

### Styling

Global styles are defined in `app/globals.css`. Component-specific styles can be added using CSS modules or inline styles with Ant Design's styling system.

## Development

### Development Mode

Run the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000` and will automatically reload when you make changes.

### TypeScript

The project uses TypeScript for type safety. Type definitions are centralized in `lib/types.ts`. When adding new API endpoints or data structures, update the types accordingly.

### Code Quality

Run ESLint to check for code quality issues:

```bash
npm run lint
```


### Environment Variables

Make sure to set the following environment variables in your deployment platform:

- `NEXT_PUBLIC_API_BASE_URL` - Your backend API URL (e.g., `https://api.example.com/api`)

## Browser Support

The application supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API Connection Issues

If you're experiencing API connection issues:

1. Verify the backend API is running
2. Check that `NEXT_PUBLIC_API_BASE_URL` is correctly set
3. Ensure CORS is properly configured on the backend
4. Check browser console for error messages

### Authentication Issues

If authentication is not working:

1. Verify JWT tokens are being stored in localStorage
2. Check that tokens are being sent in request headers
3. Ensure the backend JWT_SECRET matches
4. Clear localStorage and try logging in again

### Build Errors

If you encounter build errors:

1. Run `npm install` to ensure all dependencies are installed
2. Check TypeScript errors: `npm run lint`
3. Verify all environment variables are set
4. Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.


## Acknowledgments

- Built with Next.js 14 App Router for optimal performance
- Uses Ant Design for a professional and consistent UI
- Fully integrated with the Club Management System backend API
