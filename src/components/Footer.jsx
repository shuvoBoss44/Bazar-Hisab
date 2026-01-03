import React from "react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-32 border-t border-white/5 relative bg-neutral-900/40 backdrop-blur-3xl">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-xl font-black text-white italic">B</span>
              </div>
              <h3 className="text-3xl font-black text-white tracking-widest uppercase">
                Bazar<span className="text-blue-500">Hisab</span>
              </h3>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
              The ultimate financial companion for shared living. Track every expense, manage pool balances, and maintain transparency with elegance.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Navigation</h4>
            <ul className="space-y-4">
              {[
                { label: 'Dashboard', path: '/' },
                { label: 'New Record', path: '/upload-transaction' },
                { label: 'My Account', path: '/profile' }
              ].map((link) => (
                <li key={link.path}>
                  <a href={link.path} className="text-slate-500 hover:text-blue-400 font-bold transition-all flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-slate-800 group-hover:bg-blue-500 transition-colors"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact/Info */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Connection</h4>
            <div className="flex gap-3">
              <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-blue-500/10 hover:border-blue-500/20 transition-all text-slate-400 hover:text-blue-400 group">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="mailto:shuvo@example.com" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all text-slate-400 hover:text-indigo-400 group">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm font-bold tracking-tight">
            &copy; {currentYear} <span className="text-slate-300">BazarHisab</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
             <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
               Designed & Engineered by 
               <span className="text-white font-black hover:text-blue-400 transition-colors cursor-default">Shuvo Chakma</span>
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
