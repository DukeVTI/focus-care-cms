import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  FileText, Upload, Search, Filter, FolderOpen, AlertTriangle,
  Download, Trash2, Eye, Clock, User, Shield, Heart, Scale, Wallet, Plus, Share2, Mail
} from "lucide-react";
import { YoungPerson, Document } from "@/lib/types";
import { DocumentDuplicateDialog } from "@/components/DocumentDuplicateDialog";

const CATEGORIES = [
  { value: "health", label: "Health & Medical", icon: Heart, color: "text-red-500", badgeVariant: "destructive" as const },
  { value: "legal", label: "Legal & Care", icon: Scale, color: "text-blue-500", badgeVariant: "default" as const },
  { value: "finance", label: "Finance & Benefits", icon: Wallet, color: "text-green-500", badgeVariant: "secondary" as const },
  { value: "education", label: "Education", icon: FileText, color: "text-amber-500", badgeVariant: "outline" as const },
  { value: "safeguarding", label: "Safeguarding", icon: Shield, color: "text-purple-500", badgeVariant: "destructive" as const },
  { value: "id", label: "ID & Identity", icon: User, color: "text-cyan-500", badgeVariant: "default" as const },
  { value: "consent", label: "Consents", icon: FileText, color: "text-pink-500", badgeVariant: "secondary" as const },
  { value: "other", label: "Other", icon: FolderOpen, color: "text-muted-foreground", badgeVariant: "outline" as const },
];

const DOCUMENT_TYPES: Record<string, string[]> = {
  health: ["GP Registration", "Immunisation Record", "CAMHS Referral", "Health Assessment", "Medical Consent", "Prescription Record", "Dental Record"],
  legal: ["Care Plan", "Care Order", "Pathway Plan", "LAC Review Minutes", "Court Order", "Section 20 Agreement", "Placement Agreement"],
  finance: ["Universal Credit Letter", "PIP Assessment", "Bank Details", "Benefits Letter", "Bursary Application"],
  education: ["School Report", "EHCP", "PEP Report", "Exclusion Letter", "Attendance Record", "Education Consent"],
  safeguarding: ["Risk Assessment", "Safety Plan", "Strategy Meeting Minutes", "Referral Form", "CSE/CCE Assessment"],
  id: ["Passport", "Birth Certificate", "National Insurance Letter", "Biometric Residence Permit", "Photo ID"],
  consent: ["Photo Consent", "Trip Consent", "Medical Consent", "Data Sharing Consent", "Social Media Consent"],
  other: ["Other Document"],
};

