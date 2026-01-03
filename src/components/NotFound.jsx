import { Link } from 'react-router-dom';

/**
 * Professional 404 Not Found page
 * Provides clear navigation when users land on invalid routes
 */
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {/* Illustration */}
        <div className="relative mx-auto w-64 h-64">
          <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="relative flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="text-9xl font-black text-gradient-primary tracking-tighter">404</div>
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-lg text-slate-400 font-medium max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved to a new location.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/" className="btn-primary !px-8 !py-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="uppercase tracking-widest font-black text-xs">Back to Home</span>
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="btn-secondary !px-8 !py-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="uppercase tracking-widest font-black text-xs">Go Back</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-white/5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Quick Links
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { label: 'Dashboard', path: '/' },
              { label: 'New Transaction', path: '/upload-transaction' },
              { label: 'Profile', path: '/profile' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
