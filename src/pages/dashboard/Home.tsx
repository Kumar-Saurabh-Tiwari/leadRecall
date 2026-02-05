import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, List, Grid2X2, CreditCard, ChevronRight, ChevronLeft, User, Building2, Calendar } from 'lucide-react';
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
import { format } from 'date-fns';

type SortOption = 'latest' | 'oldest' | 'name-asc' | 'name-desc' | 'company-asc' | 'company-desc';
type FilterType = 'all' | 'exhibitor' | 'attendee';
type ViewMode = 'list' | 'grid' | 'card';

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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const carouselRef = useRef<HTMLDivElement>(null);

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

  const handleCarouselScroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320; // card width + gap
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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

        {/* View Mode Tabs */}
        <motion.div 
          className="flex gap-2 mt-4 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Grid2X2 className="h-3.5 w-3.5" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'card'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            Card
          </button>
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
      <div className="p-4">
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
            <motion.p className="text-xs text-muted-foreground px-1 mb-3">
              {filteredEntries.length} Lead{filteredEntries.length !== 1 ? 's' : ''}
            </motion.p>
            
            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-3">
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
            
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                <AnimatePresence>
                  {filteredEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div
                        onClick={() => navigate(`/dashboard/entry/${entry.id}`)}
                        className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col border border-gray-200 dark:border-slate-700 hover:border-primary/30"
                      >
                        {/* Image Section */}
                        <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden group">
                          {entry.image ? (
                            <img 
                              src={entry.image} 
                              alt={entry.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <User className="h-16 w-16 text-gray-300 dark:text-slate-600" />
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 p-5 flex flex-col">
                          {/* Name and Contact Button */}
                          <div className="flex items-start justify-between gap-2 mb-4">
                            <h3 className="font-bold text-foreground text-base leading-tight flex-1">
                              {entry.name}
                            </h3>
                            {/* <Badge 
                              variant="outline"
                              className="flex-shrink-0 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 font-semibold text-xs whitespace-nowrap"
                            >
                              💬 Contact
                            </Badge> */}
                          </div>

                          {/* Company */}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{entry.company}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-auto pt-3">
                            <div className="flex gap-1.5">
                              <button className="w-7 h-7 rounded-full border border-gray-300 dark:border-slate-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-gray-400 text-xs">
                                in
                              </button>
                              <button className="w-7 h-7 rounded-full border border-gray-300 dark:border-slate-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-gray-400">
                                ☎
                              </button>
                            </div>
                            <Badge 
                              variant="outline"
                              className="ml-auto bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 font-bold text-xs px-2 py-0.5"
                            >
                              🎪 {entry.event}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {/* Card View (Carousel) */}
            {viewMode === 'card' && (
              <div className="relative">
                <div 
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <AnimatePresence>
                    {filteredEntries.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex-shrink-0 w-80"
                      >
                        <div
                          onClick={() => navigate(`/dashboard/entry/${entry.id}`)}
                          className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer h-full flex flex-col"
                        >
                          {/* Image Section - Full Width and Height */}
                          <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden group relative">
                            {entry.image ? (
                              <img 
                                src={entry.image} 
                                alt={entry.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <User className="h-20 w-20 text-gray-300 dark:text-slate-600" />
                            )}
                            {/* Badge with number */}
                            <div className="absolute top-3 left-3 bg-gray-700 dark:bg-gray-800 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">
                              1
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 p-6 flex flex-col">
                            {/* Name and Type Badge */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h3 className="font-bold text-foreground text-xl leading-tight flex-1">
                                {entry.name}
                              </h3>
                              <Badge 
                                variant={entry.type === 'exhibitor' ? 'default' : 'secondary'}
                                className="flex-shrink-0 text-xs font-semibold"
                              >
                                {entry.type === 'exhibitor' ? 'Exhibitor' : 'Attendee'}
                              </Badge>
                            </div>

                            {/* Company */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
                              <Building2 className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{entry.company}</span>
                            </div>

                            {/* Notes */}
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                              {entry.notes}
                            </p>

                            {/* Date/Time */}
                            <div className="flex items-center justify-between text-xs mb-4 pb-4 border-t border-gray-200 dark:border-slate-700 pt-3">
                              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                <Calendar className="h-4 w-4" />
                                {format(entry.createdAt, 'MMM d, yyyy')}
                              </span>
                              <span className="text-gray-500 font-semibold">
                                {format(entry.createdAt, 'hh:mm a')}
                              </span>
                            </div>

                            {/* Contact Button and Event */}
                            <div className="flex items-center justify-between gap-2">
                              <Badge 
                                variant="outline"
                                className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 font-bold text-sm px-3 py-1"
                              >
                                💬 Contact
                              </Badge>
                              <Badge 
                                variant="outline"
                                className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 font-bold text-sm"
                              >
                                🎪 {entry.event}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                {/* Carousel Controls */}
                {filteredEntries.length > 0 && (
                  <>
                    <button
                      onClick={() => handleCarouselScroll('left')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 bg-primary text-primary-foreground rounded-full p-2.5 hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleCarouselScroll('right')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 bg-primary text-primary-foreground rounded-full p-2.5 hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <AddEntryFAB />
    </div>
  );
}
