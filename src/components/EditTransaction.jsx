import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function EditTransaction() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [items, setItems] = useState([{ itemName: "", price: "" }]);
  const [originalTransaction, setOriginalTransaction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { id: transactionId } = useParams();

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading && !user) navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "https://bazar-hisab-backend.onrender.com";
        const res = await axios.get(
          `${API_URL}/api/transactions/${transactionId}`,
          { withCredentials: true }
        );

        const transaction = res.data.data?.transaction;
        if (!transaction) throw new Error("Transaction not found");
        
        // Also fetch latest transaction to verify
        const listRes = await axios.get(
          `${API_URL}/api/transactions?page=1&limit=1`,
          { withCredentials: true }
        );
        const latestId = listRes.data.data?.transactions?.[0]?._id;

        if (latestId && String(transaction._id) !== String(latestId)) {
          throw new Error("Only the most recent transaction can be edited");
        }

        if (transaction.createdBy._id?.toString() !== user.id && transaction.createdBy?.toString() !== user.id) {
          throw new Error("Not authorized");
        }

        setOriginalTransaction(transaction);
        setItems(
          transaction.items.map(item => ({
            itemName: item.itemName || "",
            price: item.price?.toString() || "",
          }))
        );
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setTimeout(() => navigate("/"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [transactionId, user, authLoading, navigate]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { itemName: "", price: "" }]);
  const removeItem = (index) => items.length > 1 &&  setItems(items.filter((_, i) => i !== index));

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://bazar-hisab-backend.onrender.com";
      const newItems = items.filter(i => i.itemName.trim() !== "" && i.price !== "").map(item => ({
        itemName: item.itemName,
        price: parseFloat(item.price)
      }));
      const newTotalPrice = newItems.reduce((sum, i) => sum + i.price, 0);

      await axios.put(
        `${API_URL}/api/transactions/${transactionId}`,
        {
          items: newItems,
          sharedUsers: originalTransaction.sharedUsers.map(u => u._id || u),
          totalPrice: newTotalPrice,
          originalTotalPrice: originalTransaction.totalPrice,
          userBalanceBeforeTransaction: originalTransaction.userBalanceBeforeTransaction,
          usersBalancesAtTransactionTime: originalTransaction.usersBalancesAtTransactionTime
        },
        { withCredentials: true }
      );

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Error updating transaction");
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
             <button 
               onClick={() => navigate("/")}
               className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
               </svg>
             </button>
             <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Back to Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Edit Record
          </h1>
          <p className="text-slate-400 font-medium">
            Update your transaction items and pricing
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-card p-5 md:p-12 space-y-8 md:space-y-10 animate-in slide-in-from-bottom duration-500">
          {error && (
            <div className="alert-error animate-in flex items-center gap-4 bg-red-500/10 border-red-500/20">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
              <div className="flex justify-between items-center group">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
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
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-4 group/item scale-100 md:hover:scale-[1.01] transition-transform">
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
                    <div className="flex gap-2">
                      <div className="relative flex-1 md:w-40">
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
                          className="w-[3.25rem] h-[3.25rem] md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-90"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center p-6 rounded-2xl bg-white/5 border border-white/5 shadow-inner mt-8">
                <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Total Amount</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl text-slate-400 font-bold">৳</span>
                  <span className="text-4xl font-black text-white">
                    {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all active:scale-95"
              >
                Cancel Changes
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-2 btn-primary !py-5 shadow-2xl scale-100 active:scale-95 transition-all"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="spinner"></span>
                    <span className="uppercase tracking-widest font-black text-xs">Saving Records...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="uppercase tracking-[0.2em] font-black">Save Updates</span>
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

export default EditTransaction;
