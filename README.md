# LeadRecall Connect

LeadRecall Connect is a web application designed to help attendees and exhibitors manage leads, connections, and events efficiently. Built with React, TypeScript, and Vite, it provides a seamless experience for networking at events through features like QR code scanning, contact management, and event scheduling.

## Features

- **User Roles**: Support for attendees and exhibitors with tailored functionalities.
- **Event Management**: Create, view, and manage events.
- **Contact Management**: Add and organize contacts from events.
- **QR/OCR Scanning**: Scan QR codes or use OCR to quickly add contacts.
- **Calendar Integration**: View and manage event schedules.
- **Weather Information**: Real-time weather data for event locations.
- **Dashboard**: Personalized dashboard for users to access all features.
- **Authentication**: Secure login and registration system.

## App Workflow

1. **Landing Page**: Users start at the landing page, which introduces the app and provides options to register or log in.

2. **Registration**:
   - Choose role: Attendee or Exhibitor.
   - Fill out registration form specific to the role.
   - Upon successful registration, users are redirected to the login page.

3. **Login**:
   - Enter credentials to authenticate.
   - Successful login redirects to the dashboard.

4. **Dashboard**:
   - **Home**: Overview of recent activities, upcoming events, and quick stats.
   - **Events**: Browse and manage events. View event details, add new events.
   - **Calendar**: Integrated calendar view for scheduling and event reminders.
   - **Profile**: Manage personal information and settings.
   - **Add Entry**: Use the floating action button to add contacts, events, or scan QR/OCR.
     - Add Contact: Manually enter contact details.
     - Add Event: Create new events.
     - Scan QR: Use device camera to scan QR codes for quick contact addition.
     - Scan OCR: Extract text from images to add contacts.

5. **Additional Features**:
   - **Entry Details**: View and edit individual entries.
   - **Event Details**: Detailed view of events, including associated contacts.
   - **Weather Information**: Click the Weather button on event details to view current weather, forecast, and historical data for the event location.
   - **Offline Support**: PWA features for offline access.

## Technologies Used

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Build Tool**: Vite
- **Testing**: Vitest
- **Linting**: ESLint
- **Package Manager**: npm or Bun (based on lockfile)

## Installation

1. Clone the repository:
   ```sh
   git clone <YOUR_GIT_URL>
   cd leadrecall-connect
   ```

2. Install dependencies:
   ```sh
   npm install
   # or
   bun install
   ```

4. Start the development server:
   ```sh
   npm run dev
   # or
   bun run dev
   ```

5  VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```sh
   npm run dev
   # or
   bun run dev
   ```

5. Build for production:
   ```sh
   npm run build
   # or
   bun run build
   ```

6. Preview production build:
   ```sh
   npm run preview
   # or
   bun run preview
   ```

## Usage

- Access the app at `http://localhost:5173` (default Vite port).
- Register as a new user or log in with existing credentials.
- Navigate through the dashboard to manage events and contacts.
- Use the add entry FAB for quick actions like scanning QR codes.

## Deployment

The app can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages. Build the project and upload the `dist` folder.


## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make changes and commit.
4. Push to your fork and create a pull request.

## License

This project is licensed under the MIT License.
