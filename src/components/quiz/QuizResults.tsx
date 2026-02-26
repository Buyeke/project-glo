import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { MatchingResult } from "@/hooks/useServiceMatching";

interface QuizResultsProps {
  result: MatchingResult;
  onReset: () => void;
}

export const QuizResults = ({ result, onReset }: QuizResultsProps) => {
  const hasProviders = result.providers.length > 0;
  const hasServices = result.services.length > 0;

  return (
    <div className="bg-card rounded-2xl border border-primary/20 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          {result.isEmergency ? "Immediate Support Available" : "We Found Support For You"}
        </h3>
        <p className="text-muted-foreground">
          {hasProviders
            ? `${result.providers.length} verified service provider${result.providers.length > 1 ? 's' : ''} matched to your needs.`
            : "Here are services that can help you."}
        </p>
      </div>

      {/* Matched Providers */}
      {hasProviders && (
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">
            Verified Providers
          </h4>
          {result.providers.slice(0, 3).map((match) => (
            <div
              key={match.provider.id}
              className="rounded-xl border border-border bg-muted/30 p-4 space-y-2"
            >
              <div className="flex items-start justify-between">
                <h5 className="font-bold text-foreground">{match.provider.provider_name}</h5>
                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {Math.round(match.matchScore)}% match
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {match.matchedServiceTypes.map((type) => (
                  <span key={type} className="text-xs bg-accent/50 text-accent-foreground px-2 py-0.5 rounded">
                    {type.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                {match.provider.contact_info?.phone && (
                  <a href={`tel:${match.provider.contact_info.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Phone className="h-3.5 w-3.5" />
                    {match.provider.contact_info.phone}
                  </a>
                )}
                {match.provider.contact_info?.email && (
                  <a href={`mailto:${match.provider.contact_info.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Mail className="h-3.5 w-3.5" />
                    {match.provider.contact_info.email}
                  </a>
                )}
                {match.provider.location_data?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {match.provider.location_data.address}
                  </div>
                )}
              </div>

              {match.provider.languages_supported && (
                <p className="text-xs text-muted-foreground">
                  Languages: {match.provider.languages_supported.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Matched Services */}
      {hasServices && (
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">
            Available Services
          </h4>
          <div className="bg-muted/50 rounded-xl p-4">
            <ul className="space-y-2">
              {result.services.slice(0, 4).map((match) => (
                <li key={match.service.id} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  <div>
                    <span className="text-foreground font-medium">{match.service.title}</span>
                    <p className="text-sm text-muted-foreground">{match.service.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* No results fallback */}
      {!hasProviders && !hasServices && (
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-muted-foreground">
            We're still growing our network. Please reach out to us directly for personalized help.
          </p>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <Button asChild className="w-full h-14 text-lg font-semibold">
          <Link to="/contact">
            Get Personalized Help
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button variant="ghost" onClick={onReset} className="h-12">
          Start Over
        </Button>
      </div>
    </div>
  );
};
