
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, BarChart3, BookOpen, Settings, Copy, Loader2, AlertCircle, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface OrgData {
  id: string;
  name: string;
  slug: string;
  tier: string;
  is_active: boolean;
}

interface StudentRow {
  id: string;
  name: string;
  email: string;
  student_id_external: string;
  ethics_certified: boolean;
  status: string;
  created_at: string;
  last_active_at: string | null;
}

interface SemesterRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  student_capacity: number;
}

interface AssignmentRow {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  deadline: string | null;
  is_active: boolean;
  created_at: string;
}

const PartnerPortal = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<OrgData | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [semesters, setSemesters] = useState<SemesterRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadPortalData();
  }, [user]);

  const loadPortalData = async () => {
    setLoading(true);
    try {
      // Find org owned by this user
      const { data: orgData, error: orgErr } = await supabase
        .from("organizations")
        .select("id, name, slug, tier, is_active")
        .eq("owner_user_id", user?.id)
        .maybeSingle();

      if (orgErr) throw orgErr;
      if (!orgData) {
        setError("No organization found for your account. Contact support if you believe this is an error.");
        setLoading(false);
        return;
      }
      if (!orgData.is_active) {
        setError("Your organization account is currently suspended. Please contact support.");
        setLoading(false);
        return;
      }

      setOrg(orgData);

      // Load semesters, students, assignments in parallel
      const [semRes, stuRes, assRes] = await Promise.all([
        supabase
          .from("edu_semesters")
          .select("id, name, start_date, end_date, is_active, student_capacity")
          .eq("organization_id", orgData.id)
          .order("start_date", { ascending: false }),
        supabase
          .from("edu_students")
          .select("id, name, email, student_id_external, ethics_certified, status, created_at, last_active_at")
          .eq("organization_id", orgData.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("edu_assignments")
          .select("id, title, description, difficulty, deadline, is_active, created_at")
          .eq("organization_id", orgData.id)
          .order("created_at", { ascending: false }),
      ]);

      setSemesters(semRes.data || []);
      setStudents(stuRes.data || []);
      setAssignments(assRes.data || []);

      const activeSem = (semRes.data || []).find((s) => s.is_active);
      if (activeSem) setActiveSemesterId(activeSem.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyRegLink = () => {
    if (!org) return;
    const url = `${window.location.origin}/student-register/${org.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Registration link copied!");
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

  const activeStudents = students.filter((s) => s.status === "active").length;
  const certifiedStudents = students.filter((s) => s.ethics_certified).length;
  const activeSemester = semesters.find((s) => s.is_active);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{org?.name}</h1>
              <p className="text-muted-foreground">Partner Portal • <Badge variant="outline">{org?.tier}</Badge></p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyRegLink}>
                <Copy className="h-4 w-4 mr-2" /> Copy Registration Link
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{activeStudents}</div>
              <p className="text-xs text-muted-foreground">Active Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{certifiedStudents}</div>
              <p className="text-xs text-muted-foreground">Ethics Certified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">Assignments</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Semester Banner */}
        {activeSemester && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-medium text-foreground">Active Semester: {activeSemester.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(activeSemester.start_date).toLocaleDateString()} — {new Date(activeSemester.end_date).toLocaleDateString()}
                  {" • "}{students.filter((s) => activeSemesterId && s.status === "active").length}/{activeSemester.student_capacity} enrolled
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={copyRegLink}>
                <GraduationCap className="h-4 w-4 mr-2" /> Share Registration Link
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="students"><Users className="h-4 w-4 mr-1" /> Students</TabsTrigger>
            <TabsTrigger value="assignments"><BookOpen className="h-4 w-4 mr-1" /> Work</TabsTrigger>
            <TabsTrigger value="usage"><BarChart3 className="h-4 w-4 mr-1" /> Usage</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1" /> Settings</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>Students registered for your organization.</CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No students registered yet.</p>
                    <Button variant="link" onClick={copyRegLink}>Share your registration link to get started</Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Ethics</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell className="text-sm">{s.email}</TableCell>
                          <TableCell className="text-sm">{s.student_id_external}</TableCell>
                          <TableCell>
                            <Badge variant={s.ethics_certified ? "default" : "secondary"}>
                              {s.ethics_certified ? "Certified" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={s.status === "active" ? "default" : "secondary"}>
                              {s.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>Manage assignments for your students.</CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No assignments created yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.title}</TableCell>
                          <TableCell><Badge variant="outline">{a.difficulty}</Badge></TableCell>
                          <TableCell>{a.deadline ? new Date(a.deadline).toLocaleDateString() : "—"}</TableCell>
                          <TableCell>
                            <Badge variant={a.is_active ? "default" : "secondary"}>
                              {a.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>API Usage</CardTitle>
                <CardDescription>Monitor your organization's API activity.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Usage analytics will appear here as students begin using the API.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organization:</span>
                    <span className="font-medium">{org?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slug:</span>
                    <span className="font-mono text-xs">{org?.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tier:</span>
                    <Badge variant="outline">{org?.tier}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={org?.is_active ? "default" : "destructive"}>
                      {org?.is_active ? "Active" : "Suspended"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Student Registration Link</p>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={`${window.location.origin}/student-register/${org?.slug}`} className="font-mono text-xs" />
                    <Button size="icon" variant="outline" onClick={copyRegLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartnerPortal;
