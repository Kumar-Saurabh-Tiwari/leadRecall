import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EntryCard } from '@/components/dashboard/EntryCard';
import { AddEntryFAB } from '@/components/dashboard/AddEntryFAB';
import { entryService } from '@/services/entryService';
import { Entry } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

type SortOption = 'latest' | 'oldest' | 'name-asc' | 'name-desc' | 'company-asc' | 'company-desc';
type FilterType = 'all' | 'exhibitor' | 'attendee';

const SORT_OPTIONS = {
  'latest': 'Latest',
  'oldest': 'Oldest',
  'name-asc': 'Name (A-Z)',
  'name-desc': 'Name (Z-A)',
  'company-asc': 'Company (A-Z)',
  'company-desc': 'Company (Z-A)',
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [filterType, setFilterType] = useState<FilterType>('all');

  useEffect(() => {
    if (user?.role) {
      setEntries(entryService.getByRole(user.role));
    }
    
    // Re-fetch entries when returning to this page (simple polling for demo)
    const interval = setInterval(() => {
      if (user?.role) {
        setEntries(entryService.getByRole(user.role));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [user?.role]);

  const applySorting = (entriesToSort: Entry[], sortOption: SortOption) => {
    const sorted = [...entriesToSort];
    
    switch (sortOption) {
      case 'latest':
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'oldest':
        return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'company-asc':
        return sorted.sort((a, b) => a.company.localeCompare(b.company));
      case 'company-desc':
        return sorted.sort((a, b) => b.company.localeCompare(a.company));
      default:
        return sorted;
    }
  };

  let filteredEntries = entries
    .filter(entry => {
      // Search filter
      const matchesSearch = 
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.event.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type filter
      const matchesType = filterType === 'all' || entry.type === filterType;
      
      return matchesSearch && matchesType;
    });

  // Apply sorting
  filteredEntries = applySorting(filteredEntries, sortBy);

  return (
    <div className="min-h-screen">
      {/* Welcome Section */}
      <div className="px-4 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Welcome {user?.role === 'exhibitor' ? 'Exhibitor' : 'Attendee'} {user?.name || 'there'}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Your lead inbox
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="mt-4 relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(SORT_OPTIONS).map(([key, label]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setSortBy(key as SortOption)}
                  className={sortBy === key ? 'bg-accent' : ''}
                >
                  {label}
                  {sortBy === key && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter By Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setFilterType('all')}
                className={filterType === 'all' ? 'bg-accent' : ''}
              >
                All Leads
                {filterType === 'all' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterType('exhibitor')}
                className={filterType === 'exhibitor' ? 'bg-accent' : ''}
              >
                Exhibitors
                {filterType === 'exhibitor' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterType('attendee')}
                className={filterType === 'attendee' ? 'bg-accent' : ''}
              >
                Attendees
                {filterType === 'attendee' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Filter/Sort Tags */}
        <AnimatePresence>
          {(sortBy !== 'latest' || filterType !== 'all') && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex gap-2 mt-3 flex-wrap"
            >
              {sortBy !== 'latest' && (
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
                  Sort: {SORT_OPTIONS[sortBy]}
                  <button
                    onClick={() => setSortBy('latest')}
                    className="ml-1.5 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterType !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
                  Type: {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  <button
                    onClick={() => setFilterType('all')}
                    className="ml-1.5 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(sortBy !== 'latest' || filterType !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSortBy('latest');
                    setFilterType('all');
                  }}
                  className="h-6 text-xs"
                >
                  Clear All
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Entry List */}
      <div className="p-4 space-y-3">
        {filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">
              {searchQuery ? 'No leads match your search' : 'No leads yet. Add your first one!'}
            </p>
          </motion.div>
        ) : (
          <div>
            <motion.p className="text-xs text-muted-foreground px-1 mb-2">
              {filteredEntries.length} Lead{filteredEntries.length !== 1 ? 's' : ''}
            </motion.p>
            <AnimatePresence>
              {filteredEntries.map((entry, index) => (
                <EntryCard 
                  key={entry.id} 
                  entry={entry}
                  onClick={() => navigate(`/dashboard/entry/${entry.id}`)}
                  delay={index * 0.05}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FAB */}
      <AddEntryFAB />
    </div>
  );
}
