import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogPostCTAProps {
  variant?: "default" | "support" | "resources";
}

const BlogPostCTA = ({ variant = "default" }: BlogPostCTAProps) => {
  if (variant === "support") {
    return (
      <Card className="bg-primary text-primary-foreground mt-8">
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-10 w-10 mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">Need Support Right Now?</h3>
          <p className="mb-4 opacity-90">
            Our AI assistant is available 24/7 to help you find the resources you need.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/contact">
              Connect with GLO
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (variant === "resources") {
    return (
      <Card className="bg-muted/50 mt-8">
        <CardContent className="p-6 text-center">
          <BookOpen className="h-10 w-10 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2 text-foreground">Explore More Resources</h3>
          <p className="mb-4 text-muted-foreground">
            Browse our collection of guides, articles, and support materials.
          </p>
          <Button variant="outline" size="lg" asChild>
            <Link to="/resources">
              Find Local Support Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 mt-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Looking for more support?
            </h3>
            <p className="text-muted-foreground">
              We're here to help you find the resources you need.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/resources">Browse Resources</Link>
            </Button>
            <Button asChild>
              <Link to="/contact">
                Get Help
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogPostCTA;
