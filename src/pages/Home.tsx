
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Heart, Users, MessageCircle, Calendar, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome to GLO
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Global Learning Opportunity - Connecting communities, sharing resources, and building brighter futures together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/services">
                Explore Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Community Support</CardTitle>
              <CardDescription>
                Connect with others and access vital community resources
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Essential Services</CardTitle>
              <CardDescription>
                Access healthcare, housing, food assistance, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>24/7 Chat Support</CardTitle>
              <CardDescription>
                Get help anytime with our multilingual AI assistant
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Get Started Today</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Button variant="outline" className="h-auto p-6 flex flex-col gap-2" asChild>
              <Link to="/resources">
                <Users className="h-8 w-8 mb-2" />
                <span>Find Resources</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-6 flex flex-col gap-2" asChild>
              <Link to="/services">
                <Heart className="h-8 w-8 mb-2" />
                <span>Book Services</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-6 flex flex-col gap-2" asChild>
              <Link to="/dashboard">
                <Calendar className="h-8 w-8 mb-2" />
                <span>My Dashboard</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-6 flex flex-col gap-2" asChild>
              <Link to="/contact">
                <MessageCircle className="h-8 w-8 mb-2" />
                <span>Get Help</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I access services?</AccordionTrigger>
              <AccordionContent>
                You can browse our services page or use our AI chat assistant to get personalized recommendations based on your needs. Our services include healthcare, housing assistance, food support, and more.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is the platform free to use?</AccordionTrigger>
              <AccordionContent>
                Yes! GLO is completely free to use. We're committed to making essential resources and services accessible to everyone in our community.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Do you support multiple languages?</AccordionTrigger>
              <AccordionContent>
                Absolutely! Our platform supports multiple languages including English, Swahili, Sheng, and Arabic. Our AI assistant can communicate in your preferred language.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How do I create an account?</AccordionTrigger>
              <AccordionContent>
                Click on "Sign In" in the top navigation to create your account. You can also start using our chat assistant immediately without creating an account.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Admin Access */}
      <div className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Platform Administration</p>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin-login" className="text-muted-foreground hover:text-foreground">
                Admin Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
