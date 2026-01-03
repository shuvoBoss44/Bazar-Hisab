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
import NotFound from "./components/NotFound";
import "./index.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen relative">
          <div className="bg-mesh"></div>
          <Navbar />
          <main className="flex-grow pt-20 w-full relative z-10 page-enter">
            <Routes>
              <Route path="/" element={<ShoppingDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/upload-transaction" element={<UploadTransaction />} />
              <Route path="/edit-transaction/:id" element={<EditTransaction />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
