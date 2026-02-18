
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Eye, Copy, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const TIER_PRICING: Record<string, number> = {
  essentials: 300,
  standard: 600,
  premium: 900,
};

interface PartnerApplication {
  id: string;
  organization_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  institution_type: string;
  description: string | null;
  selected_tier: string;
  expected_student_count: number | null;
  payment_status: string;
  payment_amount: number | null;
  invoice_sent: boolean;
  status: string;
  admin_notes: string | null;
  organization_id: string | null;
  created_at: string;
}

const PartnerApplications = ({ onApplicationApproved }: { onApplicationApproved?: () => void }) => {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("partner_applications" as any)
      .select("*")
      .order("created_at", { ascending: false }) as any);
    if (error) {
      toast({ title: "Error loading applications", description: error.message, variant: "destructive" });
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (name: string): string => {
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return slug;
  };

  const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const { data } = await supabase.from("organizations").select("id").eq("slug", slug).maybeSingle();
      if (!data) break;
      slug = `${baseSlug}-${++counter}`;
    }
    return slug;
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate unique slug
      const slug = await ensureUniqueSlug(generateSlug(selectedApp.organization_name));

      // Create organization
      const { data: org, error: orgError } = await supabase.from("organizations").insert({
        name: selectedApp.organization_name,
        slug,
        contact_email: selectedApp.contact_email,
        contact_phone: selectedApp.contact_phone,
        website: selectedApp.website,
        description: selectedApp.description,
        tier: selectedApp.selected_tier,
        owner_user_id: user.id,
      }).select("id").single();

      if (orgError) throw orgError;

      // Update application
      const { error: updateError } = await (supabase.from("partner_applications" as any).update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
        organization_id: org.id,
        payment_status: "pending",
      } as any).eq("id", selectedApp.id) as any);

      if (updateError) throw updateError;

      // Send approval email
      const siteUrl = window.location.origin;
      try {
        await supabase.functions.invoke("send-partner-email", {
          body: {
            type: "application_approved",
            to: selectedApp.contact_email,
            data: {
              contact_name: selectedApp.contact_name,
              organization_name: selectedApp.organization_name,
              tier: selectedApp.selected_tier,
              amount: TIER_PRICING[selectedApp.selected_tier] || selectedApp.payment_amount,
              student_registration_url: `${siteUrl}/student-register/${slug}`,
            },
          },
        });
      } catch {
        // Non-critical
      }

      toast({
        title: "Application Approved!",
        description: `Organization created. Student registration: /student-register/${slug}`,
      });

      setSelectedApp(null);
      setAdminNotes("");
      fetchApplications();
      onApplicationApproved?.();
    } catch (error: any) {
      toast({ title: "Error approving application", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase.from("partner_applications" as any).update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      } as any).eq("id", selectedApp.id) as any);

      if (error) throw error;

      // Send rejection email
      try {
        await supabase.functions.invoke("send-partner-email", {
          body: {
            type: "application_rejected",
            to: selectedApp.contact_email,
            data: {
              contact_name: selectedApp.contact_name,
              organization_name: selectedApp.organization_name,
              admin_notes: adminNotes,
            },
          },
        });
      } catch {
        // Non-critical
      }

      toast({ title: "Application rejected" });
      setSelectedApp(null);
      setAdminNotes("");
      fetchApplications();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Partner Applications {pendingCount > 0 && <Badge variant="destructive" className="ml-2">{pendingCount} pending</Badge>}</CardTitle>
              <CardDescription>Review and approve institution partnership applications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : applications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No applications yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.organization_name}</TableCell>
                    <TableCell className="text-sm">{app.contact_email}</TableCell>
                    <TableCell><Badge variant="outline">{app.institution_type}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{app.selected_tier}</Badge></TableCell>
                    <TableCell>{app.expected_student_count || "—"}</TableCell>
                    <TableCell><Badge variant={statusBadge(app.status) as any}>{app.status}</Badge></TableCell>
                    <TableCell className="text-sm">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedApp(app); setAdminNotes(app.admin_notes || ""); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>{selectedApp?.organization_name}</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Contact:</span> {selectedApp.contact_name}</div>
                <div><span className="text-muted-foreground">Email:</span> {selectedApp.contact_email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selectedApp.contact_phone || "—"}</div>
                <div><span className="text-muted-foreground">Website:</span> {selectedApp.website || "—"}</div>
                <div><span className="text-muted-foreground">Type:</span> {selectedApp.institution_type}</div>
                <div><span className="text-muted-foreground">Expected Students:</span> {selectedApp.expected_student_count || "—"}</div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Selected Plan: {selectedApp.selected_tier}</p>
                <p className="text-lg font-bold text-primary">
                  USD {TIER_PRICING[selectedApp.selected_tier] || selectedApp.payment_amount}
                </p>
              </div>

              {selectedApp.description && (
                <div>
                  <Label className="text-muted-foreground">Use Case Description</Label>
                  <p className="text-sm mt-1">{selectedApp.description}</p>
                </div>
              )}

              {selectedApp.status === "approved" && selectedApp.organization_id && (
                <div className="bg-primary/5 rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">Student Registration Link</p>
                  <code className="text-xs break-all">/student-register/{generateSlug(selectedApp.organization_name)}</code>
                </div>
              )}

              {selectedApp.status === "pending" && (
                <>
                  <div>
                    <Label>Admin Notes</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Internal notes or rejection reason..."
                      rows={3}
                    />
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="destructive" onClick={handleReject} disabled={processing}>
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                    <Button onClick={handleApprove} disabled={processing}>
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve & Create Org
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerApplications;
