import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, AlertTriangle, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Document } from "@/lib/types";

interface Props {
  youngPersonId: string;
}

export function DocumentsWidget({ youngPersonId }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("young_person_documents")
        .select("*")
        .eq("young_person_id", youngPersonId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setDocuments(data as any);
      setLoading(false);
    };
    fetch();
  }, [youngPersonId]);

  if (loading) return null;

  const actionCount = documents.filter((d) => d.action_required).length;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="h-5 w-5" />
            Documents
            {actionCount > 0 && (
              <Badge variant="destructive" className="ml-1">{actionCount} action{actionCount > 1 ? "s" : ""}</Badge>
            )}
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => navigate(`/documents?youngPersonId=${youngPersonId}`)}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-all ${doc.action_required ? "border-l-4 border-l-destructive" : ""}`}
                onClick={() => navigate(`/documents?youngPersonId=${youngPersonId}`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{doc.document_type || doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.created_at ? format(new Date(doc.created_at), "PP") : ""}
                    </p>
                  </div>
                </div>
                {doc.action_required && (
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
