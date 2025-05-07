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
                <h2 className="text-lg font-medium text-ceylon-light mb-2">
                  NEW MENU
                </h2>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Now serving
                  <br />
                  summer
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-lg">
                  Experience the rich flavors and aromatic spices of Sri Lanka
                  with our premium catering services.
                </p>
                <Button className="bg-ceylon-accent hover:bg-ceylon-dark text-white rounded-full px-8 py-6 text-lg">
                  ORDER NOW
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-6 flex justify-center md:justify-between items-center border-b border-gray-200">
          <div className="hidden md:flex space-x-12 text-lg font-medium">
            <a
              href="#"
              className="text-ceylon-text hover:text-ceylon-accent border-b-2 border-ceylon-accent pb-2"
            >
              Our Story
            </a>
            <a
              href="#"
              className="text-ceylon-text hover:text-ceylon-accent pb-2"
            >
              Locations
            </a>
            <a
              href="#"
              className="text-ceylon-text hover:text-ceylon-accent pb-2"
            >
              Catering
            </a>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-ceylon-text hover:text-ceylon-accent">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-ceylon-text hover:text-ceylon-accent">
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-ceylon-text hover:text-ceylon-accent">
              <Twitter className="h-6 w-6" />
            </a>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16">
            <h2 className="text-4xl font-bold text-ceylon-text mb-6 md:mb-0">
              Our Specialties
            </h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="border-ceylon-text text-ceylon-text hover:bg-ceylon-light rounded-full px-6"
              >
                View All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "KALE CAESAR",
                image:
                  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
                description:
                  "Roasted chicken, tomatoes, parmesan crisps, shaved parmesan, kale, romaine, lime",
                price: "$12.95",
              },
              {
                name: "GUACAMOLE GREENS",
                image:
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
                description:
                  "Roasted chicken, avocado, tomatoes, red onions, tortilla chips, spring mix",
                price: "$13.95",
              },
              {
                name: "BUFFALO CHICKEN BOWL",
                image:
                  "https://images.unsplash.com/photo-1580013759032-c96505e24c1f?w=500&q=80",
                description:
                  "Blackened chicken, pickled carrots, celery, blue cheese, breadcrumbs, hot sauce",
                price: "$14.95",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-ceylon-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-ceylon-text">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-ceylon-accent">
                      {item.price}
                    </span>
                    <Button className="bg-ceylon-accent hover:bg-ceylon-dark text-white rounded-full px-4">
                      Order now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Section - Hidden for now */}
      {/* Will be added back when content is ready */}

      {/* About Section */}
      <section id="about" className="py-24 bg-ceylon-bg">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-lg font-medium text-ceylon-accent mb-2">
              OUR STORY
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-ceylon-text">
              About Ceylon Express
            </h3>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-ceylon-accent/20 rounded-full -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&q=80"
                alt="About Ceylon Express"
                className="rounded-xl shadow-2xl w-full h-auto object-cover z-10 relative"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-ceylon-accent/10 rounded-full -z-10"></div>
            </div>

            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-ceylon-text">
                Authentic Sri Lankan Cuisine
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                At Ceylon Express, we bring the rich and vibrant flavors of Sri
                Lanka directly to your events. Our passion for authentic cuisine
                drives us to source the freshest ingredients and traditional
                spices to create memorable dining experiences.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Founded in 2018, our food truck and catering service has quickly
                become known for exceptional quality and service. We pride
                ourselves on sharing our cultural heritage through food that
                delights and inspires.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center bg-white p-4 rounded-lg shadow-md transition-all hover:shadow-lg">
                  <div className="bg-ceylon-accent/10 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-ceylon-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ceylon-text">
                      Business Hours
                    </h3>
                    <p className="text-sm text-gray-600">Mon-Sat: 10AM - 8PM</p>
                  </div>
                </div>
                <div className="flex items-center bg-white p-4 rounded-lg shadow-md transition-all hover:shadow-lg">
                  <div className="bg-ceylon-accent/10 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-ceylon-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ceylon-text">
                      Locations
                    </h3>
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
