
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { UserCircle, FileText } from 'lucide-react';
import ProfileTab from '@/components/ProfileTab';
import ResumeGeneratorTab from '@/components/ResumeGeneratorTab';

const Dashboard = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-resume-primary mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 mx-auto flex justify-center">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              <span>My Profile</span>
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Resume Generator</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="animate-fade-in">
            <ProfileTab />
          </TabsContent>
          
          <TabsContent value="generator" className="animate-fade-in">
            <ResumeGeneratorTab onComplete={() => setActiveTab("profile")} />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>© 2025 ResumeCraft. Built for AI in Business class by Rahul, Adrian, Shahbaba, Medha.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
