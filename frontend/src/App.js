import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookProvider } from './context/BookContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import EditBook from './pages/EditBook';
import BookPage from './pages/BookPage';
import Profile from './pages/Profile';
import BookForm from './components/BookForm';
import Navbar from './components/Navbar';
import AddedBookPage from './pages/AddedBookPage';

const App = () => {
  return (
    <AuthProvider>
      <BookProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/books" element={<Books />} />
            <Route path="/add-book" element={<BookForm />} />
            <Route path="/edit-book/:id" element={<EditBook />} />
            <Route path="/book/:id" element={<BookPage />} />
            <Route path="/added-book/:id" element={<AddedBookPage />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Router>
      </BookProvider>
    </AuthProvider>
  );
};

export default App;