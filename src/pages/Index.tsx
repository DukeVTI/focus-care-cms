import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, BarChart3, FileText } from "lucide-react";
import focusLogo from "@/assets/focus-logo.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate("/dashboard");
    return null;
  }

  const features = [
    {
      icon: Users,
      title: "Young Person Management",
      description: "Comprehensive profiles with all relevant information in one place",
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Structured risk assessments with trend analysis and reporting",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Generate council-ready reports with a single click",
    },
    {
      icon: FileText,
      title: "Chronology & Logging",
      description: "Daily observations and comprehensive chronology management",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4 max-w-full">
          <div className="flex items-center gap-2 md:gap-3">
            <img 
              src={focusLogo} 
              alt="FOCUS Logo" 
              className="h-10 w-10 md:h-12 md:w-12 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-base md:text-lg font-bold">FOCUS</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Youth Care Management</p>
            </div>
          </div>
          <Button onClick={() => navigate("/auth")} size="sm" className="md:size-default">
            <span className="hidden sm:inline">Sign In</span>
            <span className="sm:hidden">Sign In</span>
            <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-4 py-12 md:py-20 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
            <Shield className="mr-2 h-4 w-4" />
            Secure & Compliant Platform
          </div>
          <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Modern Youth Care{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Management
            </span>
          </h1>
          <p className="mb-8 text-base text-muted-foreground md:text-lg lg:text-xl">
            Replace spreadsheets and documents with a premium, secure platform designed specifically for youth care organizations. Streamline operations, enhance care quality, and meet compliance requirements.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-orange">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Everything you need to manage care</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive tools designed for youth care professionals
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl border bg-card p-8 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-12 text-center shadow-orange">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to transform your youth care management?
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/90">
            Join organizations that have modernized their care management processes
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 FOCUS Youth Care Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;