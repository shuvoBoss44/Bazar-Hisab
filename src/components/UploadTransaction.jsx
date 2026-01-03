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
        // Backend returns data as an array directly or wrapped in data object depending on controller
        // Based on UserController.getAllUsers: res.status(200).json({ status: "success", data: [...] })
        const API_URL = import.meta.env.VITE_API_URL || "https://bazar-hisab-backend.onrender.com";
        const response = await axios.get(
          `${API_URL}/api/users`,
          { withCredentials: true }
        );
        const usersData = response.data.data;
        setUsers(Array.isArray(usersData) ? usersData : usersData?.users || []);
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
          sharedUserIds: selectedUsers.length > 0 ? selectedUsers : undefined,
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

      const API_URL = import.meta.env.VITE_API_URL || "https://bazar-hisab-backend.onrender.com";
      await axios.post(
        `${API_URL}/api/transactions`,
        payload,
        { withCredentials: true }
      );

      setSuccess("Transaction uploaded successfully!");
      setItems([{ itemName: "", price: "" }]);
      setSelectedUsers([]);
      setTimeout(() => navigate("/"), 1500);
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
    <div className="min-h-screen py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-4xl font-bold text-gradient-primary">
            Upload Transaction
          </h1>
          <p className="text-slate-400">
            Record a new expense or balance update
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-card p-6 md:p-10 space-y-8 animate-in slide-in-from-bottom">
          {/* Messages */}
          <div className="space-y-4">
            {error && (
              <div className="alert-error animate-in flex items-center gap-4 bg-red-500/10 border-red-500/20">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {success && (
              <div className="alert-success animate-in flex items-center gap-4 bg-emerald-500/10 border-emerald-500/20">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold">{success}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Type Toggle */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Transaction Category</label>
              <div className="flex flex-col sm:flex-row gap-2 p-1.5 bg-neutral-900/60 rounded-2xl border border-white/5 shadow-inner">
                {[
                  { id: 'shopping', label: 'Shopping Expense', color: 'primary' },
                  { id: 'addition', label: 'Balance Addition', color: 'success' },
                  { id: 'removal', label: 'Balance Removal', color: 'error' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setTransactionType(type.id);
                      if (type.id === 'shopping') {
                        setItems([{ itemName: "", price: "" }]);
                      } else {
                        setItems([{ itemName: type.id === 'addition' ? "Balance Addition" : "Balance Removal", price: "" }]);
                        setSelectedUsers([]);
                      }
                    }}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 transform active:scale-95 ${
                      transactionType === type.id
                        ? type.id === 'shopping' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 shadow-glow-primary' :
                          type.id === 'addition' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' :
                          'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                        : "text-slate-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Content */}
            {transactionType === "shopping" ? (
              <div className="space-y-8 animate-in">
                {/* Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                       Purchased Items
                    </label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-blue-400 hover:text-white font-bold text-sm bg-blue-500/10 hover:bg-blue-500 px-4 py-1.5 rounded-lg transition-all"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-3 group/item scale-100 hover:scale-[1.01] transition-transform">
                        <div className="relative flex-1">
                           <input
                            type="text"
                            placeholder="e.g., Grocery, Rent, Dinner"
                            value={item.itemName}
                            onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                            className="input-field pr-10"
                            required
                          />
                        </div>
                        <div className="relative w-28 md:w-36">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">৳</span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, "price", e.target.value)}
                            className="input-field pl-8 font-bold"
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-90"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center p-5 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Calculated Total</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base text-slate-400 font-bold">৳</span>
                      <span className="text-2xl font-bold text-white">
                        {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Selection */}
                {users.length > 0 && (
                  <div className="space-y-5 pt-8 border-t border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                           Split With
                        </label>
                        <p className="text-sm text-slate-500 font-medium">Select who will share this expense</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setSelectedUsers(users.map(u => u.id))}
                          className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                        >
                          Select All
                        </button>
                        <span className="text-slate-700">|</span>
                        <button 
                          type="button"
                          onClick={() => setSelectedUsers([])}
                          className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => toggleUserSelection(u.id)}
                          className={`group flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                            selectedUsers.includes(u.id)
                              ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                              : "border-white/5 bg-neutral-900/30 hover:border-white/20 hover:bg-white/5"
                          }`}
                        >
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white transition-all duration-500 ${
                            selectedUsers.includes(u.id)
                              ? "bg-blue-600 scale-105 shadow-lg shadow-blue-500/20"
                              : "bg-neutral-800"
                          }`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm truncate uppercase tracking-tight transition-colors ${
                              selectedUsers.includes(u.id) ? "text-white" : "text-slate-400"
                            }`}>
                              {u.name}
                            </p>
                            <p className="text-[10px] text-slate-600 font-bold truncate tracking-wider">{u.email}</p>
                          </div>
                          {selectedUsers.includes(u.id) && (
                            <div className="absolute top-2 right-2">
                               <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                               </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-in">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <span className={`w-1.5 h-1.5 rounded-full ${transactionType === 'addition' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                     Adjustment Amount
                  </label>
                  <div className="relative scale-100 focus-within:scale-[1.01] transition-transform">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-slate-500 font-bold">৳</span>
                    <input
                      type="number"
                      id="amount"
                      value={items[0].price}
                      onChange={(e) => handleItemChange(0, "price", e.target.value)}
                      className="input-field pl-12 py-5 text-3xl font-bold"
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                  transactionType === 'addition' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'
                }`}>
                  <svg className={`w-5 h-5 flex-shrink-0 ${transactionType === 'addition' ? 'text-emerald-400' : 'text-rose-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Adjusting the balance directly affects the Central Pool. This should only be used for direct deposits or manual corrections.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary !py-5 shadow-2xl scale-100 active:scale-95"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="spinner"></span>
                    <span className="uppercase tracking-widest font-black text-xs">Processing Request...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="uppercase tracking-widest font-bold">Confirm Transaction</span>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadTransaction;
