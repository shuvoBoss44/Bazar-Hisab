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

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
          {/* Navbar spans full width */}
          <Navbar className="w-full" />
          {/* Main content area spans full width */}
          <main className="flex-grow py-12 pt-20 w-full">
            {/* Remove mx-auto and padding classes, use full width */}
            <div className="w-full">
              <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/shopping-details" element={<ShoppingDetails />} />
                <Route
                  path="/upload-transaction"
                  element={<UploadTransaction />}
                />
                <Route
                  path="/edit-transaction/:id"
                  element={<EditTransaction />}
                />
                <Route path="/" element={<ShoppingDetails />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              {/* Footer spans full width */}
              <Footer className="w-full" />
            </div>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
