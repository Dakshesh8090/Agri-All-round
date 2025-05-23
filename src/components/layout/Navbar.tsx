import { Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications
  const notifications = [
    {
      id: '1',
      title: 'Weather Alert',
      message: 'Heavy rainfall expected in your area tomorrow.',
      time: '10 minutes ago',
      read: false,
    },
    {
      id: '2',
      title: 'Crop Update',
      message: 'Your wheat crop is due for irrigation today.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '3',
      title: 'System Update',
      message: 'New disease detection models are now available.',
      time: '1 day ago',
      read: true,
    },
  ];

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger menu */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Right: User profile & notifications */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                <Bell className="w-5 h-5" />
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 border-b last:border-0 ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t">
                    <button className="text-sm text-primary hover:text-primary-dark w-full text-center">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User profile */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {user?.name.charAt(0)}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;