import { Shield, Lock, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface TrustBadgeProps {
  variant?: "inline" | "card" | "minimal";
  showLink?: boolean;
  className?: string;
}

const TrustBadge = ({ variant = "inline", showLink = true, className = "" }: TrustBadgeProps) => {
  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
        <Lock className="h-3 w-3" />
        <span>Confidential & Secure</span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
            <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-green-800 dark:text-green-200 text-sm mb-1">
              Your information is protected
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              Confidential and shared only with verified, independent partner organizations for service coordination.
              {showLink && (
                <>
                  {" "}
                  <Link to="/privacy-policy" className="underline hover:text-green-900 dark:hover:text-green-100">
                    Privacy Policy
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <div className="flex items-center gap-1.5">
        <Lock className="h-4 w-4 text-green-600" />
        <span>Confidential</span>
      </div>
      <span className="text-muted-foreground/50">•</span>
      <div className="flex items-center gap-1.5">
        <Eye className="h-4 w-4 text-blue-600" />
        <span>Only shared with verified partner organizations</span>
      </div>
      {showLink && (
        <>
          <span className="text-muted-foreground/50">•</span>
          <Link to="/privacy-policy" className="underline hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </>
      )}
    </div>
  );
};

export default TrustBadge;
