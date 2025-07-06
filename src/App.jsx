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
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
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
            <Footer />
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
