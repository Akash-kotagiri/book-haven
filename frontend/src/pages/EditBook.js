import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBook } from '../context/BookContext';
import { toast } from 'react-toastify';

const EditBook = () => {
  const { id } = useParams();
  const { books, editBook } = useBook();
  const navigate = useNavigate();
  const book = books.find((b) => b._id === id);

  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [description, setDescription] = useState(book?.description || '');
  const [category, setCategory] = useState(book?.category || 'Uncategorized');
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!book) navigate('/');
  }, [book, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !author.trim()) {
      setError('Title and author are required fields');
      toast.error('Title and author are required fields', { autoClose: 3000 });
      return;
    }

    setError(null);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);
    formData.append('category', category);
    if (file) formData.append('coverImage', file);

    try {
      await editBook(id, formData);
      toast.success('Book updated successfully!', { autoClose: 3000 });
      navigate('/');
    } catch (err) {
      const errorMessage = err.message || 'Failed to update book. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
      console.error('Error updating book:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
          Edit Book
        </h1>
        {error && (
          <div className="mb-4 text-center text-red-500 dark:text-red-400">
            {error}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                rows="6"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              >
                <option value="Uncategorized">Uncategorized</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Fantasy">Fantasy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full p-2 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-200 dark:file:bg-gray-600 file:text-gray-900 dark:file:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;