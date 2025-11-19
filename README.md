# Front-End-Club-Management-System

A Next.js 14 application with TypeScript and Ant Design for managing club members, events, and activities. Built with the App Router for optimal performance and user experience.

## Features

-  **Dashboard**: Overview of club statistics and recent activities
-  **Member Management**: Add, edit, and manage club members
-  **Event Management**: Create and track club events
-  **Settings**: Configure club information and preferences
-  **Modern UI**: Built with Ant Design 5 components
-  **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
-  **Fast**: Next.js 14 with App Router for optimal performance
-  **SEO Friendly**: Server-side rendering for better search engine optimization

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Ant Design 5** - Comprehensive UI component library
- **Axios** - HTTP client for API requests
- **Day.js** - Lightweight date handling library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AntonMenchaca/Front-End-Club-Management-System.git
cd club-management-system-front-end
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

4. Update the `.env.local` file with your API endpoint:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm start` - Runs the production build
- `npm run lint` - Runs ESLint to check code quality

## Project Structure

```
app/
├── (main)/             # Main layout group
│   ├── dashboard/      # Dashboard page
│   ├── members/        # Members management page
│   ├── events/         # Events management page
│   ├── settings/       # Settings page
│   └── layout.tsx      # Main layout with sidebar
├── layout.tsx          # Root layout with providers
├── page.tsx            # Home page (redirects to dashboard)
└── globals.css         # Global styles
lib/
├── api.ts              # API client configuration
└── types.ts            # TypeScript type definitions
public/                 # Static assets
```

## Features Overview

### Dashboard
- View club statistics at a glance with interactive cards
- Monitor recent activities in a table view
- Track growth metrics and key performance indicators

### Members
- Complete member directory with search and filter
- Add new members with form validation
- Edit and delete member records
- Status tracking (active/inactive)

### Events
- Event cards with visual status indicators
- Create new events with detailed information
- Track event status (upcoming, ongoing, completed)
- View event details including date, location, and attendees

### Settings
- Configure club information and contact details
- Manage notification preferences (email/SMS)
- Control membership settings and auto-approval

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
Next.js 14 uses the App Router with file-system based routing. Add new pages by creating folders in the `app/(main)` directory.

## API Integration

The app is configured to work with a backend API. The axios instance in `lib/api.ts` includes:

- Automatic authentication token handling
- Request/response interceptors
- Error handling and redirects

Configure the API base URL using the `NEXT_PUBLIC_API_BASE_URL` environment variable.

## Deployment

### Vercel (Recommended)

The easiest way to deploy is with [Vercel](https://vercel.com):

```bash
npm install -g vercel
vercel
```

### Other Platforms

Build the production-ready application:

```bash
npm run build
npm start
```

The built application will be in the `.next` folder.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.


Project Link: [https://github.com/AntonMenchaca/Front-End-Club-Management-System](https://github.com/AntonMenchaca/Front-End-Club-Management-System)

## Features

-  **Dashboard**: Overview of club statistics and recent activities
-  **Member Management**: Add, edit, and manage club members
-  **Event Management**: Create and track club events
-  **Settings**: Configure club information and preferences
-  **Modern UI**: Built with Ant Design components
-  **Responsive**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Ant Design 5** - UI component library
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **Day.js** - Date handling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AntonMenchaca/Front-End-Club-Management-System.git
cd club-management-system-front-end
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API endpoint:
```
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

### Running the Application

Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)


## Features Overview

### Dashboard
- View club statistics at a glance
- Monitor recent activities
- Track growth metrics

### Members
- Complete member directory
- Add new members with form validation
- Edit and delete member records
- Search and filter functionality

### Events
- Event calendar and listing
- Create new events
- Track event status (upcoming, ongoing, completed)
- View event details and attendees

### Settings
- Configure club information
- Manage notification preferences
- Control membership settings

## Customization

### Theme
The app uses Ant Design's ConfigProvider for theming. You can customize the theme in `src/index.tsx`:

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

## API Integration

The app is set up to work with a backend API. Configure the API base URL in your `.env` file. The axios instance in `src/services/api.ts` includes:

- Automatic authentication token handling
- Request/response interceptors
- Error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.



Project Link: [https://github.com/AntonMenchaca/Front-End-Club-Management-System](https://github.com/AntonMenchaca/Front-End-Club-Management-System)
