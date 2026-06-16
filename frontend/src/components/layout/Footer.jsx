import { Link } from 'react-router-dom';
import { Zap, Twitter, Github, Linkedin, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8 mt-20">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EventFlow</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Discover and experience the most amazing events around you. From concerts to conferences, we've got it all.
            </p>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {['Home', 'Events', 'Categories', 'About Us', 'Blog'].map(link => (
                <li key={link}>
                  <Link to="/" className="hover:text-white hover:pl-1 transition-all duration-200">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              {['🎵 Music', '💻 Technology', '⚽ Sports', '🎨 Arts & Culture', '🍕 Food & Drink', '💼 Business'].map(cat => (
                <li key={cat}>
                  <Link to="/events" className="hover:text-white hover:pl-1 transition-all duration-200">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-400" /><span>hello@eventflow.com</span></li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-400" /><span>+1 (555) 123-4567</span></li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-primary-400 mt-0.5" /><span>123 Event Street<br />New York, NY 10001</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2025 EventFlow. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
