import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function ShoppingDetails() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [centralBalance, setCentralBalance] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedTransactions, setExpandedTransactions] = useState(new Set());
  const navigate = useNavigate();
  const limit = 10;

  const fetchData = useCallback(async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setLoadingTransactions(true);
      const transactionResponse = await axios.get(
        `https://bazar-hisab-backend.onrender.com/api/transactions?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      const data = transactionResponse.data.data || {};
      setTransactions(data.transactions || []);
      setCentralBalance(data.centralBalance || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to fetch data");
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setLoadingTransactions(false);
    }
  }, [user, navigate, page]);

  useEffect(() => {
    if (user && !authLoading) fetchData();
  }, [page, user, authLoading, fetchData]);

  useEffect(() => {
    if (!user && !authLoading) navigate("/login");
  }, [user, authLoading, navigate]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://bazar-hisab-backend.onrender.com/api/transactions/${id}`,
        { withCredentials: true }
      );
      setSuccess("Transaction deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete transaction");
      setTimeout(() => setError(null), 3000);
    }
  };

  const toggleExpand = (id) => {
    setExpandedTransactions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (authLoading || loadingTransactions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-gradient-primary">
              Dashboard
            </h1>
            <p className="text-slate-400">
              Welcome back, {user.name}
            </p>
          </div>
          <button
            onClick={() => navigate("/upload-transaction")}
            className="btn-primary"
          >
            + New Transaction
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="alert-error animate-in flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-success animate-in flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Balance Card */}
        <div className="glass-card p-8 text-center">
          <p className="text-slate-400 text-sm mb-2">Central Pool Balance</p>
          <p className={`text-5xl font-bold ${centralBalance >= 0 ? 'text-success-500' : 'text-error-500'}`}>
            ৳{centralBalance.toFixed(2)}
          </p>
        </div>

        {/* Transactions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Transactions</h2>

          {transactions.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold">No transactions yet</h3>
                <p className="text-slate-400 mt-2">Get started by creating your first transaction</p>
              </div>
              <button
                onClick={() => navigate("/upload-transaction")}
                className="btn-primary mx-auto"
              >
                Create Transaction
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isExpanded = expandedTransactions.has(transaction._id);
                const isBalanceTransaction = 
                  transaction.items[0]?.itemName === "Balance Addition" || 
                  transaction.items[0]?.itemName === "Balance Removal";

                return (
                  <div
                    key={transaction._id}
                    className="glass-card-hover p-6 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-xl">
                            {transaction.items[0]?.itemName === "Balance Addition" ? (
                              <span className="text-success-500">Balance Addition</span>
                            ) : transaction.items[0]?.itemName === "Balance Removal" ? (
                              <span className="text-error-500">Balance Removal</span>
                            ) : (
                              "Shopping Transaction"
                            )}
                          </h3>
                          {!isBalanceTransaction && (
                            <button
                              onClick={() => toggleExpand(transaction._id)}
                              className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                            >
                              {isExpanded ? "Hide Details" : "Show Details"}
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          By {transaction.createdBy?.name} • {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-gradient-primary">
                        ৳{transaction.totalPrice?.toFixed(2)}
                      </p>
                    </div>

                    {/* Items List */}
                    {!isBalanceTransaction && (
                      <div className="space-y-2 border-t border-white/10 pt-4">
                        <h4 className="text-sm font-semibold text-slate-300">Items Purchased</h4>
                        <div className="space-y-1">
                          {transaction.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm bg-neutral-900/40 rounded-lg px-3 py-2">
                              <span className="text-slate-300">{item.itemName}</span>
                              <span className="text-slate-400 font-medium">৳{item.price?.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* User Split Details - Show when expanded */}
                    {isExpanded && !isBalanceTransaction && transaction.sharedUsers && transaction.sharedUsers.length > 0 && (
                      <div className="space-y-2 border-t border-white/10 pt-4">
                        <h4 className="text-sm font-semibold text-slate-300">Split Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {transaction.sharedUsers.map((sharedUser, idx) => (
                            <div 
                              key={idx} 
                              className="bg-neutral-900/40 rounded-lg px-3 py-2 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xs font-bold">
                                  {sharedUser.userId?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <span className="text-sm text-slate-300">{sharedUser.userId?.name || 'Unknown'}</span>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-semibold ${
                                  sharedUser.balance >= 0 ? 'text-success-500' : 'text-error-500'
                                }`}>
                                  {sharedUser.balance >= 0 ? '+' : ''}৳{sharedUser.balance?.toFixed(2)}
                                </p>
                                <p className="text-xs text-slate-500">Balance change</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      {!isBalanceTransaction && transaction.sharedUsers && transaction.sharedUsers.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>Split among {transaction.sharedUsers.length} user(s)</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {transaction.createdBy?._id === user.id && (
                      <div className="flex gap-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => navigate(`/edit-transaction/${transaction._id}`)}
                          className="btn-ghost"
                        >
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="btn-ghost text-error-400 hover:text-error-300"
                        >
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-slate-400 px-4">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingDetails;
