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
          <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
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
    <div className="min-h-screen bg-neutral-950 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8 md:p-12 shadow-neon-purple animate-in slide-in-from-bottom relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="text-center mb-10 relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-300 mb-2">
              Upload Transaction
            </h2>
            <p className="text-neutral-400">Record a new purchase or update balance</p>
          </div>

          {error && (
            <div className="bg-rose-900/20 border-l-4 border-rose-500 text-rose-300 p-4 mb-8 rounded-r-lg shadow-sm font-medium flex items-center animate-in fade-in relative z-10 backdrop-blur-sm">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-900/20 border-l-4 border-emerald-500 text-emerald-300 p-4 mb-8 rounded-r-lg shadow-sm font-medium flex items-center animate-in fade-in relative z-10 backdrop-blur-sm">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              {success}
            </div>
          )}

          <div className="mb-8 relative z-10">
            <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-900/50 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setTransactionType("shopping")}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  transactionType === "shopping"
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-900/50"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Shopping
              </button>
              <button
                type="button"
                onClick={() => setTransactionType("addition")}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  transactionType === "addition"
                    ? "bg-accent-lime text-neutral-950 shadow-lg shadow-lime-900/50"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Add Balance
              </button>
              <button
                type="button"
                onClick={() => setTransactionType("removal")}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  transactionType === "removal"
                    ? "bg-accent-pink text-white shadow-lg shadow-pink-900/50"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Remove Balance
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {transactionType === "shopping" ? (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start animate-in fade-in">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Item Name"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                        className="input-field bg-neutral-800/50"
                        required
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, "price", e.target.value)}
                        className="input-field bg-neutral-800/50"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-3.5 text-rose-400 hover:bg-rose-900/20 rounded-xl transition-colors border border-transparent hover:border-rose-500/30"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addItem}
                  className="w-full py-3 border border-dashed border-neutral-700 rounded-xl text-neutral-400 font-medium hover:border-primary-500 hover:text-primary-400 hover:bg-primary-500/5 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Add Another Item
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Amount to {transactionType === "addition" ? "Add" : "Remove"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">tk</span>
                  <input
                    type="number"
                    value={items[0].price}
                    onChange={(e) => handleItemChange(0, "price", e.target.value)}
                    className="input-field pl-10 text-lg font-medium"
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
              className="w-full btn-primary flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Upload Transaction
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadTransaction;
