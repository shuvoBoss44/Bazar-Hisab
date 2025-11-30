import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import Profile from "./components/Profile";
import ShoppingDetails from "./components/ShoppingDetails";
import UploadTransaction from "./components/UploadTransaction";
import EditTransaction from "./components/EditTransaction";
import "./index.css";
import Footer from "./components/Footer";

// Assuming ProtectedRoute and user context are defined elsewhere or will be added.
// For the purpose of this edit, we'll just incorporate them as they appear in the instruction.
// Placeholder for ProtectedRoute and user for compilation, if not defined elsewhere.
const ProtectedRoute = ({ children }) => {
  // In a real app, this would check authentication status
  const user = true; // Placeholder
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};
const user = true; // Placeholder for user state

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen text-neutral-100 font-sans selection:bg-primary-500/30 selection:text-primary-200">
          <Navbar />
          <main className="flex-grow py-8 pt-24 w-full">
            <div className="container-fluid">
              <Routes>
                <Route
                  path="/"
                  element={
                    user ? <Navigate to="/shopping-details" /> : <Navigate to="/login" />
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/shopping-details"
                  element={
                    <ProtectedRoute>
                      <ShoppingDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upload-transaction"
                  element={
                    <ProtectedRoute>
                      <UploadTransaction />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-transaction/:id"
                  element={
                    <ProtectedRoute>
                      <EditTransaction />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
