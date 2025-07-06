import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

// Existing useUsers hook (no changes needed for UI/UX)
function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/users", {
          withCredentials: true,
        });
        const validUsers = response.data.data.map(user => ({
          ...user,
          _id: user.id,
        }));
        setUsers(validUsers);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch users");
        if (err.response?.status === 401) {
          setError("Session expired. Redirecting to login...");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return { users, loading, error };
}

function UploadTransaction() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { users, loading: usersLoading, error: usersError } = useUsers();
  const [items, setItems] = useState([{ itemName: "", price: "" }]);
  const [sharedUserIds, setSharedUserIds] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || usersLoading) return;
    if (!user) {
      setError("Please log in to create a transaction");
      setTimeout(() => navigate("/login"), 2000);
    }
    if (usersError) {
      setError(usersError);
      if (usersError.includes("Redirecting")) {
        setTimeout(() => navigate("/login"), 2000);
      }
    }
  }, [authLoading, user, usersLoading, usersError, navigate]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === "price" ? value : value.trim();
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { itemName: "", price: "" }]);

  const removeItem = index =>
    items.length > 1 && setItems(items.filter((_, i) => i !== index));

  const handleUserToggle = userId =>
    setSharedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (
      !items.every(item => item.itemName.trim() && parseFloat(item.price) > 0)
    ) {
      setError("All items must have a valid name and positive price.");
      return;
    }
    if (sharedUserIds.length === 0) {
      setError("Please select at least one user to share the cost.");
      return;
    }

    try {
      setLoading(true);
      // Removed the extra axios.get to fetch createdUser as `user` from AuthContext should already have this info
      // If `user` in AuthContext doesn't have the ID, you might need to adjust AuthContext or your backend.
      // For now, assuming `user.id` is available from AuthContext.
      if (!user || !user.id) {
        setError("User information not available. Please log in again.");
        setLoading(false);
        return;
      }

      const payload = {
        items: items.map(item => ({
          itemName: item.itemName,
          price: parseFloat(item.price),
        })),
        sharedUserIds,
        createdBy: user.id, // Using user.id from AuthContext
      };
      await axios.post("http://localhost:8000/api/transactions", payload, {
        withCredentials: true,
      });
      setSuccess("Transaction created successfully!");
      setItems([{ itemName: "", price: "" }]);
      setSharedUserIds([]);
      setTimeout(() => navigate("/shopping-details"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-20">
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 md:p-10 max-w-2xl w-full border border-gray-200">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-primary mb-8 text-center">
          Create New Transaction
        </h2>
        {error && (
          <div
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-center space-x-3 animate-fade-in"
            role="alert"
          >
            <svg
              className="w-6 h-6 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586l-1.293-1.293z"
                clipRule="evenodd"
              ></path>
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div
            className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md flex items-center space-x-3 animate-fade-in"
            role="alert"
          >
            <svg
              className="w-6 h-6 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              ></path>
            </svg>
            <p className="font-medium">{success}</p>
          </div>
        )}
        <div className="space-y-8">
          {/* Items Section */}
          <section className="space-y-5">
            <h3 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">
              Items Details
            </h3>
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-4 items-end"
              >
                <div className="flex-1 w-full">
                  <label htmlFor={`itemName-${index}`} className="sr-only">
                    Item Name
                  </label>
                  <input
                    id={`itemName-${index}`}
                    type="text"
                    placeholder="Item Name"
                    value={item.itemName}
                    onChange={e =>
                      handleItemChange(index, "itemName", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <label htmlFor={`itemPrice-${index}`} className="sr-only">
                    Price (tk)
                  </label>
                  <input
                    id={`itemPrice-${index}`}
                    type="number"
                    placeholder="Price (tk)"
                    value={item.price}
                    onChange={e =>
                      handleItemChange(index, "price", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                    min="0"
                    step="0.01"
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="w-full sm:w-auto bg-red-500 text-white px-5 py-3 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
                    aria-label={`Remove item ${index + 1}`}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-primary hover:text-blue-700 font-medium text-base sm:text-lg transition duration-200 flex items-center gap-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Add Another Item
            </button>
          </section>

          {/* Share With Section */}
          <section className="space-y-5">
            <h3 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">
              Share With
            </h3>
            {usersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            ) : usersError ? (
              <p className="text-red-600 text-center py-4">{usersError}</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No users available to share with.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {users.map(user => (
                  <label
                    key={user._id}
                    htmlFor={`user-${user._id}`}
                    className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 border border-gray-200"
                  >
                    <input
                      id={`user-${user._id}`}
                      type="checkbox"
                      checked={sharedUserIds.includes(user._id)}
                      onChange={() => handleUserToggle(user._id)}
                      className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary focus:ring-offset-0 transition duration-150"
                    />
                    <span className="ml-3 text-gray-700 font-medium truncate">
                      {user.name}{" "}
                      <span className="text-sm text-gray-500">
                        ({user.balance?.toFixed(2) || "0.00"} tk)
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || usersLoading || !user || authLoading}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 transform hover:scale-105"
          >
            {loading ? "Creating Transaction..." : "Create Transaction"}
          </button>
        </div>
      </div>
      {/* Custom Scrollbar Styles (optional, add to your global CSS or a style tag) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default UploadTransaction;
