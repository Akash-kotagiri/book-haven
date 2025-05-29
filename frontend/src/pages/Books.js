import React, { useState, useEffect } from 'react';
import { useBook } from '../context/BookContext';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Heart, HeartFill, Trash, ArrowRepeat } from 'react-bootstrap-icons'; // Add ArrowRepeat
import { toast } from 'react-toastify';

const Books = () => {
  const { books, error: booksError, deleteBook } = useBook();
  const { user, updateUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingFavorite, setTogglingFavorite] = useState(null); // Add loading state for favorite toggle
  const location = useLocation();

  const CACHE_DURATION = 3600000; // 1 hour in milliseconds

  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success('Login successful!', { autoClose: 3000 });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    let isMounted = true;

    const fetchFavorites = async () => {
      if (!user?.favorites?.length) {
        if (isMounted) {
          setFavorites([]);
          setLoading(false);
        }
        return;
      }

      const cacheKey = `favorites_${user.favorites.join('_')}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setFavorites(data);
          setLoading(false);
          return;
        }
      }

      try {
        setLoading(true);
        setError(null);
        const validIds = user.favorites.filter((id) => !id.startsWith('/works/'));
        if (!validIds.length) {
          if (isMounted) {
            setError('No valid Google Books favorites found.');
            setLoading(false);
          }
          return;
        }

        const faveBooks = [];
        for (const id of validIds) {
          try {
            const response = await axios.get(
              `https://www.googleapis.com/books/v1/volumes/${id}?key=${process.env.REACT_APP_GOOGLE_BOOKS_API_KEY}`
            );
            faveBooks.push({
              id,
              title: response.data.volumeInfo.title,
              cover: response.data.volumeInfo.imageLinks?.thumbnail || null,
            });
          } catch (err) {
            // Silently continue
          }
        }
        if (isMounted) {
          setFavorites(faveBooks);
          if (faveBooks.length === 0) {
            setError('All favorite book fetches failed. Check your network or book IDs.');
          } else {
            localStorage.setItem(cacheKey, JSON.stringify({ data: faveBooks, timestamp: Date.now() }));
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load favorites. Check your network or API key.');
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const { data } = JSON.parse(cached);
            setFavorites(data);
            setError('API unavailable, showing cached data.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFavorites();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const toggleFavorite = async (bookId) => {
    if (togglingFavorite) return; // Prevent multiple clicks
    setTogglingFavorite(bookId);
    const isFavorited = user.favorites.includes(bookId);
    const newFavorites = isFavorited
      ? user.favorites.filter((fav) => fav !== bookId)
      : [...user.favorites, bookId];

    try {
      await updateUser({ favorites: newFavorites });
      toast.success(isFavorited ? 'Removed from favorites!' : 'Added to favorites!', { autoClose: 2000 });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error('Failed to update favorites', { autoClose: 3000 });
    } finally {
      setTogglingFavorite(null);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await deleteBook(bookId);
      toast.success('Book deleted successfully!', { autoClose: 3000 });
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete book. Please try again.', { autoClose: 3000 });
    }
  };

  return (
    <div className="p-4 min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-3xl md:text-4xl font-bold my-4">Added Books</h1>
      {booksError && <p className="text-red-500 mb-4 text-center">{booksError}</p>}
      {books.length === 0 ? (
        <p className="text-center">No books added yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) =>
            book ? (
              <div
                key={book._id}
                className="border p-4 rounded shadow hover:shadow-lg transition-shadow dark:border-gray-700"
              >
                <Link to={`/added-book/${book._id}`}>
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full max-h-96 object-contain mb-4 rounded-lg shadow-md"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full max-h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4 rounded-lg shadow-md">
                      <span className="text-gray-500 dark:text-gray-400">No Image</span>
                    </div>
                  )}
                  <h2 className="text-lg md:text-xl font-bold mt-2 truncate">{book.title}</h2>
                </Link>
                <button
                  onClick={() => handleDeleteBook(book._id)}
                  className="mt-2 p-2 rounded text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500"
                >
                  <Trash size={20} />
                </button>
              </div>
            ) : null
          )}
        </div>
      )}

      <h2 className="text-2xl md:text-3xl font-bold my-6">Your Favorite Books</h2>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : favorites.length === 0 ? (
        <p className='text-center'>No favorite books yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((book) => (
            <div
              key={book.id}
              className="border p-4 rounded shadow hover:shadow-lg transition-shadow dark:border-gray-700"
            >
              <Link to={`/book/${book.id}`}>
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full max-h-96 object-contain mb-4 rounded-lg shadow-md"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full max-h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4 rounded-lg shadow-md">
                    <span className="text-gray-500 dark:text-gray-400">No Image</span>
                  </div>
                )}
                <h3 className="text-lg md:text-xl font-bold mt-2 truncate">{book.title}</h3>
              </Link>
              {user && (
                <button
                  onClick={() => toggleFavorite(book.id)}
                  className={`mt-2 p-2 rounded text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 ${
                    user.favorites.includes(book.id) ? 'text-red-500' : ''
                  }`}
                  disabled={togglingFavorite === book.id}
                >
                  {togglingFavorite === book.id ? (
                    <ArrowRepeat size={20} className="animate-spin" />
                  ) : user.favorites.includes(book.id) ? (
                    <HeartFill size={20} />
                  ) : (
                    <Heart size={20} />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Books;