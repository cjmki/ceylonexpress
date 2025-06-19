import React from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Menu,
  Coffee,
  Phone,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  ShoppingBag,
  Construction,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-ceylon-bg shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Coffee className="h-8 w-8 text-ceylon-dark" />
            <span className="text-2xl font-bold text-ceylon-text">
              Ceylon Express
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              className="text-ceylon-text hover:text-ceylon-accent font-medium transition-colors"
            >
              Home
            </a>
            <a
              href="https://www.instagram.com/ceylonexpress_se/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ceylon-text hover:text-ceylon-accent transition-colors flex items-center gap-2"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          </div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-ceylon-dark hover:bg-ceylon-light"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-ceylon-bg py-0">
        <div className="w-full h-[80vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1627894483216-2138af692e32?w=1600&q=80"
            alt="Sri Lankan Cuisine"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="max-w-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Construction className="h-8 w-8 text-ceylon-light" />
                  <h2 className="text-lg font-medium text-ceylon-light">
                    UNDER CONSTRUCTION
                  </h2>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Ceylon Express
                  <br />
                  Coming Soon
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-lg">
                  We're working hard to bring you the authentic flavors of Sri
                  Lanka. Follow us on Instagram for updates on our launch!
                </p>
                <Button
                  className="bg-ceylon-accent hover:bg-ceylon-dark text-white rounded-full px-8 py-6 text-lg flex items-center gap-2"
                  onClick={() =>
                    window.open(
                      "https://www.instagram.com/ceylonexpress_se/",
                      "_blank",
                    )
                  }
                >
                  <Instagram className="h-5 w-5" />
                  Follow Us on Instagram
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-6 flex justify-center md:justify-between items-center border-b border-gray-200">
          <div className="hidden md:flex space-x-12 text-lg font-medium">
            <span className="text-ceylon-text/60">Coming Soon - Our Story</span>
            <span className="text-ceylon-text/60">Coming Soon - Locations</span>
            <span className="text-ceylon-text/60">Coming Soon - Catering</span>
          </div>
          <div className="flex space-x-6">
            <a
              href="https://www.instagram.com/ceylonexpress_se/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ceylon-text hover:text-ceylon-accent transition-colors"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <span className="text-ceylon-text/40">
              <Facebook className="h-6 w-6" />
            </span>
            <span className="text-ceylon-text/40">
              <Twitter className="h-6 w-6" />
            </span>
          </div>
        </div>
      </section>

      {/* Under Construction Message */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <Construction className="h-16 w-16 text-ceylon-accent mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-ceylon-text mb-6">
              We're Building Something Amazing
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Ceylon Express is currently under construction. We're working hard
              to bring you authentic Sri Lankan cuisine with a modern twist.
              Stay tuned for our grand opening!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                className="bg-ceylon-accent hover:bg-ceylon-dark text-white rounded-full px-8 py-3 flex items-center gap-2"
                onClick={() =>
                  window.open(
                    "https://www.instagram.com/ceylonexpress_se/",
                    "_blank",
                  )
                }
              >
                <Instagram className="h-5 w-5" />
                Follow Our Journey
              </Button>
              <p className="text-sm text-gray-500">
                Get updates on our launch date and menu previews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-24 bg-ceylon-bg">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-lg font-medium text-ceylon-accent mb-2">
              COMING SOON
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-ceylon-text mb-8">
              Authentic Sri Lankan Experience
            </h3>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
              We're preparing to bring you the most authentic Sri Lankan dining
              experience. From traditional curries to modern fusion dishes, our
              menu will celebrate the rich culinary heritage of Ceylon.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-ceylon-accent/10 p-3 rounded-full w-fit mx-auto mb-4">
                  <Coffee className="h-8 w-8 text-ceylon-accent" />
                </div>
                <h4 className="font-semibold text-ceylon-text mb-2">
                  Traditional Recipes
                </h4>
                <p className="text-sm text-gray-600">
                  Authentic family recipes passed down through generations
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-ceylon-accent/10 p-3 rounded-full w-fit mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-ceylon-accent" />
                </div>
                <h4 className="font-semibold text-ceylon-text mb-2">
                  Mobile Service
                </h4>
                <p className="text-sm text-gray-600">
                  Food truck and catering services coming to your location
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-ceylon-accent/10 p-3 rounded-full w-fit mx-auto mb-4">
                  <Clock className="h-8 w-8 text-ceylon-accent" />
                </div>
                <h4 className="font-semibold text-ceylon-text mb-2">
                  Fresh Daily
                </h4>
                <p className="text-sm text-gray-600">
                  Made fresh daily with premium ingredients and spices
                </p>
              </div>
            </div>

            <Button
              className="bg-ceylon-accent hover:bg-ceylon-dark text-white rounded-full px-8 py-4 text-lg flex items-center gap-2 mx-auto"
              onClick={() =>
                window.open(
                  "https://www.instagram.com/ceylonexpress_se/",
                  "_blank",
                )
              }
            >
              <Instagram className="h-5 w-5" />
              Stay Updated on Instagram
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Interested in catering services or want to know when we launch?
            Follow us on Instagram for the latest updates!
          </p>

          <div className="flex justify-center space-x-6 mb-8">
            <a
              href="https://www.instagram.com/ceylonexpress_se/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <span className="bg-gray-700 p-3 rounded-full opacity-50">
              <Facebook className="h-6 w-6" />
            </span>
            <span className="bg-gray-700 p-3 rounded-full opacity-50">
              <Twitter className="h-6 w-6" />
            </span>
          </div>

          <p className="text-sm text-gray-400">
            More contact options coming soon!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Coffee className="h-6 w-6 text-ceylon-accent" />
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

export default Home;
