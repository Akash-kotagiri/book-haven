import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon } from 'react-bootstrap-icons';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-gray-800 dark:to-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left: Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tight">
          BookHaven
        </Link>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex flex-1 justify-center space-x-6 items-center">
          <Link to="/" className="hover:text-blue-200 transition-colors">
            Home
          </Link>
          <Link to="/books" className="hover:text-blue-200 transition-colors">
            Books
          </Link>
          {user && location.pathname !== '/add-book' && (
            <Link to="/add-book" className="hover:text-blue-200 transition-colors">
              Add Book
            </Link>
          )}
          {user && (
            <Link to="/profile" className="hover:text-blue-200 transition-colors">
              Profile
            </Link>
          )}
          {!user && (
            <>
              <Link to="/login" className="hover:text-blue-200 transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Right: Dark Mode Toggle and Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-700 dark:bg-gray-800 px-4 py-2">
          <Link to="/" className="block py-2 hover:text-blue-200" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/books" className="block py-2 hover:text-blue-200" onClick={() => setIsOpen(false)}>
            Books
          </Link>
          {user && location.pathname !== '/add-book' && (
            <Link
              to="/add-book"
              className="block py-2 hover:text-blue-200"
              onClick={() => setIsOpen(false)}
            >
              Add Book
            </Link>
          )}
          {user && (
            <Link
              to="/profile"
              className="block py-2 hover:text-blue-200"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
          )}
          {!user && (
            <>
              <Link
                to="/login"
                className="block py-2 hover:text-blue-200"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block py-2 bg-blue-500 hover:bg-blue-600 rounded-md px-4 mt-2"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;