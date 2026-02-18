import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Plus, FileText, CalendarIcon, ClipboardList, Ban, Archive, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import PartnerApplications from './PartnerApplications';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 7 }, (_, i) => 2024 + i);

interface Organization {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  description: string | null;
  tier: string;
  is_active: boolean;
  status: string;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  billing_period_month: number;
  billing_period_year: number;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

const PartnerManagement = () => {
  const [view, setView] = useState<'partners' | 'applications'>('partners');
  const [partners, setPartners] = useState<Organization[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Organization | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [loading, setLoading] = useState(true);

  // Partner form state
  const [partnerForm, setPartnerForm] = useState({
    name: '', contact_email: '', contact_phone: '', website: '', description: '', tier: 'community'
  });

  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    billing_period_month: String(new Date().getMonth() + 1),
    billing_period_year: String(new Date().getFullYear()),
    amount: '',
    currency: 'USD',
    description: '',
    due_date: undefined as Date | undefined,
    notes: ''
  });

  useEffect(() => { fetchPartners(); }, []);

  useEffect(() => {
    if (selectedPartner) fetchInvoices(selectedPartner.id);
  }, [selectedPartner]);

  const fetchPartners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, slug, contact_email, contact_phone, website, description, tier, is_active, status, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error loading partners', description: error.message, variant: 'destructive' });
    } else {
      setPartners((data as any[]) || []);
    }
    setLoading(false);
  };

  const updateOrgStatus = async (orgId: string, newStatus: string) => {
    const isActive = newStatus === 'active';
    const { error } = await supabase
      .from('organizations')
      .update({ status: newStatus, is_active: isActive } as any)
      .eq('id', orgId);
    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Organization ${newStatus}` });
      fetchPartners();
      if (selectedPartner?.id === orgId) {
        setSelectedPartner({ ...selectedPartner, status: newStatus, is_active: isActive });
      }
    }
  };

  const fetchInvoices = async (orgId: string) => {
    const { data, error } = await supabase
      .from('partner_invoices')
      .select('*')
      .eq('organization_id', orgId)
      .order('billing_period_year', { ascending: false })
      .order('billing_period_month', { ascending: false });
    if (error) {
      toast({ title: 'Error loading invoices', description: error.message, variant: 'destructive' });
    } else {
      setInvoices(data || []);
    }
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleAddPartner = async () => {
    if (!partnerForm.name || !partnerForm.contact_email) {
      toast({ title: 'Required fields missing', description: 'Name and email are required', variant: 'destructive' });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('organizations').insert({
      name: partnerForm.name,
      slug: generateSlug(partnerForm.name),
      contact_email: partnerForm.contact_email,
      contact_phone: partnerForm.contact_phone || null,
      website: partnerForm.website || null,
      description: partnerForm.description || null,
      tier: partnerForm.tier,
      owner_user_id: user.id,
    });

    if (error) {
      toast({ title: 'Error adding partner', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Partner added successfully' });
      setShowAddPartner(false);
      setPartnerForm({ name: '', contact_email: '', contact_phone: '', website: '', description: '', tier: 'community' });
      fetchPartners();
    }
  };

  const handleAddInvoice = async () => {
    if (!selectedPartner || !invoiceForm.amount) {
      toast({ title: 'Amount is required', variant: 'destructive' });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Generate invoice number
    const year = invoiceForm.billing_period_year;
    const { count } = await supabase
      .from('partner_invoices')
      .select('*', { count: 'exact', head: true })
      .eq('billing_period_year', parseInt(year));
    const seq = (count || 0) + 1;
    const invoiceNumber = `INV-${year}-${String(seq).padStart(3, '0')}`;

    const { error } = await supabase.from('partner_invoices').insert({
      organization_id: selectedPartner.id,
      invoice_number: invoiceNumber,
      billing_period_month: parseInt(invoiceForm.billing_period_month),
      billing_period_year: parseInt(invoiceForm.billing_period_year),
      amount: parseFloat(invoiceForm.amount),
      currency: invoiceForm.currency,
      description: invoiceForm.description || null,
      due_date: invoiceForm.due_date ? format(invoiceForm.due_date, 'yyyy-MM-dd') : null,
      notes: invoiceForm.notes || null,
      created_by: user.id,
    });

    if (error) {
      toast({ title: 'Error creating invoice', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Invoice created successfully' });
      setShowAddInvoice(false);
      setInvoiceForm({
        billing_period_month: String(new Date().getMonth() + 1),
        billing_period_year: String(new Date().getFullYear()),
        amount: '', currency: 'USD', description: '', due_date: undefined, notes: ''
      });
      fetchInvoices(selectedPartner.id);
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'paid') updateData.paid_at = new Date().toISOString();

    const { error } = await supabase.from('partner_invoices').update(updateData).eq('id', invoiceId);
    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Invoice marked as ${newStatus}` });
      if (selectedPartner) fetchInvoices(selectedPartner.id);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'sent': return 'secondary';
      case 'overdue': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  // Partner detail view
  if (selectedPartner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPartner(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{selectedPartner.name}</h2>
            <p className="text-sm text-muted-foreground">{selectedPartner.contact_email}</p>
          </div>
          <Badge variant={selectedPartner.status === 'active' ? 'default' : selectedPartner.status === 'suspended' ? 'destructive' : 'secondary'} className="ml-auto">
            {selectedPartner.status || 'active'}
          </Badge>
          <div className="flex gap-1">
            {(selectedPartner.status || 'active') === 'active' && (
              <>
                <Button size="sm" variant="outline" onClick={() => updateOrgStatus(selectedPartner.id, 'suspended')}>
                  <Ban className="h-3 w-3 mr-1" /> Suspend
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateOrgStatus(selectedPartner.id, 'archived')}>
                  <Archive className="h-3 w-3 mr-1" /> Archive
                </Button>
              </>
            )}
            {selectedPartner.status === 'suspended' && (
              <Button size="sm" variant="outline" onClick={() => updateOrgStatus(selectedPartner.id, 'active')}>
                <RotateCcw className="h-3 w-3 mr-1" /> Reactivate
              </Button>
            )}
            {selectedPartner.status === 'archived' && (
              <Button size="sm" variant="outline" onClick={() => updateOrgStatus(selectedPartner.id, 'active')}>
                <RotateCcw className="h-3 w-3 mr-1" /> Restore
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Manage invoices for {selectedPartner.name}</CardDescription>
            </div>
            <Button onClick={() => setShowAddInvoice(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Invoice
            </Button>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No invoices yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Billing Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{MONTHS[inv.billing_period_month - 1]} {inv.billing_period_year}</TableCell>
                      <TableCell>{inv.currency} {Number(inv.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusColor(inv.status) as any}>{inv.status}</Badge>
                      </TableCell>
                      <TableCell>{inv.due_date || '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {inv.status === 'draft' && (
                            <Button size="sm" variant="outline" onClick={() => updateInvoiceStatus(inv.id, 'sent')}>
                              Mark Sent
                            </Button>
                          )}
                          {inv.status === 'sent' && (
                            <Button size="sm" variant="outline" onClick={() => updateInvoiceStatus(inv.id, 'paid')}>
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Invoice Dialog */}
        <Dialog open={showAddInvoice} onOpenChange={setShowAddInvoice}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
              <DialogDescription>Create a new invoice for {selectedPartner.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Billing Period</Label>
                <div className="flex gap-2 mt-1">
                  <Select value={invoiceForm.billing_period_month} onValueChange={(v) => setInvoiceForm(f => ({ ...f, billing_period_month: v }))}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, i) => (
                        <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={invoiceForm.billing_period_year} onValueChange={(v) => setInvoiceForm(f => ({ ...f, billing_period_year: v }))}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>Amount</Label>
                  <Input type="number" placeholder="0.00" value={invoiceForm.amount} onChange={(e) => setInvoiceForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <div className="w-28">
                  <Label>Currency</Label>
                  <Select value={invoiceForm.currency} onValueChange={(v) => setInvoiceForm(f => ({ ...f, currency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="KES">KES</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input placeholder="Service description" value={invoiceForm.description} onChange={(e) => setInvoiceForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {invoiceForm.due_date ? format(invoiceForm.due_date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={invoiceForm.due_date} onSelect={(d) => setInvoiceForm(f => ({ ...f, due_date: d }))} />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea placeholder="Additional notes" value={invoiceForm.notes} onChange={(e) => setInvoiceForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddInvoice(false)}>Cancel</Button>
              <Button onClick={handleAddInvoice}>Create Invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Partners list view
  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2">
        <Button variant={view === 'partners' ? 'default' : 'outline'} onClick={() => setView('partners')}>
          <FileText className="h-4 w-4 mr-2" /> Partners
        </Button>
        <Button variant={view === 'applications' ? 'default' : 'outline'} onClick={() => setView('applications')}>
          <ClipboardList className="h-4 w-4 mr-2" /> Applications
        </Button>
      </div>

      {view === 'applications' ? (
        <PartnerApplications onApplicationApproved={fetchPartners} />
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Partners</CardTitle>
                <CardDescription>Manage partner organizations and invoices</CardDescription>
              </div>
              <Button onClick={() => setShowAddPartner(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Partner
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-center py-8">Loading...</p>
              ) : partners.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No partners yet. Add your first partner to get started.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((p) => (
                      <TableRow key={p.id} className="cursor-pointer" onClick={() => setSelectedPartner(p)}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.contact_email}</TableCell>
                        <TableCell><Badge variant="outline">{p.tier}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={(p.status || 'active') === 'active' ? 'default' : (p.status || 'active') === 'suspended' ? 'destructive' : 'secondary'}>
                            {p.status || 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedPartner(p); }}>
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Add Partner Dialog */}
          <Dialog open={showAddPartner} onOpenChange={setShowAddPartner}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Onboard New Partner</DialogTitle>
                <DialogDescription>Create a new partner organization</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Organization Name *</Label>
                  <Input value={partnerForm.name} onChange={(e) => setPartnerForm(f => ({ ...f, name: e.target.value }))} placeholder="Organization name" />
                </div>
                <div>
                  <Label>Contact Email *</Label>
                  <Input type="email" value={partnerForm.contact_email} onChange={(e) => setPartnerForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="email@org.com" />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input value={partnerForm.contact_phone} onChange={(e) => setPartnerForm(f => ({ ...f, contact_phone: e.target.value }))} placeholder="+254..." />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={partnerForm.website} onChange={(e) => setPartnerForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={partnerForm.description} onChange={(e) => setPartnerForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
                </div>
                <div>
                  <Label>Tier</Label>
                  <Select value={partnerForm.tier} onValueChange={(v) => setPartnerForm(f => ({ ...f, tier: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddPartner(false)}>Cancel</Button>
                <Button onClick={handleAddPartner}>Add Partner</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default PartnerManagement;
