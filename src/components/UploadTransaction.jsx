import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function UploadTransaction() {
  const [items, setItems] = useState([{ itemName: "", price: "" }]);
  const [transactionType, setTransactionType] = useState("shopping");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

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
      setTimeout(() => navigate("/shopping-details"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error uploading transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md w-full shadow-neon-blue">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
            <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-[length:var(--font-size-xl)] font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-neutral-400 mb-6">Please sign in to upload transactions.</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-[length:var(--font-size-4xl)] font-extrabold text-white tracking-tight animate-in slide-in-from-bottom drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          Upload Transaction
        </h2>
        <p className="text-neutral-400 mt-2 text-[length:var(--font-size-lg)]">Record a new shopping expense or balance update.</p>
      </div>

      <div className="glass-card p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {error && (
          <div className="glass-liquid border-l-4 border-rose-500 text-rose-300 p-4 mb-8 rounded-2xl flex items-center shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="glass-liquid border-l-4 border-emerald-500 text-emerald-300 p-4 mb-8 rounded-2xl flex items-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Transaction Type Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-neutral-900/50 p-1.5 rounded-2xl inline-flex border border-white/10">
              <button
                type="button"
                onClick={() => setIsBalanceUpdate(false)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  !isBalanceUpdate
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Shopping Expense
              </button>
              <button
                type="button"
                onClick={() => setIsBalanceUpdate(true)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isBalanceUpdate
                    ? "bg-secondary-600 text-white shadow-lg shadow-secondary-600/30"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Balance Update
              </button>
            </div>
          </div>

          {isBalanceUpdate ? (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 ml-1">Update Type</label>
                  <select
                    value={balanceUpdateType}
                    onChange={(e) => setBalanceUpdateType(e.target.value)}
                    className="input-field appearance-none"
                  >
                    <option value="add">Add Balance (+)</option>
                    <option value="remove">Remove Balance (-)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 ml-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">tk</span>
                    <input
                      type="number"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      className="input-field pl-10"
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-lg font-bold text-white">Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-sm font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors bg-primary-500/10 px-3 py-1.5 rounded-lg border border-primary-500/20 hover:bg-primary-500/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start group">
                      <div className="flex-grow space-y-1">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                          className="input-field"
                          placeholder="Item name (e.g., Rice)"
                          required
                        />
                      </div>
                      <div className="w-32 space-y-1">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, "price", e.target.value)}
                          className="input-field text-right"
                          placeholder="0.00"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="mt-1 p-3 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                          title="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end items-center pt-4 border-t border-white/10 mt-4">
                  <div className="text-right">
                    <span className="text-neutral-400 text-sm mr-3 font-medium">Total Amount</span>
                    <span className="text-[length:var(--font-size-2xl)] font-bold text-accent-cyan drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                      {calculateTotal().toFixed(2)} <span className="text-sm text-neutral-500 font-normal">tk</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-white/10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary flex items-center justify-center gap-2 group text-lg"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <span>{isBalanceUpdate ? "Update Balance" : "Upload Transaction"}</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadTransaction;
