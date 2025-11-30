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
      console.error("Error fetching data:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to fetch data");
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setLoadingTransactions(false);
    }
  }, [user, navigate, page, limit]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchData();
    }
  }, [page, user, authLoading, fetchData]);

  useEffect(() => {
    if (!user && !authLoading) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleDelete = async id => {
    try {
      setLoadingTransactions(true);
      const transactionToDelete = transactions.find(t => t._id === id);
      if (!transactionToDelete) throw new Error("Transaction not found");

      await axios.delete(
        `https://bazar-hisab-backend.onrender.com/api/transactions/${id}`,
        { withCredentials: true }
      );

      const updatedTransactions = transactions.filter(t => t._id !== id);
      setTransactions(updatedTransactions);

      let newCentralBalance = centralBalance;
      if (transactionToDelete.items[0]?.itemName === "Balance Addition") {
        newCentralBalance -= transactionToDelete.totalPrice || 0;
      } else if (transactionToDelete.items[0]?.itemName === "Balance Removal") {
        newCentralBalance += Math.abs(transactionToDelete.totalPrice || 0);
      } else {
        newCentralBalance += transactionToDelete.totalPrice || 0;
      }
      setCentralBalance(newCentralBalance);

      if (updatedTransactions.length === 0 && page > 1) {
        setPage(prev => prev - 1);
      } else if (updatedTransactions.length < limit && page === totalPages && totalPages > 1) {
        await fetchData();
      } else if (page === 1 && updatedTransactions.length === 0 && totalPages > 1) {
        await fetchData();
      }

      setSuccess("Transaction deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError(err.response?.data?.message || "Failed to delete transaction");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const getBorderClass = transaction => {
    if (transaction.items[0]?.itemName === "Balance Addition") {
      return "border-l-4 border-accent-lime";
    } else if (transaction.items[0]?.itemName === "Balance Removal") {
      return "border-l-4 border-accent-pink";
    }
    return "border-l-4 border-accent-cyan";
  };

  const getTransactionTitle = transaction => {
    if (transaction.items[0]?.itemName === "Balance Addition") {
      return "Balance Addition";
    } else if (transaction.items[0]?.itemName === "Balance Removal") {
      return "Balance Removal";
    }
    return "Shopping Transaction";
  };

  if (authLoading || loadingTransactions) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center p-8 glass-card">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500 mb-4"></div>
          <p className="text-neutral-300 text-[length:var(--font-size-lg)] font-medium animate-pulse">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
          <h2 className="text-[length:var(--font-size-4xl)] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400 tracking-tight animate-in slide-in-from-bottom">
            Transaction History
          </h2>
          <p className="text-neutral-400 mt-2 text-[length:var(--font-size-lg)]">Manage your shared expenses and balances.</p>
        </div>
        
        <div className="glass-liquid px-8 py-6 flex flex-col items-end min-w-[280px] animate-in slide-in-from-right">
          <span className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">Central Balance</span>
          <p className="text-[length:var(--font-size-4xl)] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-secondary-200 to-primary-200">
            {centralBalance?.toFixed(2) ?? "0.00"} <span className="text-[length:var(--font-size-xl)] text-neutral-500 font-normal">tk</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="glass-liquid border-l-4 border-rose-500 text-rose-200 p-4 mb-8 flex items-center backdrop-blur-sm">
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}
      {success && (
        <div className="glass-liquid border-l-4 border-emerald-500 text-emerald-200 p-4 mb-8 flex items-center backdrop-blur-sm">
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          {success}
        </div>
      )}

      {!loadingTransactions && transactions.length === 0 && (
        <div className="glass-card p-16 text-center">
          <div className="w-24 h-24 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
            <svg className="w-12 h-12 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          </div>
          <h3 className="text-[length:var(--font-size-2xl)] font-bold text-white mb-2">No Transactions Yet</h3>
          <p className="text-neutral-400 text-[length:var(--font-size-lg)]">
            Start by adding a shopping transaction or updating your balance.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {transactions.map((transaction) => {
          const isBalanceAddition = transaction.items[0]?.itemName === "Balance Addition";
          const isBalanceRemoval = transaction.items[0]?.itemName === "Balance Removal";
          const isCreator = user && transaction.createdBy._id.toString() === user.id;

          return (
            <div
              key={transaction._id}
              className={`glass-card overflow-hidden hover:shadow-neon-cyan transition-all duration-500 group ${getBorderClass(transaction)}`}
            >
              <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                {/* Header Section */}
                <div className="lg:w-1/4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 pb-6 lg:pb-0 lg:pr-8">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3.5 rounded-2xl ${
                        isBalanceAddition ? "bg-accent-lime/10 text-accent-lime" :
                        isBalanceRemoval ? "bg-accent-pink/10 text-accent-pink" :
                        "bg-accent-cyan/10 text-accent-cyan"
                      }`}>
                        {isBalanceAddition && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                        {isBalanceRemoval && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>}
                        {!isBalanceAddition && !isBalanceRemoval && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                      </div>
                      <div>
                        <h3 className="text-[length:var(--font-size-xl)] font-bold text-white leading-tight">
                          {getTransactionTitle(transaction)}
                        </h3>
                        <p className="text-sm text-neutral-400 mt-1">
                          {new Date(transaction.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400 border border-white/10">
                        {transaction.createdBy.name.charAt(0)}
                      </div>
                      <span className="text-neutral-300 font-medium">{transaction.createdBy.name}</span>
                    </div>
                  </div>

                  {isCreator && (
                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => navigate(`/edit-transaction/${transaction._id}`)}
                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-neutral-300 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        className="flex-1 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-sm font-semibold text-rose-400 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="lg:w-3/4 flex flex-col gap-8">
                  {(isBalanceAddition || isBalanceRemoval) ? (
                    <div className="glass-liquid p-6 md:p-8">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                          <p className="text-neutral-400 text-sm uppercase tracking-wider font-medium mb-2">Amount</p>
                          <p className={`text-[length:var(--font-size-4xl)] md:text-[length:var(--font-size-5xl)] font-bold ${isBalanceAddition ? "text-accent-lime" : "text-accent-pink"}`}>
                            {isBalanceAddition ? "+" : "−"}{Math.abs(transaction.totalPrice ?? 0).toFixed(2)} <span className="text-[length:var(--font-size-2xl)] text-neutral-500 font-normal">tk</span>
                          </p>
                        </div>
                        <div className="w-full md:w-auto bg-neutral-950/30 rounded-2xl p-6 min-w-[250px]">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-neutral-400 text-sm">Previous Balance</span>
                            <span className="text-neutral-300 font-mono">{transaction.userBalanceBeforeTransaction?.toFixed(2)}</span>
                          </div>
                          <div className="w-full h-px bg-white/10 my-3"></div>
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">New Balance</span>
                            <span className={`font-bold font-mono ${
                              (transaction.createdBy?.balance ?? 0) < 0 ? "text-accent-pink" : "text-accent-lime"
                            }`}>
                              {transaction.createdBy?.balance?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Items List */}
                      <div className="glass-liquid p-6">
                        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-accent-cyan"></span>
                          Purchased Items
                        </h4>
                        <div className="space-y-3">
                          {transaction.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                              <span className="text-neutral-300 text-[length:var(--font-size-base)]">{item.itemName}</span>
                              <span className="text-white font-mono font-medium">{item.price?.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                          <span className="text-neutral-400 font-medium">Total</span>
                          <span className="text-[length:var(--font-size-xl)] font-bold text-accent-cyan">{transaction.totalPrice?.toFixed(2)} tk</span>
                        </div>
                      </div>

                      {/* Split Details */}
                      <div className="glass-liquid p-6">
                        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-accent-pink"></span>
                          Split Details
                        </h4>
                        <div className="space-y-3">
                          {transaction.sharedUsers.map(sharedUserObj => {
                             const balanceAtTimeObj = transaction.usersBalancesAtTransactionTime?.find(
                                u => u._id.toString() === sharedUserObj._id.toString()
                              );
                              const balanceBefore = balanceAtTimeObj
                                ? balanceAtTimeObj.balanceAtTime + (transaction.individualDeduction ?? 0)
                                : sharedUserObj.balanceBeforeTransaction ?? null;

                              const hasHistoricalData = balanceAtTimeObj || sharedUserObj.balanceBeforeTransaction !== undefined;
                              const fallbackBalanceBefore = (sharedUserObj.balance ?? 0) + (transaction.individualDeduction ?? 0);
                              const displayBalanceBefore = hasHistoricalData ? balanceBefore : fallbackBalanceBefore;
                              const afterBalance = displayBalanceBefore - (transaction.individualDeduction ?? 0);

                            return (
                              <div key={sharedUserObj._id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                <div>
                                  <div className="text-neutral-300 text-[length:var(--font-size-base)]">{sharedUserObj.name}</div>
                                  <div className="text-xs text-neutral-500">
                                    {displayBalanceBefore?.toFixed(2)} → <span className={afterBalance < 0 ? "text-accent-pink" : "text-accent-lime"}>{afterBalance?.toFixed(2)}</span>
                                  </div>
                                </div>
                                <span className="text-accent-pink font-mono font-medium">−{transaction.individualDeduction?.toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-6">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Previous
          </button>
          <span className="text-neutral-300 font-medium bg-neutral-900/50 px-6 py-3 rounded-xl border border-white/10">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default ShoppingDetails;
