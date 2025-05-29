import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const { user, updateUser } = useAuth();

  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching books:', err.response?.data || err.message);
      setError('Failed to fetch books');
    }
  };

  const addBook = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/books', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setBooks([...books, res.data.book]);
      updateUser(res.data.user); // Update user with booksAddedCount
      setError(null);
    } catch (err) {
      console.error('Error adding book:', err.response?.data || err.message);
      setError('Failed to add book');
      throw err;
    }
  };

  const deleteBook = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const res = await axios.delete(`/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(books.filter((book) => book._id !== id));
      updateUser(res.data.user); // Update user with decremented booksAddedCount
      setError(null);
    } catch (err) {
      console.error('Error deleting book:', err.response?.data || err.message);
      setError(err.response?.data.error || 'Failed to delete book');
      throw err;
    }
  };

  const editBook = async (id, formData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/books/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setBooks(books.map((book) => (book._id === id ? res.data : book)));
      setError(null);
    } catch (err) {
      console.error('Error editing book:', err.response?.data || err.message);
      setError('Failed to edit book');
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  return (
    <BookContext.Provider value={{ books, addBook, deleteBook, editBook, error }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBook = () => useContext(BookContext);