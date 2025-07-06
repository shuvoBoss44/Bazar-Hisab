// Footer.jsx
import React from "react";

function Footer() {
  return (
    <footer className="w-full mt-12 text-gray-700">
      {" "}
      {/* Removed background, adjusted text color for visibility */}
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm md:text-base mb-2">
          &copy; {new Date().getFullYear()} Bazar Hisab. All rights reserved.
        </p>
        <p className="text-xs md:text-sm text-gray-500">
          {" "}
          {/* Slightly darker gray for better contrast */}
          Developed by Shuvo
        </p>
      </div>
    </footer>
  );
}

export default Footer;
