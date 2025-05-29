import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BookPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [previewLink, setPreviewLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes/${id}?key=${process.env.REACT_APP_GOOGLE_BOOKS_API_KEY}`
        );
        setBook(response.data);
        if (response.data.volumeInfo.previewLink) {
          setPreviewLink(response.data.volumeInfo.previewLink);
        }
      } catch (err) {
        setError('Failed to load book details. Please try again later.');
        console.error('Error fetching book:', err); 
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

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
      <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex justify-center items-center">
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Book not found or not available
        </div>
      </div>
    );
  }

  // Truncate title if too long (e.g., more than 50 characters)
  const displayTitle = book.volumeInfo.title.length > 50
    ? `${book.volumeInfo.title.slice(0, 50)}...`
    : book.volumeInfo.title;

  // Extract additional info
  const authors = book.volumeInfo.authors?.join(', ') || 'Unknown Author';
  const averageRating = book.volumeInfo.averageRating
    ? `${book.volumeInfo.averageRating} / 5 (${book.volumeInfo.ratingsCount || 'No'} ratings)`
    : 'No rating available';
  const publisher = book.volumeInfo.publisher || 'Unknown Publisher';
  const pageCount = book.volumeInfo.pageCount || 'N/A';

  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="p-4 max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">{book.volumeInfo.title}</h1>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Side: Book Image */}
          <div className="flex-1 min-w-[200px]">
            {book.volumeInfo.imageLinks?.large ? (
              <img
                src={book.volumeInfo.imageLinks.large}
                alt={book.volumeInfo.title}
                className="w-full h-auto max-h-96 object-contain mb-4 rounded-lg shadow-md"
                loading="lazy"
                onError={(e) => {
                  e.target.src = book.volumeInfo.imageLinks?.thumbnail || ''; // Fallback to thumbnail if large fails
                  if (!e.target.src) e.target.style.display = 'none'; // Hide if no image
                }}
              />
            ) : book.volumeInfo.imageLinks?.thumbnail ? (
              <img
                src={book.volumeInfo.imageLinks.thumbnail}
                alt={book.volumeInfo.title}
                className="w-full h-auto max-h-96 object-contain mb-4 rounded-lg shadow-md"
                loading="lazy"
              />
            ) : (
              <div className="w-full max-h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4 rounded-lg shadow-md">
                <span className="text-gray-500 dark:text-gray-400">No Image Available</span>
              </div>
            )}
          </div>

          {/* Right Side: Book Details */}
          <div className="flex-2">
            <div className="space-y-4">
              <p>
                <strong>Author(s):</strong> {authors}
              </p>
              <p>
                <strong>Rating:</strong> {averageRating}
              </p>
              <p>
                <strong>Publisher:</strong> {publisher}
              </p>
              <p>
                <strong>Pages:</strong> {pageCount}
              </p>
              <p>
                <strong>Description:</strong>{' '}
                <span
                  dangerouslySetInnerHTML={{
                    __html: book.volumeInfo.description || 'No description available',
                  }}
                />
              </p>
            </div>
          </div>
        </div>

        {/* Preview Link Below */}
        {previewLink ? (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Read Preview</h2>
            <a
              href={previewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline transition duration-300"
              title={`Read preview of ${book.volumeInfo.title}`}
            >
              {displayTitle}
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Powered by{' '}
              <a href="https://books.google.com" className="text-blue-500 hover:underline">
                Google Books
              </a>
            </p>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 mt-6">No preview available via Google Books.</p>
        )}
      </div>
    </div>
  );
};

export default BookPage;