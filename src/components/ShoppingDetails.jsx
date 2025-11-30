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
  const [expandedTransaction, setExpandedTransaction] = useState(null);
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
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-gradient-primary">Dashboard</h1>
            <p className="text-slate-400">Welcome back, {user.name}</p>
          </div>
          <button onClick={() => navigate("/upload-transaction")} className="btn-primary">
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

        {/* Transactions Table */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Transaction History</h2>

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
              <button onClick={() => navigate("/upload-transaction")} className="btn-primary mx-auto">
                Create Transaction
              </button>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-900/60 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Created By</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((transaction) => {
                      const isBalanceTransaction = 
                        transaction.items[0]?.itemName === "Balance Addition" || 
                        transaction.items[0]?.itemName === "Balance Removal";
                      const isExpanded = expandedTransaction === transaction._id;

                      return (
                        <>
                          <tr key={transaction._id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-300">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                              <br />
                              <span className="text-xs text-slate-500">
                                {new Date(transaction.createdAt).toLocaleTimeString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {transaction.items[0]?.itemName === "Balance Addition" ? (
                                <span className="badge-success">Addition</span>
                              ) : transaction.items[0]?.itemName === "Balance Removal" ? (
                                <span className="badge-error">Removal</span>
                              ) : (
                                <span className="badge-info">Shopping</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-300">
                              {transaction.createdBy?.name || "Unknown"}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {isBalanceTransaction ? (
                                <span className="text-slate-400">-</span>
                              ) : (
                                <button
                                  onClick={() => setExpandedTransaction(isExpanded ? null : transaction._id)}
                                  className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                                >
                                  {isExpanded ? "Hide" : "View"} ({transaction.items.length} items)
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-lg font-bold text-gradient-primary">
                                ৳{transaction.totalPrice?.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {transaction.createdBy?._id === user.id && (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => navigate(`/edit-transaction/${transaction._id}`)}
                                    className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(transaction._id)}
                                    className="text-error-400 hover:text-error-300 text-sm font-medium"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                          
                          {/* Expanded Details Row */}
                          {isExpanded && !isBalanceTransaction && (
                            <tr className="bg-neutral-900/40">
                              <td colSpan="6" className="px-6 py-4">
                                <div className="space-y-4">
                                  {/* Items */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Items Purchased</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {transaction.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between bg-neutral-900/60 rounded px-3 py-2">
                                          <span className="text-sm text-slate-300">{item.itemName}</span>
                                          <span className="text-sm text-slate-400 font-medium">৳{item.price?.toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                   {/* User Splits */}
                                  {transaction.sharedUsers && transaction.sharedUsers.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Split Among Users</h4>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {transaction.sharedUsers.map((sharedUser, idx) => (
                                          <div key={idx} className="bg-neutral-900/60 rounded px-3 py-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xs font-bold">
                                                {(sharedUser?.name || sharedUser?.userId?.name || 'U').charAt(0).toUpperCase()}
                                              </div>
                                              <span className="text-sm text-slate-300">{sharedUser?.name || sharedUser?.userId?.name || 'Unknown'}</span>
                                            </div>
                                            <span className="text-sm text-slate-400">
                                              ৳{(transaction.individualDeduction || 0).toFixed(2)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="mt-2 text-xs text-slate-500">
                                        Each user pays: ৳{(transaction.individualDeduction || 0).toFixed(2)}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-white/5">
                {transactions.map((transaction) => {
                  const isBalanceTransaction = 
                    transaction.items[0]?.itemName === "Balance Addition" || 
                    transaction.items[0]?.itemName === "Balance Removal";
                  const isExpanded = expandedTransaction === transaction._id;

                  return (
                    <div key={transaction._id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="mb-2">
                            {transaction.items[0]?.itemName === "Balance Addition" ? (
                              <span className="badge-success">Addition</span>
                            ) : transaction.items[0]?.itemName === "Balance Removal" ? (
                              <span className="badge-error">Removal</span>
                            ) : (
                              <span className="badge-info">Shopping</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-300 mt-1">By {transaction.createdBy?.name}</p>
                        </div>
                        <p className="text-xl font-bold text-gradient-primary">
                          ৳{transaction.totalPrice?.toFixed(2)}
                        </p>
                      </div>

                      {!isBalanceTransaction && (
                        <button
                          onClick={() => setExpandedTransaction(isExpanded ? null : transaction._id)}
                          className="text-primary-400 text-sm font-medium"
                        >
                          {isExpanded ? "Hide Details" : `View Details (${transaction.items.length} items)`}
                        </button>
                      )}

                      {isExpanded && !isBalanceTransaction && (
                        <div className="space-y-3 pt-3 border-t border-white/10">
                          <div className="space-y-2">
                            {transaction.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between bg-neutral-900/40 rounded px-3 py-2">
                                <span className="text-sm">{item.itemName}</span>
                                <span className="text-sm font-medium">৳{item.price?.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {transaction.createdBy?._id === user.id && (
                        <div className="flex gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => navigate(`/edit-transaction/${transaction._id}`)}
                            className="flex-1 btn-ghost text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="flex-1 btn-ghost text-error-400 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
