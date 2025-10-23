import focusLogo from "@/assets/focus-logo.jpg";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          {/* Outer glow rings */}
          <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-pulse-slow blur-3xl scale-150"></div>
          <div className="absolute inset-0 rounded-full bg-primary opacity-10 animate-pulse-slow blur-2xl scale-125" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Logo container */}
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary to-primary/90 shadow-orange p-1 animate-in zoom-in duration-700">
            <div className="h-full w-full rounded-full bg-card/95 backdrop-blur-sm p-4 flex items-center justify-center">
              <img 
                src={focusLogo} 
                alt="FOCUS Logo" 
                className="h-full w-full object-contain rounded-full animate-in zoom-in duration-500"
                style={{ animationDelay: '0.3s' }}
              />
            </div>
          </div>
          
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" style={{ animationDuration: '2s' }}></div>
        </div>
        
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '0.4s' }}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent mb-2">
            FOCUS
          </h1>
          <p className="text-sm text-muted-foreground tracking-wide">NextGen Care Support</p>
          <div className="mt-4 flex justify-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};