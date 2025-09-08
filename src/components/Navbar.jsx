import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className={`bg-${theme}-200 p-4`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">PhotoCard Trader</Link>
        <div className="flex items-center space-x-4">
          <Link to="/">Home</Link>
          {user && <Link to="/cards">Manage Cards</Link>}
          {user && <Link to={`/profile/${user.uid}`}>Profile</Link>}
          {!user && <Link to="/login">Login</Link>}
          {user && <button onClick={handleLogout}>Logout</button>}
          <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-300">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