export default function Documents() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const youngPersonId = searchParams.get("youngPersonId");

  const [documents, setDocuments] = useState<Document[]>([]);
  const [youngPeople, setYoungPeople] = useState<YoungPerson[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Upload form state
  const [uploadYPId, setUploadYPId] = useState(youngPersonId || "");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadDocType, setUploadDocType] = useState("");
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [uploadAction, setUploadAction] = useState(false);
  const [uploadActionNotes, setUploadActionNotes] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isManager, setIsManager] = useState(false);

  // Duplicate detection state
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateDoc, setDuplicateDoc] = useState<Document | null>(null);
  const [pendingUpload, setPendingUpload] = useState<Document | null>(null);

  // Share dialog state
  const [shareOpen, setShareOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState<Document | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      checkManagerRole();
      fetchDocuments();
      fetchYoungPeople();
    }
  }, [user, youngPersonId]);

  const fetchDocuments = async () => {
    setLoadingData(true);
    let query = supabase
      .from("young_person_documents")
      .select(`*, young_people:young_person_id (first_name, last_name)`)
      .order("created_at", { ascending: false });

    if (youngPersonId) {
      query = query.eq("young_person_id", youngPersonId);
    }

    const { data } = await query;
    if (data) setDocuments(data);
    setLoadingData(false);
  };

  const checkManagerRole = async () => {
    try {
      const managerResult = await supabase.rpc("has_role", {
        _user_id: user?.id || "",
        _role: "manager",
      });
      const adminResult = await supabase.rpc("has_role", {
        _user_id: user?.id || "",
        _role: "admin",
      });
      setIsManager(managerResult.data === true || adminResult.data === true);
    } catch (error) {
      console.error("Error checking manager role:", error);
    }
  };

  const fetchYoungPeople = async () => {
    const { data } = await supabase
      .from("young_people")
      .select("id, first_name, last_name")
      .order("first_name");
    if (data) setYoungPeople(data);
  };

  const handleUpload = async (forceProceed = false) => {
    if (!uploadFile || !uploadYPId || !uploadCategory || !uploadDocType) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (uploadFile.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png"];
    const fileExt = "." + (uploadFile.name.split(".").pop()?.toLowerCase() || "");
    if (!allowedTypes.includes(uploadFile.type) && !allowedExtensions.includes(fileExt)) {
      toast.error("Invalid file type. Allowed: PDF, Word, Excel, JPEG, PNG");
      return;
    }

    // Check for duplicates if not forcing proceed
    if (!forceProceed) {
      const duplicate = await checkForDuplicate();
      if (duplicate) {
        setDuplicateDoc(duplicate);
        setPendingUpload({
          uploadYPId,
          uploadCategory,
          uploadDocType,
          uploadExpiry,
          uploadAction,
          uploadActionNotes,
          uploadFile,
        });
        setDuplicateDialogOpen(true);
        return;
      }
    }

    setUploading(true);
    try {
      const fileExt = uploadFile.name.split(".").pop();
      const filePath = `${uploadYPId}/${Date.now()}_${uploadFile.name}`;

      const { error: storageError } = await supabase.storage
        .from("young-person-documents")
        .upload(filePath, uploadFile);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("young_person_documents")
        .insert({
          young_person_id: uploadYPId,
          document_type: uploadDocType,
          category: uploadCategory,
          file_name: uploadFile.name,
          file_path: filePath,
          file_size: uploadFile.size,
          expiry_date: uploadExpiry || null,
          uploaded_by: user?.id,
          uploaded_by_name: user?.email,
          action_required: uploadAction,
          action_notes: uploadActionNotes || null,
        });

      if (dbError) throw dbError;

      toast.success("Document uploaded successfully");
      setUploadOpen(false);
      setDuplicateDialogOpen(false);
      resetUploadForm();
      setPendingUpload(null);
      setDuplicateDoc(null);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
    setUploading(false);
  };

  const resetUploadForm = () => {
    setUploadCategory("");
    setUploadDocType("");
    setUploadExpiry("");
    setUploadAction(false);
    setUploadActionNotes("");
    setUploadFile(null);
    if (!youngPersonId) setUploadYPId("");
  };

  const checkForDuplicate = async () => {
    if (!uploadFile || !uploadYPId || !uploadCategory) return null;
    
    const { data: existingDocs, error } = await supabase
      .from("young_person_documents")
      .select("*")
      .eq("young_person_id", uploadYPId)
      .eq("category", uploadCategory)
      .eq("file_name", uploadFile.name)
      .order("created_at", { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("Error checking for duplicates:", error);
      return null;
    }
    
    return existingDocs && existingDocs.length > 0 ? existingDocs[0] : null;
  };

  const handleReplaceDocument = async () => {
    if (!duplicateDoc || !uploadFile) return;

    setUploading(true);
    try {
      // 1. Mark the old document as not latest and store the new document as previous version
      const { error: updateError } = await supabase
        .from("young_person_documents")
        .update({ is_latest: false })
        .eq("id", duplicateDoc.id);

      if (updateError) throw updateError;

      // 2. Upload new file
      const filePath = `${uploadYPId}/${Date.now()}_${uploadFile.name}`;
      const { error: storageError } = await supabase.storage
        .from("young-person-documents")
        .upload(filePath, uploadFile);

      if (storageError) throw storageError;

      // 3. Create new document record with reference to previous version
      const { error: dbError } = await supabase
        .from("young_person_documents")
        .insert({
          young_person_id: uploadYPId,
          document_type: uploadDocType,
          category: uploadCategory,
          file_name: uploadFile.name,
          file_size: uploadFile.size,
          storage_path: filePath,
          uploaded_by: user?.id,
          uploaded_by_name: user?.email,
          action_required: uploadAction,
          action_notes: uploadActionNotes || null,
          is_latest: true,
          previous_version_id: duplicateDoc.id, // Link to old version for audit trail
        });

      if (dbError) throw dbError;

      toast.success("Document replaced successfully. Previous version archived.");
      setDuplicateDialogOpen(false);
      setUploadOpen(false);
      resetUploadForm();
      setPendingUpload(null);
      setDuplicateDoc(null);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || "Failed to replace document");
    }
    setUploading(false);
  };

  const handleNewVersion = async () => {
    if (!uploadFile) return;

    setUploading(true);
    try {
      // Generate new filename with version suffix
      const nameParts = uploadFile.name.split(".");
      const extension = nameParts.pop();
      const baseName = nameParts.join(".");
      const versionedName = `${baseName}_v2.${extension}`;

      // Upload new file
      const filePath = `${uploadYPId}/${Date.now()}_${versionedName}`;
      const { error: storageError } = await supabase.storage
        .from("young-person-documents")
        .upload(filePath, uploadFile);

      if (storageError) throw storageError;

      // Create new document record
      const { error: dbError } = await supabase
        .from("young_person_documents")
        .insert({
          young_person_id: uploadYPId,
          document_type: uploadDocType,
          category: uploadCategory,
          file_name: versionedName, // Use versioned name
          file_size: uploadFile.size,
          storage_path: filePath,
          uploaded_by: user?.id,
          uploaded_by_name: user?.email,
          action_required: uploadAction,
          action_notes: uploadActionNotes || null,
          is_latest: true,
          previous_version_id: duplicateDoc?.id || null,
        });

      if (dbError) throw dbError;

      toast.success(`Document uploaded as new version: ${versionedName}`);
      setDuplicateDialogOpen(false);
      setUploadOpen(false);
      resetUploadForm();
      setPendingUpload(null);
      setDuplicateDoc(null);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || "Failed to create new version");
    }
    setUploading(false);
  };

  const handleDelete = async (doc: any) => {
    // RBAC check: only managers and admins can delete documents
    if (!isManager) {
      toast.error("Only managers and admins can delete documents");
      return;
    }
    
    if (!confirm("Delete this document permanently?")) return;
    
    try {
      await supabase.storage.from("young-person-documents").remove([doc.file_path]);
      await supabase.from("young_person_documents").delete().eq("id", doc.id);
      toast.success("Document deleted");
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete document");
    }
  };

  const handleDownload = async (doc: any) => {
    const { data } = await supabase.storage
      .from("young-person-documents")
      .createSignedUrl(doc.file_path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      toast.error("Could not generate download link");
    }
  };

  const toggleAction = async (doc: any) => {
    await supabase
      .from("young_person_documents")
      .update({ action_required: !doc.action_required })
      .eq("id", doc.id);
    fetchDocuments();
  };

  const handleShare = async () => {
    if (!shareDoc || !shareEmail) {
      toast.error("Email address is required");
      return;
    }

    setSharing(true);
    try {
      // 1. Create 7-day signed URL
      const { data: signedData, error: signError } = await supabase.storage
        .from("young-person-documents")
        .createSignedUrl(shareDoc.file_path, 60 * 60 * 24 * 7);

      if (signError) throw signError;
      if (!signedData?.signedUrl) throw new Error("Failed to generate link");

      // 2. Trigger edge function
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
        "send-notification",
        {
          body: {
            notification_type: "document_share",
            recipient_email: shareEmail,
            payload: {
              young_person_name: `${shareDoc.young_people?.first_name} ${shareDoc.young_people?.last_name}`,
              document_name: shareDoc.document_type || shareDoc.file_name,
              shared_by: user?.email,
              message: shareMessage,
              secure_link: signedData.signedUrl
            }
          }
        }
      );

      if (edgeError) throw edgeError;

      toast.success(`Document shared securely with ${shareEmail}`);
      setShareOpen(false);
      setShareEmail("");
      setShareMessage("");
      setShareDoc(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to share document");
    }
    setSharing(false);
  };

  const openShareDialog = (doc: any) => {
    setShareDoc(doc);
    setShareEmail("");
    setShareMessage("");
    setShareOpen(true);
  };

  const filtered = documents.filter((d) => {
    const matchesSearch =
      !searchTerm ||
      d.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.document_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || d.category === categoryFilter;
    const matchesAction = !actionFilter || d.action_required;
    return matchesSearch && matchesCategory && matchesAction;
  });

  const getCategoryInfo = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat) || CATEGORIES[CATEGORIES.length - 1];

  const actionCount = documents.filter((d) => d.action_required).length;

  if (loading || loadingData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Documents</h1>
            <p className="text-muted-foreground">
              Secure document storage with categories, audit trails & action flagging
            </p>
          </div>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Young Person */}
                <div className="space-y-2">
                  <Label>Young Person *</Label>
                  <Select value={uploadYPId} onValueChange={setUploadYPId}>
                    <SelectTrigger><SelectValue placeholder="Select young person" /></SelectTrigger>
                    <SelectContent>
                      {youngPeople.map((yp) => (
                        <SelectItem key={yp.id} value={yp.id}>
                          {yp.first_name} {yp.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={uploadCategory} onValueChange={(v) => { setUploadCategory(v); setUploadDocType(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Document Type */}
                {uploadCategory && (
                  <div className="space-y-2">
                    <Label>Document Type *</Label>
                    <Select value={uploadDocType} onValueChange={setUploadDocType}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {(DOCUMENT_TYPES[uploadCategory] || []).map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* File */}
                <div className="space-y-2">
                  <Label>File *</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground">Max 10MB. PDF, Word, Excel, JPEG, PNG</p>
                </div>

                {/* Expiry */}
                <div className="space-y-2">
                  <Label>Expiry Date (optional)</Label>
                  <Input type="date" value={uploadExpiry} onChange={(e) => setUploadExpiry(e.target.value)} />
                </div>

                {/* Action Required */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Action Required</Label>
                    <p className="text-xs text-muted-foreground">Flag this document for follow-up</p>
                  </div>
                  <Switch checked={uploadAction} onCheckedChange={setUploadAction} />
                </div>

                {uploadAction && (
                  <div className="space-y-2">
                    <Label>Action Notes</Label>
                    <Textarea
                      value={uploadActionNotes}
                      onChange={(e) => setUploadActionNotes(e.target.value)}
                      placeholder="Describe the action needed..."
                    />
                  </div>
                )}

                <Button onClick={handleUpload} disabled={uploading} className="w-full">
                  {uploading ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Duplicate Confirmation Dialog */}
        <DocumentDuplicateDialog
          isOpen={duplicateDialogOpen}
          existingDocument={duplicateDoc}
          fileName={uploadFile?.name || ""}
          category={uploadCategory}
          onReplace={handleReplaceDocument}
          onNewVersion={handleNewVersion}
          onCancel={() => {
            setDuplicateDialogOpen(false);
            setPendingUpload(null);
            setDuplicateDoc(null);
          }}
          isLoading={uploading}
        />

        {/* Share Document Dialog */}
        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Document Securely</DialogTitle>
            </DialogHeader>
            {shareDoc && (
              <div className="space-y-4 pt-4">
                <div className="p-3 bg-muted rounded-lg flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{shareDoc.document_type || shareDoc.file_name}</p>
                    <p className="text-xs text-muted-foreground">Link will be valid for 7 days</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Recipient Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="email" 
                      placeholder="professional@example.com" 
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Message (Optional)</Label>
                  <Textarea 
                    placeholder="Add a secure message..." 
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleShare} disabled={sharing || !shareEmail} className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  {sharing ? "Sending Secure Link..." : "Send Secure Link"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{documents.length}</div>
            </CardContent>
          </Card>
          {CATEGORIES.slice(0, 2).map((cat) => {
            const count = documents.filter((d) => d.category === cat.value).length;
            return (
              <Card key={cat.value}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{cat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{count}</div>
                </CardContent>
              </Card>
            );
          })}
          <Card className={actionCount > 0 ? "border-destructive/50" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Actions Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${actionCount > 0 ? "text-destructive" : ""}`}>{actionCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={actionFilter ? "destructive" : "outline"}
            onClick={() => setActionFilter(!actionFilter)}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Actions Only
          </Button>
        </div>

        {/* Document List */}
        {filtered.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">Upload your first document to get started</p>
              <Button onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc) => {
              const catInfo = getCategoryInfo(doc.category);
              const CatIcon = catInfo.icon;
              const isExpired = doc.expiry_date && new Date(doc.expiry_date) < new Date();

              return (
                <Card key={doc.id} className={`transition-all hover:shadow-md ${doc.action_required ? "border-l-4 border-l-destructive" : ""}`}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-lg bg-accent/50 ${catInfo.color}`}>
                        <CatIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">{doc.document_type || doc.file_name}</p>
                            <p className="text-sm text-muted-foreground truncate">{doc.file_name}</p>
                            {doc.young_people && (
                              <p className="text-xs text-muted-foreground mt-1">
                                For: {doc.young_people.first_name} {doc.young_people.last_name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {doc.action_required && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Action
                              </Badge>
                            )}
                            {isExpired && (
                              <Badge variant="outline" className="text-destructive border-destructive">Expired</Badge>
                            )}
                            <Badge variant={catInfo.badgeVariant}>{catInfo.label}</Badge>
                          </div>
                        </div>

                        {doc.action_notes && (
                          <div className="mt-2 p-2 rounded bg-destructive/10 text-sm text-destructive">
                            {doc.action_notes}
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {doc.created_at ? format(new Date(doc.created_at), "PP") : "Unknown"}
                          </span>
                          {doc.uploaded_by_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {doc.uploaded_by_name}
                            </span>
                          )}
                          {doc.expiry_date && (
                            <span className={`flex items-center gap-1 ${isExpired ? "text-destructive font-medium" : ""}`}>
                              Expires: {format(new Date(doc.expiry_date), "PP")}
                            </span>
                          )}
                          {doc.file_size && (
                            <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => handleDownload(doc)} title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openShareDialog(doc)} title="Share securely">
                          <Share2 className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleAction(doc)}
                          title={doc.action_required ? "Clear action" : "Flag for action"}
                          className={doc.action_required ? "text-destructive" : ""}
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDelete(doc)} 
                          title={isManager ? "Delete" : "Delete (managers only)"}
                          disabled={!isManager}
                          className={`text-destructive ${!isManager ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
