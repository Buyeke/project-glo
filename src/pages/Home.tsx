import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const Home = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to GLO</h1>
      <p className="mb-4">
        This is the home page of our application.
      </p>

      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar />
        </CardContent>
        <CardFooter>
          <Badge>New</Badge>
        </CardFooter>
      </Card>

      <Accordion type="single" collapsible className="w-[400px]">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it animated?</AccordionTrigger>
          <AccordionContent>
            Yes. It's animated using CSS transitions, making it fast and
            performant.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is it styled with Radix Themes?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that matches the other components
            from Radix Themes.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground mb-2">Admin access</p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin-login">Admin Login</Link>
        </Button>
      </div>
    </div>
  );
};

export default Home;
