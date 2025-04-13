
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, FileText } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
        <div className="p-1 rounded bg-white">
  <img 
    src="/icon.png" 
    alt="ResumeCraft Logo" 
    className="w-9 h-9 object-contain" 
  />
</div>
          <span className="font-bold text-xl text-gray-900">ResumeCraft</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">Welcome, {user.name || user.username}</p>
              <p className="text-xs text-gray-500">{user.email || 'No email set'}</p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
