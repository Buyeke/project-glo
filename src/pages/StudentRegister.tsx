
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, CheckCircle, AlertCircle, BookOpen, Key, Copy, ArrowRight, ArrowLeft, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  tier: string;
  is_active: boolean;
}

interface SemesterInfo {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  student_capacity: number;
  settings: any;
}

const ETHICS_QUESTIONS = [
  {
    question: "You discover a pattern in the data that could identify a specific individual. What should you do?",
    options: [
      "Report the finding to your instructor and avoid publishing the identified data",
      "Include it in your report as an interesting finding",
      "Share it with classmates for discussion",
      "Post it on social media to raise awareness",
    ],
    correct: 0,
  },
  {
    question: "When publishing research using GLO data, which of the following is required?",
    options: [
      "Include raw case IDs in your methodology",
      "Properly cite the GLO Education API and use anonymized references",
      "Share your API key so others can replicate your work",
      "No attribution is needed for educational use",
    ],
    correct: 1,
  },
  {
    question: "Your API key should be:",
    options: [
      "Shared with teammates for group projects",
      "Posted in your project's public GitHub repository",
      "Kept private and never shared with anyone",
      "Emailed to your instructor for verification",
    ],
    correct: 2,
  },
  {
    question: "If you encounter data suggesting someone is in immediate danger, you should:",
    options: [
      "Ignore it—the data is anonymized anyway",
      "Try to identify and contact the person directly",
      "Report it immediately to your instructor and GLO support",
      "Include it in your research paper",
    ],
    correct: 2,
  },
  {
    question: "Which of these is an acceptable use of GLO Education API data?",
    options: [
      "Selling aggregated insights to third parties",
      "Academic research with proper anonymization and citation",
      "Training commercial AI models without permission",
      "Re-identifying individuals for case studies",
    ],
    correct: 1,
  },
];

