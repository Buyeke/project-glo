
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BarChart3, BookOpen, GraduationCap, Loader2, AlertCircle, Plus, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  organization_id: string;
  semester_id: string;
  ethics_certified: boolean;
  rate_limit_override: number | null;
  status: string;
}

interface AssignmentInfo {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  deadline: string | null;
  is_active: boolean;
  starter_query: string | null;
}

interface ProjectInfo {
  id: string;
  title: string;
  description: string | null;
  repo_url: string | null;
  status: string;
  grade: string | null;
  faculty_comments: string | null;
  submitted_at: string | null;
  assignment_id: string | null;
  created_at: string;
}

interface UsageInfo {
  endpoint: string;
  count: number;
  last_used: string;
}

const StudentPortal = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [orgName, setOrgName] = useState("");
  const [assignments, setAssignments] = useState<AssignmentInfo[]>([]);
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    title: "",
    description: "",
    repo_url: "",
    assignment_id: "",
  });

  useEffect(() => {
    if (user) loadStudentData();
  }, [user]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      // Find student record by user_id
      const { data: stuData, error: stuErr } = await supabase
        .from("edu_students")
        .select("id, name, email, organization_id, semester_id, ethics_certified, rate_limit_override, status")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (stuErr) throw stuErr;
      if (!stuData) {
        setError("No student account found. Please register through your institution's registration link.");
        setLoading(false);
        return;
      }

      setStudent(stuData);

      // Load org name, assignments, projects in parallel
      const [orgRes, assRes, projRes] = await Promise.all([
        supabase.from("organizations").select("name").eq("id", stuData.organization_id).single(),
        supabase
          .from("edu_assignments")
          .select("id, title, description, difficulty, deadline, is_active, starter_query")
          .eq("organization_id", stuData.organization_id)
          .eq("is_active", true)
          .order("deadline", { ascending: true }),
        supabase
          .from("edu_projects")
          .select("id, title, description, repo_url, status, grade, faculty_comments, submitted_at, assignment_id, created_at")
          .eq("student_id", stuData.id)
          .order("created_at", { ascending: false }),
      ]);

      setOrgName(orgRes.data?.name || "");
      setAssignments(assRes.data || []);
      setProjects(projRes.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProject = async () => {
    if (!student || !submitForm.title) {
      toast.error("Project title is required.");
      return;
    }

    try {
      const { error } = await supabase.from("edu_projects").insert({
        title: submitForm.title.trim(),
        description: submitForm.description.trim() || null,
        repo_url: submitForm.repo_url.trim() || null,
        assignment_id: submitForm.assignment_id || null,
        student_id: student.id,
        organization_id: student.organization_id,
        status: "draft",
      });

      if (error) throw error;

      toast.success("Project created!");
      setShowSubmit(false);
      setSubmitForm({ title: "", description: "", repo_url: "", assignment_id: "" });
      loadStudentData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const submitProject = async (projectId: string) => {
    const { error } = await supabase
      .from("edu_projects")
      .update({ status: "submitted", submitted_at: new Date().toISOString() })
      .eq("id", projectId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Project submitted for review!");
      loadStudentData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader>
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Access Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColor = (s: string) => {
    switch (s) {
      case "submitted": return "default";
      case "graded": return "secondary";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Student Portal</h1>
              <p className="text-muted-foreground">{orgName} • {student?.name}</p>
            </div>
            <Badge variant={student?.status === "active" ? "default" : "secondary"}>
              {student?.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{student?.rate_limit_override || 100}</div>
              <p className="text-xs text-muted-foreground">Daily API Limit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">Active Assignments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">My Projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                <Badge variant={student?.ethics_certified ? "default" : "destructive"}>
                  {student?.ethics_certified ? "Certified" : "Pending"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Ethics Status</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="assignments"><BookOpen className="h-4 w-4 mr-1" /> Assignments</TabsTrigger>
            <TabsTrigger value="projects"><GraduationCap className="h-4 w-4 mr-1" /> Projects</TabsTrigger>
            <TabsTrigger value="resources"><BarChart3 className="h-4 w-4 mr-1" /> Resources</TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Active Assignments</CardTitle>
                <CardDescription>Assignments from your instructors.</CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No active assignments.</p>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((a) => (
                      <Card key={a.id} className="border">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium">{a.title}</h3>
                              {a.description && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">{a.difficulty}</Badge>
                                {a.deadline && (
                                  <Badge variant="secondary">
                                    Due: {new Date(a.deadline).toLocaleDateString()}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSubmitForm((f) => ({ ...f, assignment_id: a.id }));
                                setShowSubmit(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Submit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Projects</CardTitle>
                  <CardDescription>Your submitted and draft projects.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowSubmit(true)}>
                  <Plus className="h-4 w-4 mr-2" /> New Project
                </Button>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No projects yet. Create one to get started.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div>
                              <span className="font-medium">{p.title}</span>
                              {p.repo_url && (
                                <a href={p.repo_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary">
                                  <ExternalLink className="h-3 w-3 inline" />
                                </a>
                              )}
                            </div>
                            {p.faculty_comments && (
                              <p className="text-xs text-muted-foreground mt-1">Feedback: {p.faculty_comments}</p>
                            )}
                          </TableCell>
                          <TableCell><Badge variant={statusColor(p.status) as any}>{p.status}</Badge></TableCell>
                          <TableCell>{p.grade || "—"}</TableCell>
                          <TableCell className="text-sm">{p.submitted_at ? new Date(p.submitted_at).toLocaleDateString() : "—"}</TableCell>
                          <TableCell>
                            {p.status === "draft" && (
                              <Button size="sm" variant="outline" onClick={() => submitProject(p.id)}>
                                Submit
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Documentation & Resources</CardTitle>
                <CardDescription>Everything you need to get started with the GLO Education API.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="border hover:shadow-md transition-shadow">
                    <CardContent className="pt-6 text-center">
                      <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-medium mb-1">Getting Started Guide</h3>
                      <p className="text-sm text-muted-foreground mb-3">Learn how to make your first API call.</p>
                      <Button size="sm" variant="outline" asChild>
                        <a href="/education/docs/getting-started" target="_blank">Read Guide</a>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="border hover:shadow-md transition-shadow">
                    <CardContent className="pt-6 text-center">
                      <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-medium mb-1">Sample Queries</h3>
                      <p className="text-sm text-muted-foreground mb-3">Ready-to-use query examples.</p>
                      <Button size="sm" variant="outline" asChild>
                        <a href="/education/examples" target="_blank">View Examples</a>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="border hover:shadow-md transition-shadow">
                    <CardContent className="pt-6 text-center">
                      <GraduationCap className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-medium mb-1">API Reference</h3>
                      <p className="text-sm text-muted-foreground mb-3">Complete endpoint documentation.</p>
                      <Button size="sm" variant="outline" asChild>
                        <a href="/education/docs/api-reference" target="_blank">API Docs</a>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="border hover:shadow-md transition-shadow">
                    <CardContent className="pt-6 text-center">
                      <AlertCircle className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-medium mb-1">FAQ</h3>
                      <p className="text-sm text-muted-foreground mb-3">Common questions answered.</p>
                      <Button size="sm" variant="outline" asChild>
                        <a href="/education/docs/faq" target="_blank">View FAQ</a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Submit Project Dialog */}
      <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Project</DialogTitle>
            <DialogDescription>Create a new project submission.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project Title *</Label>
              <Input
                value={submitForm.title}
                onChange={(e) => setSubmitForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. GBV Trend Analysis - Nairobi County"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={submitForm.description}
                onChange={(e) => setSubmitForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of your project..."
                rows={3}
              />
            </div>
            <div>
              <Label>Repository URL (optional)</Label>
              <Input
                value={submitForm.repo_url}
                onChange={(e) => setSubmitForm((f) => ({ ...f, repo_url: e.target.value }))}
                placeholder="https://github.com/..."
              />
            </div>
            {assignments.length > 0 && (
              <div>
                <Label>Link to Assignment (optional)</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={submitForm.assignment_id}
                  onChange={(e) => setSubmitForm((f) => ({ ...f, assignment_id: e.target.value }))}
                >
                  <option value="">— None —</option>
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmit(false)}>Cancel</Button>
            <Button onClick={handleSubmitProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentPortal;
