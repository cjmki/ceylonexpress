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
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import MenuSection from "./MenuSection";
import OrderForm from "./OrderForm";

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
              href="/menu"
              className="text-ceylon-text hover:text-ceylon-accent transition-colors"
            >
              Menu
            </a>
            <a
              href="#about"
              className="text-ceylon-text hover:text-ceylon-accent transition-colors"
            >
              About
            </a>
            <a
              href="#order"
              className="text-ceylon-text hover:text-ceylon-accent transition-colors"
            >
              Order
            </a>
            <a
              href="#contact"
              className="text-ceylon-text hover:text-ceylon-accent transition-colors"
            >
              Contact
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
      <section className="relative bg-gradient-to-r from-ceylon-light to-ceylon-bg py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-ceylon-text mb-4"
            >
              Authentic Sri Lankan Cuisine
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-ceylon-text mb-8"
            >
              Experience the rich flavors and aromatic spices of Sri Lanka with
              our premium catering services. Perfect for events, parties, and
              introducing your guests to the wonders of Ceylon cuisine.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex space-x-4"
            >
              <Button className="bg-ceylon-accent hover:bg-ceylon-dark text-white">
                Order Now
              </Button>
              <Button
                variant="outline"
                className="border-ceylon-accent text-ceylon-accent hover:bg-ceylon-light"
                onClick={() => (window.location.href = "/menu")}
              >
                View Menu
              </Button>
            </motion.div>
          </div>
          <div className="md:w-1/2">
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src="https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800&q=80"
              alt="Sri Lankan Cuisine"
              className="rounded-lg shadow-xl w-full h-auto"
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <a
            href="#menu"
            className="bg-ceylon-light rounded-full p-2 shadow-md transform translate-y-1/2 hover:translate-y-1/3 transition-transform"
          >
            <ChevronDown className="h-6 w-6 text-ceylon-accent" />
          </a>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Menu Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <Card
                key={item}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={`https://images.unsplash.com/photo-156512340969${item}-7b5ef63a2efb?w=400&q=80`}
                  alt="Food Item"
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Signature Dish {item}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-orange-500">
                      ${(10 + item).toFixed(2)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-500 text-orange-500 hover:bg-orange-50"
                    >
                      Add to Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              View Full Menu
            </Button>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Menu</h2>
          <MenuSection />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <img
                src="https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&q=80"
                alt="About Us"
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-3xl font-bold mb-6">About Our Food Truck</h2>
              <p className="text-gray-600 mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <p className="text-gray-600 mb-6">
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Business Hours</h3>
                    <p className="text-sm text-gray-600">Mon-Sat: 10AM - 8PM</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Locations</h3>
                    <p className="text-sm text-gray-600">
                      Downtown & City Park
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Section */}
      <section id="order" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Place Your Order
          </h2>
          <div className="max-w-3xl mx-auto">
            <OrderForm />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=customer${item}`}
                    alt="Customer"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">Customer Name {item}</h3>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam."
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
              <p className="mb-6">
                Have questions or want to book our food truck for your event?
                Reach out to us!
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-orange-400" />
                  <span>(123) 456-7890</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-orange-400" />
                  <span>123 Street Name, City, State</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-orange-400" />
                  <span>Mon-Sat: 10AM - 8PM</span>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <a
                  href="#"
                  className="bg-gray-700 p-2 rounded-full hover:bg-orange-500 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="bg-gray-700 p-2 rounded-full hover:bg-orange-500 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="bg-gray-700 p-2 rounded-full hover:bg-orange-500 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="md:w-1/2">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                      placeholder="Your Email"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                    placeholder="Subject"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                    placeholder="Your Message"
                  ></textarea>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <ShoppingBag className="h-6 w-6 text-orange-500" />
              <span className="text-xl font-bold text-white">FoodTruck</span>
            </div>
            <div className="text-sm">
              &copy; {new Date().getFullYear()} FoodTruck. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
