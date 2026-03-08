import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Search, Eye, FileText, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AuditEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_data: any;
  new_data: any;
  changed_fields: string[] | null;
  performed_by: string | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  INSERT: 'default',
  UPDATE: 'secondary',
  DELETE: 'destructive',
};

const TABLE_LABELS: Record<string, string> = {
  profiles: 'User Profiles',
  organizations: 'Organizations',
  contact_submissions: 'Contact Submissions',
  donations: 'Donations',
  blog_posts: 'Blog Posts',
  team_members: 'Team Members',
  org_cases: 'Cases',
};

const AuditTrailPanel = () => {
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit-trail', tableFilter, actionFilter, searchTerm, page],
    queryFn: async () => {
      let query = supabase
        .from('audit_trail' as any)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (tableFilter !== 'all') {
        query = query.eq('table_name', tableFilter);
      }
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }
      if (searchTerm) {
        query = query.or(`record_id.ilike.%${searchTerm}%,table_name.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await (query as any);
      if (error) throw error;
      return { entries: (data || []) as AuditEntry[], total: count || 0 };
    },
    staleTime: 30_000,
  });

  const exportAuditLog = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/audit-trail-export`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            format: 'csv',
            table_filter: tableFilter !== 'all' ? tableFilter : undefined,
            action_filter: actionFilter !== 'all' ? actionFilter : undefined,
          }),
        }
      );

      if (response.ok) {
        const csvText = await response.text();
        const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: 'Export successful', description: 'Audit trail CSV downloaded' });
      } else {
        const err = await response.json();
        toast({ title: 'Export failed', description: err.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  const entries = data?.entries || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Trail
              </CardTitle>
              <CardDescription>
                Immutable log of all changes to sensitive data — {total} total records
              </CardDescription>
            </div>
            <Button onClick={exportAuditLog} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by record ID..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="pl-9"
              />
            </div>
            <Select value={tableFilter} onValueChange={(v) => { setTableFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All tables" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tables</SelectItem>
                {Object.entries(TABLE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="INSERT">Insert</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading audit trail...</p>
          ) : entries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No audit records found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Changed Fields</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(entry.created_at), 'MMM d, yyyy HH:mm:ss')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {TABLE_LABELS[entry.table_name] || entry.table_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ACTION_COLORS[entry.action] as any}>
                            {entry.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {entry.changed_fields?.join(', ') || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {entry.performed_by?.substring(0, 8) || 'system'}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedEntry(entry)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    Previous
                  </Button>
                  <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Record Detail</DialogTitle>
            <DialogDescription>
              {selectedEntry && `${selectedEntry.action} on ${TABLE_LABELS[selectedEntry.table_name] || selectedEntry.table_name}`}
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Record ID:</span>
                    <p className="font-mono text-xs break-all">{selectedEntry.record_id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Performed by:</span>
                    <p className="font-mono text-xs break-all">{selectedEntry.performed_by || 'system'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timestamp:</span>
                    <p>{format(new Date(selectedEntry.created_at), 'PPpp')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Changed fields:</span>
                    <p>{selectedEntry.changed_fields?.join(', ') || 'N/A'}</p>
                  </div>
                </div>

                {selectedEntry.action === 'UPDATE' && selectedEntry.changed_fields && (
                  <div>
                    <h4 className="font-medium mb-2">Changes</h4>
                    <div className="space-y-2">
                      {selectedEntry.changed_fields.map((field) => (
                        <div key={field} className="bg-muted/50 rounded p-2 text-sm">
                          <span className="font-medium">{field}</span>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div>
                              <span className="text-xs text-muted-foreground">Before:</span>
                              <pre className="text-xs whitespace-pre-wrap break-all">
                                {JSON.stringify(selectedEntry.old_data?.[field], null, 2) ?? 'null'}
                              </pre>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">After:</span>
                              <pre className="text-xs whitespace-pre-wrap break-all">
                                {JSON.stringify(selectedEntry.new_data?.[field], null, 2) ?? 'null'}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEntry.action === 'INSERT' && (
                  <div>
                    <h4 className="font-medium mb-2">New Record Data</h4>
                    <pre className="bg-muted/50 rounded p-3 text-xs whitespace-pre-wrap break-all max-h-[300px] overflow-auto">
                      {JSON.stringify(selectedEntry.new_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedEntry.action === 'DELETE' && (
                  <div>
                    <h4 className="font-medium mb-2">Deleted Record Data</h4>
                    <pre className="bg-muted/50 rounded p-3 text-xs whitespace-pre-wrap break-all max-h-[300px] overflow-auto">
                      {JSON.stringify(selectedEntry.old_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditTrailPanel;
