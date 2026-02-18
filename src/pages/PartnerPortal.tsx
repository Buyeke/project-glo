
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Users, BarChart3, BookOpen, Settings, Copy, Loader2, AlertCircle, GraduationCap, Upload, FileText } from "lucide-react";
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
  status: string;
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

interface UsageStat {
  endpoint: string;
  total_calls: number;
  error_count: number;
  avg_response_ms: number;
}

const PartnerPortal = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<OrgData | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [semesters, setSemesters] = useState<SemesterRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStat[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResults, setBulkResults] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) loadPortalData();
  }, [user]);

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const { data: orgData, error: orgErr } = await supabase
        .from("organizations")
        .select("id, name, slug, tier, is_active, status")
        .eq("owner_user_id", user?.id)
        .maybeSingle();

      if (orgErr) throw orgErr;
      if (!orgData) {
        setError("No organization found for your account.");
        setLoading(false);
        return;
      }

      const orgWithStatus = { ...orgData, status: (orgData as any).status || 'active' } as OrgData;

      if (orgWithStatus.status === 'suspended') {
        setError("Your organization account is currently suspended. Please contact support.");
        setLoading(false);
        return;
      }
      if (orgWithStatus.status === 'archived') {
        setError("Your organization has been archived. Please contact support.");
        setLoading(false);
        return;
      }

      setOrg(orgWithStatus);

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

      // Load usage analytics
      try {
        const { data: usageData } = await supabase
          .from("edu_api_usage")
          .select("endpoint, status_code, response_time_ms")
          .eq("organization_id", orgData.id)
          .order("created_at", { ascending: false })
          .limit(1000);

        if (usageData && usageData.length > 0) {
          const grouped: Record<string, { total: number; errors: number; totalMs: number }> = {};
          usageData.forEach((u) => {
            if (!grouped[u.endpoint]) grouped[u.endpoint] = { total: 0, errors: 0, totalMs: 0 };
            grouped[u.endpoint].total++;
            if (u.status_code && u.status_code >= 400) grouped[u.endpoint].errors++;
            grouped[u.endpoint].totalMs += u.response_time_ms || 0;
          });
          setUsageStats(
            Object.entries(grouped).map(([endpoint, stats]) => ({
              endpoint,
              total_calls: stats.total,
              error_count: stats.errors,
              avg_response_ms: Math.round(stats.totalMs / stats.total),
            })).sort((a, b) => b.total_calls - a.total_calls)
          );
        }
      } catch {
        // Non-critical
      }
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

  const handleBulkImport = async (file: File) => {
    if (!org || !activeSemesterId) {
      toast.error("No active semester. Create one before importing students.");
      return;
    }

    setBulkImporting(true);
    setBulkResults(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");

      const header = lines[0].toLowerCase();
      const hasName = header.includes("name");
      const hasEmail = header.includes("email");
      if (!hasName || !hasEmail) throw new Error("CSV must have 'name' and 'email' columns.");

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const nameIdx = headers.indexOf("name");
      const emailIdx = headers.indexOf("email");
      const idIdx = headers.indexOf("student_id");

      let success = 0;
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        const name = cols[nameIdx] || "";
        const email = cols[emailIdx] || "";
        const studentId = idIdx >= 0 ? cols[idIdx] || `IMPORT-${i}` : `IMPORT-${i}`;

        if (!name || !email) {
          errors.push(`Row ${i + 1}: Missing name or email`);
          continue;
        }

        const { error: insertErr } = await supabase.from("edu_students").insert({
          name,
          email,
          student_id_external: studentId,
          organization_id: org.id,
          semester_id: activeSemesterId,
          ethics_certified: false,
          status: "active",
          role: "student",
        });

        if (insertErr) {
          errors.push(`Row ${i + 1} (${email}): ${insertErr.message}`);
        } else {
          success++;
        }
      }

      setBulkResults({ success, errors });
      if (success > 0) {
        toast.success(`${success} students imported successfully!`);
        loadPortalData();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBulkImporting(false);
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

  const activeStudents = students.filter((s) => s.status === "active").length;
  const certifiedStudents = students.filter((s) => s.ethics_certified).length;
  const activeSemester = semesters.find((s) => s.is_active);
  const totalApiCalls = usageStats.reduce((sum, u) => sum + u.total_calls, 0);

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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
              <div className="text-2xl font-bold">{totalApiCalls}</div>
              <p className="text-xs text-muted-foreground">Total API Calls</p>
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
                  {" • "}{activeStudents}/{activeSemester.student_capacity} enrolled
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={copyRegLink}>
                <GraduationCap className="h-4 w-4 mr-2" /> Share Registration Link
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 max-w-xl">
            <TabsTrigger value="students"><Users className="h-4 w-4 mr-1 hidden sm:inline" /> Students</TabsTrigger>
            <TabsTrigger value="assignments"><BookOpen className="h-4 w-4 mr-1 hidden sm:inline" /> Work</TabsTrigger>
            <TabsTrigger value="usage"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Usage</TabsTrigger>
            <TabsTrigger value="resources"><FileText className="h-4 w-4 mr-1 hidden sm:inline" /> Resources</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1 hidden sm:inline" /> Settings</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Enrolled Students</CardTitle>
                  <CardDescription>Students registered for your organization.</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowBulkImport(true)}>
                  <Upload className="h-4 w-4 mr-2" /> Bulk Import
                </Button>
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
                <CardTitle>API Usage Analytics</CardTitle>
                <CardDescription>Monitor your organization's API activity.</CardDescription>
              </CardHeader>
              <CardContent>
                {usageStats.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No API usage data yet. Analytics will appear as students begin using the API.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Total Calls</TableHead>
                        <TableHead>Errors</TableHead>
                        <TableHead>Error Rate</TableHead>
                        <TableHead>Avg Response</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usageStats.map((u) => (
                        <TableRow key={u.endpoint}>
                          <TableCell className="font-mono text-sm">{u.endpoint}</TableCell>
                          <TableCell>{u.total_calls}</TableCell>
                          <TableCell>{u.error_count}</TableCell>
                          <TableCell>
                            <Badge variant={u.error_count / u.total_calls > 0.1 ? "destructive" : "outline"}>
                              {((u.error_count / u.total_calls) * 100).toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>{u.avg_response_ms}ms</TableCell>
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
                <CardDescription>Links and guides for you and your students.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="border hover:shadow-md transition-shadow">
                    <CardContent className="pt-6 text-center">
                      <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-medium mb-1">Getting Started Guide</h3>
                      <p className="text-sm text-muted-foreground mb-3">For students making their first API call.</p>
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
                    <Badge variant={org?.status === "active" ? "default" : "destructive"}>
                      {org?.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Student Registration Link</Label>
                  <div className="flex items-center gap-2 mt-1">
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

      {/* Bulk Import Dialog */}
      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Import Students</DialogTitle>
            <DialogDescription>
              Upload a CSV file with columns: <code className="text-xs bg-muted px-1 rounded">name, email, student_id</code>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">
                Choose a CSV file to import students. They will be added to the active semester.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBulkImport(file);
                }}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={bulkImporting}>
                {bulkImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {bulkImporting ? "Importing..." : "Select CSV File"}
              </Button>
            </div>

            {bulkResults && (
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p className="font-medium text-primary">{bulkResults.success} students imported successfully.</p>
                {bulkResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-destructive">{bulkResults.errors.length} errors:</p>
                    <ul className="list-disc pl-5 mt-1 text-xs text-muted-foreground max-h-32 overflow-auto">
                      {bulkResults.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">CSV format example:</p>
              <pre className="bg-muted p-2 rounded text-xs">name,email,student_id{"\n"}Jane Doe,jane@uni.ac.ke,CS/2024/001{"\n"}John Smith,john@uni.ac.ke,CS/2024/002</pre>
              <p className="mt-2">Note: Imported students will need to complete the ethics quiz on first login.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBulkImport(false); setBulkResults(null); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerPortal;
