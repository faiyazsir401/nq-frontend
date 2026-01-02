# NetQwix Frontend

A comprehensive platform connecting Experts (Trainers) with Enthusiasts (Trainees) for live interactive training sessions, video analysis, and personalized coaching experiences.

## 🚀 Overview

NetQwix is a modern web application that facilitates real-time training sessions between experts and enthusiasts. The platform enables users to book live sessions, upload and review video footage, receive personalized game plans, and connect through an integrated chat and video conferencing system.

## ✨ Key Features

### For Enthusiasts (Trainees)
- **Search & Book Sessions**: Browse expert profiles, read reviews, and book live training sessions
- **Instant Sessions**: Request immediate sessions when experts are online
- **Video Analysis**: Upload game footage for expert review and analysis
- **Live Sessions**: Interactive video conferencing with screen sharing and annotation tools
- **Game Plans**: Receive personalized, printable game plans after each session
- **Locker**: Centralized hub for session recordings, game plans, and uploaded content
- **Flexible Scheduling**: Book sessions that fit your schedule

### For Experts (Trainers)
- **Profile Management**: Build and customize your expert profile
- **Schedule Management**: Set availability and manage bookings
- **Live Session Tools**: Advanced video conferencing with drawing and annotation capabilities
- **Video Review**: Analyze trainee footage in real-time during sessions
- **Game Plan Generation**: Create and share personalized training plans
- **Student Records**: Track and manage trainee progress
- **Payment Processing**: Integrated Stripe payment system

### Platform Features
- **Real-time Chat**: Socket.io-powered messaging system
- **Video Conferencing**: Peer-to-peer video calls with screen sharing
- **Calendar Integration**: FullCalendar for scheduling and availability
- **Notifications**: Push notifications and in-app alerts
- **File Sharing**: Document and media sharing capabilities
- **Community**: Connect with trainers and trainees
- **Responsive Design**: Mobile-first, works on all devices

## 🛠️ Tech Stack

### Core Framework
- **Next.js 13.1.1** - React framework with SSR/SSG
- **React 18.2.0** - UI library
- **Redux Toolkit 1.9.5** - State management
- **TypeScript 5.1.6** - Type safety

### Real-time & Communication
- **Socket.io Client 4.7.0** - WebSocket communication
- **PeerJS 1.5.1** - Peer-to-peer connections
- **Simple Peer 9.11.1** - WebRTC wrapper

### Media & Video
- **FFmpeg 0.12.10** - Video processing
- **React Player 2.15.1** - Video playback
- **Vidstack React 1.10.9** - Advanced video player
- **Fabric.js React 1.2.2** - Canvas drawing and annotation

### UI & Styling
- **SCSS/SASS 1.57.1** - CSS preprocessing
- **Bootstrap SCSS 4.6.1** - CSS framework
- **Reactstrap 9.1.9** - Bootstrap components
- **Framer Motion 12.4.2** - Animation library
- **Styled Components 6.1.8** - CSS-in-JS

### Forms & Validation
- **Formik 2.4.2** - Form management
- **Yup 1.2.0** - Schema validation

### Payments
- **Stripe React 2.1.2** - Payment processing
- **Stripe.js 2.1.0** - Stripe SDK

### Additional Libraries
- **Axios 1.6.5** - HTTP client
- **Moment.js 2.29.4** - Date manipulation
- **Luxon 3.5.0** - Modern date library
- **FullCalendar 6.1.10** - Calendar component
- **React Toastify 8.2.0** - Toast notifications
- **OpenReplay** - Session replay and analytics

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.x or higher)
- **npm** (v7.x or higher) or **yarn**
- **Git**

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nq-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=your_api_url
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY=your_openreplay_key
   NEXT_PUBLIC_SOCKET_URL=your_socket_url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run export` - Export static site

## 📁 Project Structure

```
nq-frontend/
├── app/                    # Application core
│   ├── api/               # API routes
│   ├── common/            # Shared components and utilities
│   ├── components/        # Feature components
│   │   ├── auth/         # Authentication
│   │   ├── bookings/     # Booking management
│   │   ├── calendar/     # Calendar functionality
│   │   ├── trainee/      # Trainee-specific features
│   │   ├── trainer/      # Trainer-specific features
│   │   ├── video/        # Video components
│   │   └── ...
│   ├── hook/             # Custom React hooks
│   └── store.js          # Redux store configuration
├── containers/            # Container components
│   ├── chatBoard/        # Chat interface
│   ├── leftSidebar/      # Left navigation
│   └── rightSidebar/     # Right panel
├── pages/                # Next.js pages
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Main dashboard
│   ├── landing/          # Landing page
│   ├── meeting/          # Meeting room
│   └── messenger/        # Messaging
├── public/               # Static assets
│   ├── assets/           # Images, fonts, styles
│   └── icons/            # Icon files
├── config/               # Configuration files
├── helpers/              # Helper functions
├── utils/                # Utility functions
└── package.json          # Dependencies
```

## 🔐 Authentication

The application supports multiple authentication methods:
- Email/Password authentication
- Google OAuth integration
- JWT token-based sessions

## 🌐 Environment Variables

Required environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY` | OpenReplay project key | No |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL | Yes |

## 🎨 Styling

The project uses SCSS for styling with a modular approach:
- Global styles in `public/assets/scss/`
- Component-specific styles co-located with components
- Bootstrap 4 as the base framework
- Custom theme customization support

## 🔌 API Integration

API calls are managed through:
- **Axios** with custom interceptors (`config/axios-interceptor.js`)
- **Redux Toolkit** for state management
- API slices organized by feature domain

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms
The application can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Custom Node.js server

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Style

- Follow React best practices
- Use functional components with hooks
- Maintain consistent naming conventions
- Write meaningful commit messages
- Add comments for complex logic

## 🐛 Known Issues

- WebRTC connections may require TURN servers for certain network configurations
- FFmpeg processing is resource-intensive; consider server-side processing for production

## 📄 License

This project is proprietary and confidential. All rights reserved.

**Built with ❤️ by the NetQwix Team**
