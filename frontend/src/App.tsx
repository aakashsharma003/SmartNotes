import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import NoteEditor from "@/pages/NoteEditor";
import AuthPage from "@/pages/AuthPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <AuthPage />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/note/:id"
            element={
              <SignedIn>
                <NoteEditor />
              </SignedIn>
            }
          />
          <Route
            path="/dashboard"
            element={
              <SignedIn>
                <Dashboard />
              </SignedIn>
            }
          />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
