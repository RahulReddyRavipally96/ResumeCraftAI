
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Download, Clipboard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  document: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
  } | null;
}

const DocumentPreviewModal = ({ isOpen, setIsOpen, document }: DocumentPreviewModalProps) => {
  const { toast } = useToast();

  if (!document) return null;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(document.content);
    toast({
      title: "Copied to clipboard",
      description: "Document content has been copied to your clipboard."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{document.title}</DialogTitle>
          <DialogDescription>
            Created on {new Date(document.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end gap-2 mb-2">
          <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
            <Clipboard className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
        
        <ScrollArea className="h-[400px] border rounded-md p-4 bg-gray-50">
          <div className="whitespace-pre-line font-mono text-sm">
            {document.content}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;
