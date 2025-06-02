# Notes App - Full Stack Application

### 📝 Overview

Notes App is a full-stack application for creating and managing notes in bullet point or checklist format. It features a modern, responsive UI with dark mode support, user authentication, and real-time updates.

### ✨ Features

- **📋 Note Management**: Create, read, update, and delete notes
- **📝 Multiple Note Types**: Support for bullet points and checklists
- **🔒 User Authentication**: Secure login and registration with Clerk
- **🌓 Dark Mode**: Elegant theme switching with smooth transitions
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **⚡ Real-time Updates**: Instant UI updates when notes are modified
- **🔍 Search & Filter**: Find notes quickly (coming soon)
- **🏷️ Categories**: Organize notes by categories (coming soon)


## 🛠️ Tech Stack

### Frontend

- **React**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Clerk**: Authentication
- **React Router**: Navigation
- **Lucide React**: Icons
- **shadcn/ui**: UI components


### Backend

- **Node.js**: Runtime
- **Express**: Web framework
- **TypeScript**: Type safety
- **MongoDB**: Database
- **Mongoose**: ODM
- **Clerk**: Authentication
- **Cors**: Cross-origin resource sharing


## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (local or Atlas)
- Clerk account for authentication


### Environment Setup

1. **Clone the repository**


```shellscript
git clone https://github.com/yourusername/notes-app.git
cd notes-app
```

2. **Set up environment variables**


Create `.env` files in both frontend and backend directories:

**Frontend (.env)**

```plaintext
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
VITE_API_URL=http://localhost:5000/api
```

**Backend (.env)**

```plaintext
MONGODB_URI=mongodb://localhost:27017/notes-app
PORT=5000
NODE_ENV=development
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

### Installation

#### Backend Setup

```shellscript
cd backend
npm install
```

#### Frontend Setup

```shellscript
cd frontend
npm install
```

### Running the Application

#### Development Mode

**Backend**

```shellscript
cd backend
npm run dev
```

**Frontend**

```shellscript
cd frontend
npm run dev
```

#### Production Mode

**Backend**

```shellscript
cd backend
npm run build
npm start
```

**Frontend**

```shellscript
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

### Frontend Structure

```plaintext
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (theme, auth)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   ├── services/       # API service functions
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── .env                # Environment variables
├── .env.example        # Example environment variables
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

### Backend Structure

```plaintext
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── types/          # TypeScript type definitions
│   └── server.ts       # Entry point
├── .env                # Environment variables
├── .env.example        # Example environment variables
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## 📡 API Endpoints

### Notes API

| Method | Endpoint | Description | Auth Required
|-----|-----|-----|-----
| GET | /api/notes | Get all user notes | Yes
| POST | /api/notes | Create a new note | Yes
| PUT | /api/notes/:id | Update a note | Yes
| DELETE | /api/notes/:id | Delete a note | Yes


## 🔐 Authentication

This application uses [Clerk](https://clerk.dev/) for authentication. To set up authentication:

1. Create a Clerk account
2. Create a new application in Clerk dashboard
3. Get your API keys (Publishable Key and Secret Key)
4. Add them to your environment variables


### Authentication Flow

1. Users sign up or sign in through Clerk's UI
2. Clerk provides a JWT token
3. Frontend includes this token in API requests
4. Backend verifies the token using Clerk's SDK
5. User ID is extracted from the token for data operations


## 🔄 State Management

- **Frontend**: React's Context API and local component state
- **Backend**: MongoDB for persistent storage


## 🎨 Styling

The application uses Tailwind CSS with custom components from shadcn/ui. The theme system supports:

- Light and dark modes
- System preference detection
- User preference persistence
- Smooth transitions between themes


## 📱 Responsive Design

The UI is fully responsive and works on:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)


## 🚢 Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy the frontend


### Backend Deployment (Railway/Heroku)

1. Connect your GitHub repository to Railway or Heroku
2. Set environment variables in the platform dashboard
3. Deploy the backend


### MongoDB Deployment

1. Create a MongoDB Atlas account
2. Set up a new cluster
3. Configure network access and database users
4. Get your connection string and add it to backend environment variables


## 🧪 Testing

### Running Tests

**Backend**

```shellscript
cd backend
npm test
```

**Frontend**

```shellscript
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Clerk](https://clerk.dev/)
- [Lucide Icons](https://lucide.dev/)

---
