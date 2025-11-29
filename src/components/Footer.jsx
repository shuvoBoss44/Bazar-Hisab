import React from "react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-16 border-t border-neutral-800/50">
      <div className="glass-dark backdrop-blur-xl">
        <div className="container mx-auto px-4 py-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-gradient-primary mb-2">
                Bazar<span className="text-gradient-blue">Hisab</span>
              </h3>
              <p className="text-neutral-400 text-sm">
                Simplifying expense tracking and balance management
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h4 className="text-neutral-200 font-semibold mb-3 text-sm uppercase tracking-wider">
                Quick Links
              </h4>
              <div className="flex flex-col space-y-2">
                <a href="/shopping-details" className="text-neutral-400 hover:text-primary-400 transition-colors text-sm">
                  Transactions
                </a>
                <a href="/upload-transaction" className="text-neutral-400 hover:text-primary-400 transition-colors text-sm">
                  Upload
                </a>
                <a href="/profile" className="text-neutral-400 hover:text-primary-400 transition-colors text-sm">
                  Profile
                </a>
              </div>
            </div>

            {/* Info Section */}
            <div className="text-center md:text-right">
              <h4 className="text-neutral-200 font-semibold mb-3 text-sm uppercase tracking-wider">
                Connect
              </h4>
              <p className="text-neutral-400 text-sm mb-2">
                Built with ❤️ for better expense management
              </p>
              <div className="flex justify-center md:justify-end space-x-3 mt-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800/50 flex items-center justify-center hover:bg-primary-600/20 hover:border-primary-500/30 border border-neutral-700 transition-all cursor-pointer">
                  <svg className="w-4 h-4 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-neutral-800/50">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <p className="text-neutral-500 text-sm">
                &copy; {currentYear} BazarHisab. All rights reserved.
              </p>
              <p className="text-neutral-500 text-sm flex items-center gap-2">
                Developed by 
                <span className="text-primary-400 font-semibold">Shuvo</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
