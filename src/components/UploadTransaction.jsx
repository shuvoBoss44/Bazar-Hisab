import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function UploadTransaction() {
  const [items, setItems] = useState([{ itemName: "", price: "" }]);
  const [transactionType, setTransactionType] = useState("shopping");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Fetch all users for sharing
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "https://bazar-hisab-backend.onrender.com/api/users",
          { withCredentials: true }
        );
        setUsers(response.data.data?.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    if (user && transactionType === "shopping") {
      fetchUsers();
    }
  }, [user, transactionType]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { itemName: "", price: "" }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      let payload = {};

      if (transactionType === "shopping") {
        const validItems = items.filter(
          (item) => item.itemName.trim() !== "" && item.price !== ""
        );
        if (validItems.length === 0) {
          setError("Please add at least one valid item");
          setIsSubmitting(false);
          return;
        }
        payload = {
          items: validItems.map((item) => ({
            itemName: item.itemName,
            price: parseFloat(item.price),
          })),
          sharedUsers: selectedUsers.length > 0 ? selectedUsers : undefined,
        };
      } else {
        const amount = parseFloat(items[0].price);
        if (!amount || amount <= 0) {
          setError("Please enter a valid amount");
          setIsSubmitting(false);
          return;
        }
        payload = {
          items: [
            {
              itemName:
                transactionType === "addition"
                  ? "Balance Addition"
                  : "Balance Removal",
              price: amount,
            },
          ],
        };
      }

      await axios.post(
        "https://bazar-hisab-backend.onrender.com/api/transactions",
        payload,
        { withCredentials: true }
      );

      setSuccess("Transaction uploaded successfully!");
      setItems([{ itemName: "", price: "" }]);
      setSelectedUsers([]);
      setTimeout(() => navigate("/shopping-details"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error uploading transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md w-full space-y-4">
          <div className="w-16 h-16 rounded-full bg-error-500/10 border border-error-500/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Authentication Required</h2>
          <p className="text-slate-400">Please sign in to upload transactions.</p>
          <button
            onClick={() => navigate("/login")}
            className="btn-primary w-full"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gradient-primary">
            Upload Transaction
          </h1>
          <p className="text-slate-400">
            Record a new expense or balance update
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-card p-6 md:p-8 space-y-6 animate-in slide-in-from-bottom">
          {/* Messages */}
          {error && (
            <div className="alert-error animate-in flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert-success animate-in flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Toggle */}
            <div className="flex gap-2 p-1 bg-neutral-900/60 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setTransactionType("shopping");
                  setItems([{ itemName: "", price: "" }]);
                }}
                className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                  transactionType === "shopping"
                    ? "bg-primary-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Shopping
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransactionType("addition");
                  setItems([{ itemName: "Balance Addition", price: "" }]);
                  setSelectedUsers([]);
                }}
                className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                  transactionType === "addition"
                    ? "bg-success-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Add Balance
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransactionType("removal");
                  setItems([{ itemName: "Balance Removal", price: "" }]);
                  setSelectedUsers([]);
                }}
                className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                  transactionType === "removal"
                    ? "bg-error-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Remove Balance
              </button>
            </div>

            {/* Form Content */}
            {transactionType === "shopping" ? (
              <div className="space-y-6">
                {/* Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-lg font-semibold">Items</label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="btn-ghost text-sm"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.itemName}
                        onChange={(e) =>
                          handleItemChange(index, "itemName", e.target.value)
                        }
                        className="input-field flex-1"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(index, "price", e.target.value)
                        }
                        className="input-field w-32"
                        required
                        min="0"
                        step="0.01"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-3 text-error-400 hover:bg-error-500/10 rounded-lg transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end items-baseline gap-2 pt-4 border-t border-white/10">
                    <span className="text-slate-400">Total:</span>
                    <span className="text-2xl font-bold text-gradient-primary">
                      ৳{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* User Selection */}
                {users.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <label className="text-lg font-semibold">Share with Users (Optional)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {users.map((u) => (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => toggleUserSelection(u._id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            selectedUsers.includes(u._id)
                              ? "border-primary-500 bg-primary-500/10"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                          {selectedUsers.includes(u._id) && (
                            <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                    {selectedUsers.length > 0 && (
                      <p className="text-sm text-slate-400">
                        {selectedUsers.length} user(s) selected for sharing
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="amount" className="block text-sm font-medium text-slate-300">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">৳</span>
                  <input
                    type="number"
                    id="amount"
                    value={items[0].price}
                    onChange={(e) => handleItemChange(0, "price", e.target.value)}
                    className="input-field pl-10"
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner"></span>
                  Processing...
                </span>
              ) : (
                "Upload Transaction"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadTransaction;
