
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Facebook, Mail, Phone, Map } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Mission */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Glo</span>
            </div>
            <p className="text-gray-300 mb-4">
              Empowering homeless women and children through AI-powered support, 
              community connection, and comprehensive resources for lasting change.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-6 w-6 text-gray-400 hover:text-primary cursor-pointer" />
              <Mail className="h-6 w-6 text-gray-400 hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-primary">About Us</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-primary">Services</Link></li>
              <li><Link to="/resources" className="text-gray-300 hover:text-primary">Resources</Link></li>
              <li><Link to="/shop" className="text-gray-300 hover:text-primary">Shop</Link></li>
              <li><Link to="/donate" className="text-gray-300 hover:text-primary">Donate</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-gray-300">1-800-GLO-HELP</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="text-gray-300">support@glo.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <Map className="h-4 w-4" />
                <span className="text-gray-300">Emergency Hotline: 24/7</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Glo. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
