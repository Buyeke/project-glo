
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, ArrowUpDown, Calendar } from 'lucide-react';

interface UserUsageData {
  user_id: string;
  full_name: string | null;
  user_type: string | null;
  org_name: string | null;
  total_minutes: number;
  last_active: string | null;
}

const UserUsageTracker = () => {
  const [usageData, setUsageData] = useState<UserUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'hours'>('hours');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchUsageData();
  }, [dateFrom, dateTo]);

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      // Fetch sessions with date filters
      let sessionsQuery = supabase
        .from('user_sessions')
        .select('user_id, duration_minutes, session_end, session_start');

      if (dateFrom) {
        sessionsQuery = sessionsQuery.gte('session_start', dateFrom);
      }
      if (dateTo) {
        sessionsQuery = sessionsQuery.lte('session_start', dateTo + 'T23:59:59.999Z');
      }

      const { data: sessions, error: sessionsError } = await sessionsQuery;
      if (sessionsError) throw sessionsError;

      // Get unique user IDs
      const userIds = [...new Set((sessions || []).map(s => s.user_id))];
      if (userIds.length === 0) {
        setUsageData([]);
        setLoading(false);
        return;
      }

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, user_type')
        .in('id', userIds);

      // Fetch org memberships
      const { data: memberships } = await supabase
        .from('organization_members')
        .select('user_id, organization_id, organizations(name)')
        .in('user_id', userIds);

      // Aggregate per user
      const userMap = new Map<string, UserUsageData>();

      for (const session of sessions || []) {
        const existing = userMap.get(session.user_id);
        const minutes = session.duration_minutes
          ? Number(session.duration_minutes)
          : session.session_end
            ? (new Date(session.session_end).getTime() - new Date(session.session_start).getTime()) / 60000
            : (Date.now() - new Date(session.session_start).getTime()) / 60000;

        const lastActive = session.session_end || session.session_start;

        if (existing) {
          existing.total_minutes += minutes;
          if (!existing.last_active || lastActive > existing.last_active) {
            existing.last_active = lastActive;
          }
        } else {
          const profile = profiles?.find(p => p.id === session.user_id);
          const membership = memberships?.find(m => m.user_id === session.user_id);
          const orgName = membership?.organizations
            ? (membership.organizations as any).name || (Array.isArray(membership.organizations) ? (membership.organizations as any)[0]?.name : null)
            : null;

          userMap.set(session.user_id, {
            user_id: session.user_id,
            full_name: profile?.full_name || 'Unknown User',
            user_type: profile?.user_type || 'individual',
            org_name: orgName || 'N/A',
            total_minutes: minutes,
            last_active: lastActive,
          });
        }
      }

      setUsageData(Array.from(userMap.values()));
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userTypes = useMemo(() => {
    const types = new Set(usageData.map(u => u.user_type || 'individual'));
    return Array.from(types);
  }, [usageData]);

  const filteredData = useMemo(() => {
    let data = [...usageData];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(u =>
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.org_name || '').toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'all') {
      data = data.filter(u => u.user_type === typeFilter);
    }

    data.sort((a, b) => {
      if (sortBy === 'hours') {
        return sortDir === 'desc' ? b.total_minutes - a.total_minutes : a.total_minutes - b.total_minutes;
      }
      const nameA = (a.full_name || '').toLowerCase();
      const nameB = (b.full_name || '').toLowerCase();
      return sortDir === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
    });

    return data;
  }, [usageData, searchQuery, typeFilter, sortBy, sortDir]);

  const toggleSort = (field: 'name' | 'hours') => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir(field === 'hours' ? 'desc' : 'asc');
    }
  };

  const formatHours = (minutes: number) => {
    const hours = minutes / 60;
    if (hours < 1) return `${Math.round(minutes)}m`;
    return `${hours.toFixed(1)}h`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            User Platform Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or organization..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {userTypes.map(t => (
                  <SelectItem key={t} value={t!}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">From:</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">To:</span>
              <Input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-auto"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                Clear dates
              </Button>
            )}
          </div>

          {/* Summary */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{filteredData.length} users</span>
            <span>·</span>
            <span>{formatHours(filteredData.reduce((sum, u) => sum + u.total_minutes, 0))} total</span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading usage data...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No session data found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('name')} className="gap-1 -ml-3">
                      User Name <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Org Type</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('hours')} className="gap-1 -ml-3">
                      Total Hours <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map(user => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.user_type}</Badge>
                    </TableCell>
                    <TableCell>{user.org_name}</TableCell>
                    <TableCell className="font-mono">{formatHours(user.total_minutes)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(user.last_active)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserUsageTracker;