const StudentRegister = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [semester, setSemester] = useState<SemesterInfo | null>(null);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Registration form
  const [form, setForm] = useState({
    name: "",
    email: "",
    student_id: "",
  });

  // Ethics quiz
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);

  // Result
  const [apiKey, setApiKey] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (orgSlug) loadOrgData();
  }, [orgSlug]);

  const loadOrgData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch organization by slug
      const { data: orgData, error: orgErr } = await supabase
        .from("organizations")
        .select("id, name, slug, tier, is_active")
        .eq("slug", orgSlug)
        .maybeSingle();

      if (orgErr) throw orgErr;
      if (!orgData) {
        setError("Organization not found. Please check your registration link.");
        setLoading(false);
        return;
      }
      if (!orgData.is_active) {
        setError("This organization's account is currently suspended. Please contact your institution.");
        setLoading(false);
        return;
      }

      setOrg(orgData);

      // Fetch active semester
      const { data: semData, error: semErr } = await supabase
        .from("edu_semesters")
        .select("id, name, start_date, end_date, student_capacity, settings")
        .eq("organization_id", orgData.id)
        .eq("is_active", true)
        .maybeSingle();

      if (semErr) throw semErr;
      if (!semData) {
        setError(`Student registration opens when ${orgData.name} activates a semester. Please contact your instructor.`);
        setLoading(false);
        return;
      }

      setSemester(semData);

      // Count enrolled students
      const { count } = await supabase
        .from("edu_students")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgData.id)
        .eq("semester_id", semData.id);

      setEnrolledCount(count || 0);

      if ((count || 0) >= semData.student_capacity) {
        setError(`Registration is full for this semester (${semData.student_capacity} students max). Contact your instructor.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load organization data.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    ETHICS_QUESTIONS.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    const score = Math.round((correct / ETHICS_QUESTIONS.length) * 100);
    setQuizScore(score);
    setQuizPassed(score >= 80);
    setQuizSubmitted(true);
  };

  const handleRegister = async () => {
    if (!org || !semester) return;
    if (!form.name || !form.email || !form.student_id) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      // Generate API key
      const rawKey = `glo_edu_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
      // Simple hash for storage (in production use proper server-side hashing)
      const encoder = new TextEncoder();
      const data = encoder.encode(rawKey);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      // Get rate limit from semester settings
      const settings = semester.settings as any;
      const rateLimit = settings?.rate_limits?.default || 100;

      const { error: insertErr } = await supabase.from("edu_students").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        student_id_external: form.student_id.trim(),
        organization_id: org.id,
        semester_id: semester.id,
        api_key_hash: keyHash,
        ethics_certified: true,
        ethics_certified_at: new Date().toISOString(),
        ethics_quiz_score: quizScore,
        rate_limit_override: rateLimit,
        status: "active",
        role: "student",
      });

      if (insertErr) {
        if (insertErr.message.includes("duplicate") || insertErr.message.includes("unique")) {
          throw new Error("A student with this email or student ID is already registered.");
        }
        throw insertErr;
      }

      setApiKey(rawKey);

      // Send registration email
      try {
        await supabase.functions.invoke("send-partner-email", {
          body: {
            type: "student_registered",
            to: form.email.trim(),
            data: {
              student_name: form.name,
              organization_name: org.name,
              api_key: rawKey,
              rate_limit: rateLimit,
            },
          },
        });
      } catch {
        // Non-critical
      }

      setStep(4);
    } catch (err: any) {
      toast.error(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API key copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading registration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader>
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Registration Unavailable</CardTitle>
            <CardDescription className="text-base">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/partners">Back to Partners</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercent = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">{org?.name}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Student Registration</h1>
          {semester && (
            <p className="text-muted-foreground">
              {semester.name} • {enrolledCount}/{semester.student_capacity} students enrolled
            </p>
          )}
          <Progress value={progressPercent} className="mt-6 max-w-md mx-auto" />
          <div className="flex justify-between max-w-md mx-auto mt-2 text-xs text-muted-foreground">
            <span className={step >= 1 ? "text-primary font-medium" : ""}>Details</span>
            <span className={step >= 2 ? "text-primary font-medium" : ""}>Ethics Quiz</span>
            <span className={step >= 3 ? "text-primary font-medium" : ""}>Confirm</span>
            <span className={step >= 4 ? "text-primary font-medium" : ""}>Complete</span>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step 1: Student Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
              <CardDescription>Enter your student information to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label>University Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="student@university.ac.ke"
                    required
                  />
                </div>
                <div>
                  <Label>Student ID *</Label>
                  <Input
                    value={form.student_id}
                    onChange={(e) => setForm((f) => ({ ...f, student_id: e.target.value }))}
                    placeholder="e.g. CS/2024/001"
                    required
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!form.name || !form.email || !form.student_id) {
                      toast.error("Please fill in all fields.");
                      return;
                    }
                    setStep(2);
                  }}
                >
                  Continue to Ethics Quiz <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Ethics Quiz */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Ethics Certification Quiz
              </CardTitle>
              <CardDescription>
                You must score at least 80% to proceed. This ensures responsible use of sensitive data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!quizSubmitted ? (
                <div className="space-y-6">
                  {ETHICS_QUESTIONS.map((q, qi) => (
                    <div key={qi} className="space-y-3">
                      <p className="font-medium text-sm">
                        {qi + 1}. {q.question}
                      </p>
                      <RadioGroup
                        value={answers[qi]?.toString()}
                        onValueChange={(v) => setAnswers((a) => ({ ...a, [qi]: parseInt(v) }))}
                      >
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-start space-x-2">
                            <RadioGroupItem value={oi.toString()} id={`q${qi}-o${oi}`} />
                            <Label htmlFor={`q${qi}-o${oi}`} className="text-sm font-normal cursor-pointer">
                              {opt}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(answers).length < ETHICS_QUESTIONS.length}
                    >
                      Submit Quiz
                    </Button>
                  </div>
                </div>
              ) : quizPassed ? (
                <div className="text-center py-6">
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Quiz Passed!</h3>
                  <p className="text-muted-foreground mb-4">
                    You scored {quizScore}%. You're ready to register.
                  </p>
                  <Button onClick={() => setStep(3)}>
                    Continue to Registration <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Quiz Not Passed</h3>
                  <p className="text-muted-foreground mb-4">
                    You scored {quizScore}%. You need at least 80% to proceed.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuizSubmitted(false);
                      setAnswers({});
                    }}
                  >
                    Retake Quiz
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Registration</CardTitle>
              <CardDescription>Review your details and complete registration.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{form.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{form.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Student ID:</span>
                    <span className="font-medium">{form.student_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Institution:</span>
                    <span className="font-medium">{org?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semester:</span>
                    <span className="font-medium">{semester?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ethics Quiz:</span>
                    <Badge variant="default">{quizScore}% Passed</Badge>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button className="flex-1" onClick={handleRegister} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                      </>
                    ) : (
                      <>Complete Registration</>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Key className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Registration Complete!</CardTitle>
              <CardDescription className="text-base">
                Welcome to the {org?.name} GLO Education API program.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-lg p-4">
                <Label className="text-xs text-muted-foreground">Your API Key (save this — it won't be shown again)</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 text-sm bg-background p-2 rounded border break-all font-mono">
                    {apiKey}
                  </code>
                  <Button size="icon" variant="outline" onClick={copyApiKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 text-sm space-y-2">
                <p className="font-medium">Quick Start:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Your daily API limit: <strong>{(semester?.settings as any)?.rate_limits?.default || 100} calls/day</strong></li>
                  <li>All data is automatically anonymized for your protection</li>
                  <li>Always cite GLO Education API in your research</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href="/education/docs/getting-started" target="_blank">
                    <BookOpen className="h-4 w-4 mr-2" /> Getting Started
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/education/examples" target="_blank">
                    <BookOpen className="h-4 w-4 mr-2" /> Sample Queries
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/student-portal">
                    <GraduationCap className="h-4 w-4 mr-2" /> Student Portal
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentRegister;
