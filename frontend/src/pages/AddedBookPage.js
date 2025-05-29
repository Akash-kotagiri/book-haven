import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBook } from '../context/BookContext';

const AddedBookPage = () => {
  const { id } = useParams();
  const { books } = useBook();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = () => {
      setLoading(true);
      setError(null);
      const foundBook = books.find((b) => b._id === id);
      if (foundBook) {
        setBook(foundBook);
      } else {
        setError('Book not found.');
      }
      setLoading(false);
    };
    fetchBook();
  }, [id, books]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex justify-center items-center">
        <div className="p-4 text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen w-full bg-gray-900 flex justify-center items-center">
        <div className="p-4 text-center text-gray-400">
          Book not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="p-4 max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">{book.title}</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 min-w-[200px]">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-auto max-h-96 object-contain mb-4 rounded-lg shadow-md"
                loading="lazy"
              />
            ) : (
              <div className="w-full max-h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4 rounded-lg shadow-md">
                <span className="text-gray-500 dark:text-gray-400">No Image Available</span>
              </div>
            )}
          </div>
          <div className="flex-2">
            <div className="space-y-4">
              <p>
                <strong>Author:</strong> {book.author || 'Unknown Author'}
              </p>
              <p>
                <strong>Category:</strong> {book.category || 'Uncategorized'}
              </p>
              <p>
                <strong>Description:</strong>{' '}
                <span>{book.description || 'No description available'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddedBookPage;