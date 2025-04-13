
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Eye, Trash2 } from 'lucide-react';
import DocumentPreviewModal from './DocumentPreviewModal';

export interface Document {
  id: string;
  title: string;
  createdAt: string;
  content: string;
}

interface DocumentsTabProps {
  resumes: Document[];
  coverLetters: Document[];
  onDeleteResume?: (id: string) => void;
  onDeleteCoverLetter?: (id: string) => void;
}

const DocumentsTab = ({ 
  resumes, 
  coverLetters,
  onDeleteResume = () => {},
  onDeleteCoverLetter = () => {}
}: DocumentsTabProps) => {
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (document: Document) => {
    setPreviewDocument(document);
    setIsPreviewOpen(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Resumes</CardTitle>
          <CardDescription>
            Previously generated resumes will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">No resumes yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Generated resumes will be saved here
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <div key={resume.id} className="p-4 border rounded-md hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{resume.title}</h3>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handlePreview(resume)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDeleteResume(resume.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Cover Letters</CardTitle>
          <CardDescription>
            Previously generated cover letters will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coverLetters.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">No cover letters yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Generated cover letters will be saved here
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {coverLetters.map((letter) => (
                  <div key={letter.id} className="p-4 border rounded-md hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{letter.title}</h3>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(letter.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handlePreview(letter)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDeleteCoverLetter(letter.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      <DocumentPreviewModal 
        isOpen={isPreviewOpen}
        setIsOpen={setIsPreviewOpen}
        document={previewDocument}
      />
    </div>
  );
};

export default DocumentsTab;
