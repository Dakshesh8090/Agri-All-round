import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Leaf, Cloud, History, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { path: '/chatbot', name: 'AI Assistant', icon: <MessageSquare className="w-5 h-5" /> },
    { path: '/crops', name: 'Crop Management', icon: <Leaf className="w-5 h-5" /> },
    { path: '/weather', name: 'Weather Forecast', icon: <Cloud className="w-5 h-5" /> },
    { path: '/diagnosis-history', name: 'Diagnosis History', icon: <History className="w-5 h-5" /> },
    { path: '/profile', name: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b bg-primary text-white">
            <Leaf className="w-7 h-7 mr-2" />
            <span className="text-xl font-bold">Agri-All-Round</span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-md transition duration-200 ${
                      isActive(item.path)
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;