import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Heart, HeartFill, Search, ArrowRepeat } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

const Home = () => {
  const { user, updateUser } = useAuth();
  const [allBooks, setAllBooks] = useState([]); // Store all fetched books
  const [displayedBooks, setDisplayedBooks] = useState([]); // Books currently displayed
  const [loading, setLoading] = useState(false); // Initial fetch loading
  const [loadMoreLoading, setLoadMoreLoading] = useState(false); // Load More loading
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Index for pagination
  const [togglingFavorite, setTogglingFavorite] = useState(null);

  const booksPerLoad = 12; // Books to show per "Load More" click
  const initialFetchCount = 40; // Initial fetch size
  const CACHE_DURATION = 3600000; // 1 hour in milliseconds
  const location = useLocation();

  // Handle success toast on registration
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success('Registration successful!', { autoClose: 3000 });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch books from Google Books API
  const fetchFreeBooks = useCallback(async () => {
    if (loading) return; 

    setLoading(true);
    setError(null);

    const cacheKey = `books_${encodeURIComponent(searchTerm || 'books')}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_DURATION) {
        const books = data.items || [];
        setAllBooks(books);
        setDisplayedBooks(books.slice(0, booksPerLoad));
        setCurrentIndex(booksPerLoad);
        setLoading(false);
        return;
      }
    }

    try {
      const query = searchTerm.trim() || 'books';
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${initialFetchCount}&key=${apiKey}`
      );

      const books = response.data.items || [];
      setAllBooks(books);
      setDisplayedBooks(books.slice(0, booksPerLoad));
      setCurrentIndex(booksPerLoad);
      localStorage.setItem(cacheKey, JSON.stringify({ data: response.data, timestamp: Date.now() }));

      if (!books.length) setError('No books found for this search.');
    } catch (err) {
      setError(err.message || 'Failed to load books. Please try again.');
      console.error('Error fetching books:', err); 
    } finally {
      setLoading(false);
    }
  }, [searchTerm, loading]);

  // Trigger fetch and reset state when search term changes
  useEffect(() => {
    setAllBooks([]);
    setDisplayedBooks([]);
    setCurrentIndex(0);
    fetchFreeBooks();
  }, [searchTerm, fetchFreeBooks]);

  // Handle search input
  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      setSearchTerm(searchQuery.trim());
    }
  };

  // Load more books from the fetched list with a loading spinner
  const handleLoadMore = useCallback(() => {
    if (loadMoreLoading || currentIndex >= allBooks.length) return;

    setLoadMoreLoading(true);
    const nextIndex = currentIndex + booksPerLoad;
    const newDisplayedBooks = allBooks.slice(0, nextIndex);

    // Simulate a slight delay for UX 
    setTimeout(() => {
      setDisplayedBooks(newDisplayedBooks);
      setCurrentIndex(nextIndex);
      setLoadMoreLoading(false);
    }, 500); // 500ms delay to show spinner
  }, [loadMoreLoading, currentIndex, allBooks]);

  // Toggle favorite status
  const toggleFavorite = async (bookId) => {
    if (togglingFavorite || !user) return;
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

  return (
    <div className="p-4 min-h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-3xl md:text-4xl font-bold text-center my-4">Welcome to BookHaven</h1>
      <div className="mb-8 max-w-md mx-auto flex items-center">
        <input
          type="text"
          placeholder="Search free books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          disabled={togglingFavorite !== null}
        />
        <button
          onClick={handleSearch}
          className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none"
          disabled={togglingFavorite !== null}
        >
          <Search size={20} />
        </button>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Explore Books</h2>

        {loading && !displayedBooks.length && (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        )}

        {error && <p className="text-center text-red-500 mb-4">{error}</p>}

        {displayedBooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedBooks.map((book) => (
              <div
                key={book.id} // Unique key using book.id
                className="border p-4 rounded shadow hover:shadow-lg transition-shadow dark:border-gray-700"
              >
                <Link to={`/book/${book.id}`}>
                  {book.volumeInfo.imageLinks?.thumbnail ? (
                    <img
                      src={book.volumeInfo.imageLinks.thumbnail}
                      alt={book.volumeInfo.title || 'Book Cover'}
                      className="w-full max-h-96 object-contain mb-4 rounded-lg shadow-md"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-96 flex items-center justify-center bg-gray-200 dark:bg-gray-700 mb-4 rounded-lg shadow-md">
                      <span className="text-gray-500 dark:text-gray-400">Image not available</span>
                    </div>
                  )}
                  <h3 className="text-lg md:text-xl font-bold mt-2 truncate">{book.volumeInfo.title || 'Untitled'}</h3>
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

        {loadMoreLoading && (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        )}

        {!loading && !loadMoreLoading && displayedBooks.length > 0 && currentIndex < allBooks.length && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none disabled:bg-gray-400"
              disabled={loadMoreLoading || togglingFavorite !== null}
            >
              Load More
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;