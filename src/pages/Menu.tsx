import React from "react";
import MenuSection from "@/components/MenuSection";

const Menu = () => {
  return (
    <div className="min-h-screen bg-ceylon-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-ceylon-bg shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-ceylon-text">
              Ceylon Express
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              className="text-ceylon-text hover:text-ceylon-accent transition-colors"
            >
              Home
            </a>
            <a
              href="/menu"
              className="text-ceylon-accent font-medium transition-colors"
            >
              Menu
            </a>
            <a
              href="/#about"
              className="text-ceylon-text hover:text-ceylon-accent transition-colors"
            >
              About
            </a>
            <a
              href="/#order"
              className="text-ceylon-text hover:text-ceylon-accent transition-colors"
            >
              Order
            </a>
            <a
              href="/#contact"
              className="text-ceylon-text hover:text-ceylon-accent transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Menu Section */}
      <section className="py-16 bg-ceylon-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-ceylon-text">
            Our Sri Lankan Menu
          </h2>
          <MenuSection />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ceylon-dark text-ceylon-light py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-xl font-bold text-white">
                Ceylon Express
              </span>
            </div>
            <div className="text-sm">
              &copy; {new Date().getFullYear()} Ceylon Express. All rights
              reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Menu;
