import { Component, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background flex items-center justify-center p-4">
          <Card className="max-w-md border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-12 w-12 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-bold mb-2">Something Went Wrong</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    An unexpected error occurred. Please try refreshing the page or contact support if the issue persists.
                  </p>
                  <details className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mb-4">
                    <summary className="cursor-pointer font-medium">Error Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap break-words overflow-auto max-h-48">
                      {this.state.error?.message || "Unknown error"}
                    </pre>
                  </details>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded font-medium text-sm hover:bg-primary/90 transition-colors"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
