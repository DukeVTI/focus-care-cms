import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, FileText, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { Document } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentDuplicateDialogProps {
  isOpen: boolean;
  existingDocument: Document | null;
  fileName: string;
  category: string;
  onReplace: () => void;
  onNewVersion: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DocumentDuplicateDialog({
  isOpen,
  existingDocument,
  fileName,
  category,
  onReplace,
  onNewVersion,
  onCancel,
  isLoading = false,
}: DocumentDuplicateDialogProps) {
  const [selectedAction, setSelectedAction] = useState<"replace" | "version" | null>(null);

  const handleProceed = () => {
    if (selectedAction === "replace") {
      onReplace();
    } else if (selectedAction === "version") {
      onNewVersion();
    }
  };

  if (!existingDocument) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Duplicate Document Found
          </DialogTitle>
          <DialogDescription>
            A document with this name already exists in the {category} category. Choose how to proceed:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Existing Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Existing Document</CardTitle>
              <CardDescription>Currently stored</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm">{existingDocument.file_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Uploaded {format(new Date(existingDocument.created_at), "PPp")}
              </div>
              {existingDocument.file_size && (
                <div className="text-sm text-muted-foreground">
                  Size: {(existingDocument.file_size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Selection */}
          <Tabs value={selectedAction || "replace"} onValueChange={(v) => setSelectedAction(v as "replace" | "version")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="replace">Replace</TabsTrigger>
              <TabsTrigger value="version">New Version</TabsTrigger>
            </TabsList>

            <TabsContent value="replace" className="space-y-3">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-sm">Replace Existing Document</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>The existing document will be archived as a previous version.</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                    <li>New document becomes the current version</li>
                    <li>Previous document remains in history for audit trail</li>
                    <li>All access timestamps and metadata are preserved</li>
                    <li>You can revert to the old version if needed</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="version" className="space-y-3">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-sm">Create New Version</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Keep both documents as separate versions in the system.</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                    <li>New file will be renamed to: <code className="bg-white px-1 rounded">{fileName.replace(/\.[^/.]+$/, '')}_v2.pdf</code></li>
                    <li>Both versions stored and searchable</li>
                    <li>Useful for tracking document evolution</li>
                    <li>Clear version numbering in file names</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Warning Message */}
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-medium mb-1">ℹ️ All actions are recorded in the audit log</p>
            <p className="text-xs">The system keeps a complete history of all document uploads and replacements for compliance and safeguarding purposes.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel Upload
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!selectedAction || isLoading}
            className={selectedAction === "replace" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isLoading ? "Processing..." : selectedAction === "replace" ? "Replace Document" : "Create New Version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
