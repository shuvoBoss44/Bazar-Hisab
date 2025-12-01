import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function EditTransaction() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [items, setItems] = useState([{ itemName: "", price: "" }]);
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
        if (transaction.createdBy._id?.toString() !== user.id) {
          throw new Error("Not authorized");
        }

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
      await axios.put(
        `${API_URL}/api/transactions/${transactionId}`,
        {
          items: items.map(item => ({
            itemName: item.itemName,
            price: parseFloat(item.price)
          }))
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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gradient-primary">
            Edit Transaction
          </h1>
          <p className="text-slate-400">
            Update transaction details
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-card p-6 md:p-8 space-y-6 animate-in slide-in-from-bottom">
          {error && (
            <div className="alert-error animate-in flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                    className="input-field flex-1"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, "price", e.target.value)}
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

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn-primary"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner"></span>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
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
