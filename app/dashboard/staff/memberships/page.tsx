import React, { useState } from 'react';
import { Home, Settings, Users, Sun, Moon } from 'lucide-react';

/**
 * A reusable button component with Tailwind CSS styling.
 * @param {object} props - Component properties.
 * @param {string} props.text - The text to display on the button.
 * @param {function} props.onClick - The function to call when the button is clicked.
 * @param {object} [props.icon] - An optional icon component to render.
 */
const NavButton = ({ text, onClick, icon: Icon }: { text: string; onClick: () => void; icon?: React.ElementType }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg group hover:bg-indigo-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    {Icon && <Icon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-white" />}
    {text}
  </button>
);

/**
 * The main layout for the dashboard, including a sidebar and main content area.
 * The children prop is used to render the content specific to each page.
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - The content to be rendered in the main area.
 * @param {function} props.onNavigate - The function to handle navigation.
 */
const DashboardLayout = ({ children, onNavigate }: { children: React.ReactNode; onNavigate: (page: string) => void }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div className={`flex min-h-screen ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar */}
      <aside className={`w-64 p-6 transition-all duration-300 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} rounded-r-2xl shadow-lg`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-indigo-500">My Dashboard</h1>
          <button onClick={toggleTheme} className="p-2 transition-transform duration-300 transform rounded-full hover:scale-110">
            {isDarkTheme ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-600" />}
          </button>
        </div>
        <nav className="space-y-4">
          <NavButton text="Home" onClick={() => onNavigate('home')} icon={Home} />
          <NavButton text="Users" onClick={() => onNavigate('users')} icon={Users} />
          <NavButton text="Settings" onClick={() => onNavigate('settings')} icon={Settings} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className={`p-8 transition-colors duration-300 rounded-2xl shadow-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

/**
 * The main application component that manages the dashboard's state and content.
 */
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-4 text-indigo-500">Welcome to the Dashboard!</h2>
            <p className="text-lg">This is a dynamic and responsive dashboard built with React and Tailwind CSS. Use the sidebar to navigate between different sections.</p>
          </div>
        );
      case 'users':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-4 text-indigo-500">User Management</h2>
            <p className="text-lg">This section would display a list of users and allow for their management.</p>
            <div className="mt-6 p-4 border rounded-lg border-dashed border-gray-400">
              <p className="text-center text-gray-500">User list coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-4 text-indigo-500">Settings</h2>
            <p className="text-lg">Here you can configure application settings.</p>
            <div className="mt-6 p-4 border rounded-lg border-dashed border-gray-400">
              <p className="text-center text-gray-500">Settings panel under construction...</p>
            </div>
          </div>
        );
      default:
        return <div>Page not found.</div>;
    }
  };

  return (
    <DashboardLayout onNavigate={setCurrentPage}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default App;
