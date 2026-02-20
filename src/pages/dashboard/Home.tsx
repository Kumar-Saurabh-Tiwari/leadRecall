import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, List, Grid2X2, CreditCard, ChevronRight, ChevronLeft, User, Building2, Calendar, RefreshCw } from 'lucide-react';
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
import { useEvents } from '@/contexts/EventContext';
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
  const { entries: cachedEntries, setEntries: setEntriesInContext, addEntry: addEntryToContext, isEntriesInitialized, setIsEntriesInitialized } = useEvents();
  const [entries, setEntries] = useState<Entry[]>(cachedEntries);
  const [isLoading, setIsLoading] = useState(!isEntriesInitialized);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const fetchEntries = async () => {
    if (!user?.role || !user?.email) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let apiResponse;
      if (user.role === 'exhibitor') {
        // Exhibitors get attendee data
        apiResponse = await entryService.getExhibitorData(user.email);
      } else {
        // Attendees get exhibitor data
        apiResponse = await entryService.getAttendeeData(user.email);
      }

      console.log('API Response:', apiResponse);

      // Transform API response to Entry format
      const dataArray = apiResponse?.data || apiResponse;
      if (dataArray && Array.isArray(dataArray)) {
        const transformedEntries: Entry[] = dataArray.map((item: any) => {
          const isContent = item.eRecordType === "content";
          const isLocation = item.eRecordType === "location";
          const contactData = isLocation ? item.oLocationData : (isContent ? item.oContentData : item.oContactData);
          
          // Get first non-empty event title
          const validEvent = contactData?.sEventTitles?.find((evt: any) => evt.sTitle && evt.sTitle.trim());
          
          // Get first non-N/A LinkedIn profile link
          const linkedinProfile = contactData?.profiles?.find((prof: any) => prof.sProfileLink && prof.sProfileLink !== 'N/A');
          
          // For location type, use sPlace details; for content type, use sPresentation; for contact type, use name
          let name = 'Unknown';
          if (isLocation) {
            name = contactData?.sPlace?.sValue || contactData?.sPlace?.sLabel || contactData?.sPlace?.sAddress || 'Unknown Location';
          } else if (isContent) {
            name = contactData?.sPresentation?.sValue || contactData?.sPresentation?.sLabel || 'Unknown Content';
          } else {
            name = contactData ? 
              `${contactData.sFirstName || ''} ${contactData.sLastName || ''}`.trim() : 
              'Unknown';
          }
          
          return {
            id: item._id || item.id || crypto.randomUUID(),
            name: name,
            company: contactData?.sCompany || '',
            event: validEvent?.sTitle || 'Unknown Event',
            notes: isLocation ? (contactData?.sNotes || '') : (isContent ? (contactData?.sNotes || '') : (contactData?.sEntryNotes?.[0] || '')),
            type: isLocation ? 'location' : (isContent ? 'content' : (user.role === 'exhibitor' ? 'attendee' : 'exhibitor')),
            createdAt: item.dCreatedDate ? new Date(item.dCreatedDate) : new Date(),
            email: contactData?.sEmail?.[0]?.Email || undefined,
            phone: contactData?.contacts?.[0]?.sContactNumber || undefined,
            linkedin: linkedinProfile?.sProfileLink || undefined,
            profileUrl: undefined,
            image: item?.sMediaUrl,
            role: contactData?.sRole,
            isNextStep: item.isNextStep || false
          };
        });

        setEntries(transformedEntries);
        setEntriesInContext(transformedEntries);
        setIsEntriesInitialized(true);
      } else {
        setEntries([]);
        setEntriesInContext([]);
        setIsEntriesInitialized(true);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load entries. Please try again.');
      setEntries([]);
      setIsEntriesInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if entries haven't been initialized yet
    if (!isEntriesInitialized) {
      fetchEntries();
    }
  }, [isEntriesInitialized, user?.role, user?.email]);

  // Sync cached entries when they change in context
  useEffect(() => {
    if (cachedEntries.length > 0) {
      setEntries(cachedEntries);
    }
  }, [cachedEntries]);

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

  // Handle when a new entry is added - reset cache and refetch
  const handleEntryAdded = async () => {
    setIsEntriesInitialized(false);
    await fetchEntries();
  };

  return (
    <div className="min-h-screen">
      {/* Optimized Header */}
      <div className="px-5 pt-4 pb-3 sticky top-0 z-30 gradient-primary backdrop-blur-xl border-b border-border/5">
        <div className="flex flex-col gap-3">
          {/* Top Row: Title, Count, View Switcher, Refresh & Search Icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>
                <Building2 className="h-5 w-5 text-dark" />
              </span>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Leads
              </h1>
              <span className="flex items-center justify-center bg-primary/10 text-dark text-[10px] font-black px-2 py-0.5 rounded-full border border-primary/20">
                {filteredEntries.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Compact View Switcher */}
              <div className="bg-muted/50 p-1 rounded-lg flex items-center border border-border/20 mr-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded-md transition-all ${viewMode === 'list' ? 'bg-background text-dark shadow-sm' : 'text-primary-foreground'}`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background text-dark shadow-sm' : 'text-primary-foreground'}`}
                  title="Grid View"
                >
                  <Grid2X2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-1 rounded-md transition-all ${viewMode === 'card' ? 'bg-background text-dark shadow-sm' : 'text-primary-foreground'}`}
                  title="Card View"
                >
                  <CreditCard className="h-4 w-4" />
                </button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={fetchEntries}
                disabled={isLoading}
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>

              {/* Search Toggle Icon */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className={`h-8 w-8 rounded-full transition-all ${isSearchExpanded ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                {isSearchExpanded ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Bottom Row: Search & Filters - Expandable */}
          <AnimatePresence>
            {isSearchExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="pl-9 pr-3 bg-white border-none focus-visible:ring-1 focus-visible:ring-primary/20 h-10 rounded-xl text-sm transition-all"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-none bg-muted/40 text-muted-foreground hover:text-primary transition-colors shrink-0">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-border/50">
                    <DropdownMenuLabel className="px-3 pt-2 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sort Options</DropdownMenuLabel>
                    <DropdownMenuSeparator className="opacity-50" />
                    {Object.entries(SORT_OPTIONS).map(([key, label]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => setSortBy(key as SortOption)}
                        className={`rounded-xl px-3 py-2 cursor-pointer mb-0.5 ${sortBy === key ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted font-medium'}`}
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="opacity-50 my-2" />
                    <DropdownMenuLabel className="px-3 pt-2 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Filter By Role</DropdownMenuLabel>
                    <DropdownMenuSeparator className="opacity-50" />
                    {(['all', 'exhibitor', 'attendee'] as const).map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`rounded-xl px-3 py-2 cursor-pointer mb-0.5 ${filterType === type ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted font-medium'}`}
                      >
                        {type === 'all' ? 'All Connections' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filter Tags */}
      <AnimatePresence>
        {(sortBy !== 'latest' || filterType !== 'all') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pt-2 flex gap-2 overflow-x-auto scrollbar-hide pb-1"
          >
            {sortBy !== 'latest' && (
              <Badge variant="secondary" className="pl-3 pr-1.5 py-1 bg-primary/10 text-primary border-primary/20 rounded-full flex items-center gap-1.5 whitespace-nowrap">
                {SORT_OPTIONS[sortBy]}
                <button onClick={() => setSortBy('latest')} className="p-0.5 hover:bg-primary/20 rounded-full transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filterType !== 'all' && (
              <Badge variant="secondary" className="pl-3 pr-1.5 py-1 bg-primary/10 text-primary border-primary/20 rounded-full flex items-center gap-1.5 whitespace-nowrap">
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}s
                <button onClick={() => setFilterType('all')} className="p-0.5 hover:bg-primary/20 rounded-full transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSortBy('latest');
                setFilterType('all');
              }}
              className="text-xs h-7 px-3 text-muted-foreground hover:text-primary transition-colors rounded-full"
            >
              Clear All
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry List */}
      <div className="px-5 py-6 min-h-[50vh]">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/10 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-muted-foreground mt-4 font-bold text-sm tracking-wide uppercase">Updating your leads...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-destructive/5 rounded-3xl p-10 text-center border border-destructive/10"
          >
            <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Connection Error</h3>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">{error}</p>
            <Button
              variant="default"
              onClick={fetchEntries}
              className="rounded-xl px-8"
            >
              Reload
            </Button>
          </motion.div>
        ) : filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 bg-muted/40 rounded-full flex items-center justify-center mb-6">
              <User className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {searchQuery ? 'No Results Found' : 'Your List is Empty'}
            </h3>
            <p className="text-muted-foreground max-w-[240px] font-medium opacity-70">
              {searchQuery 
                ? `We couldn't find anything matching "${searchQuery}"`
                : 'Start growing your network by adding your first lead.'}
            </p>
            {searchQuery && (
              <Button 
                variant="link" 
                onClick={() => setSearchQuery('')}
                className="mt-2 text-primary hover:text-primary/80"
              >
                Clear Search
              </Button>
            )}
          </motion.div>
        ) : (
          <div>
            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredEntries.map((entry, index) => (
                    <EntryCard 
                      key={entry.id} 
                      entry={entry}
                      viewMode="list"
                      onClick={() => navigate(`/dashboard/entry/${entry.id}`)}
                      delay={index * 0.03}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredEntries.map((entry, index) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      viewMode="grid"
                      onClick={() => navigate(`/dashboard/entry/${entry.id}`)}
                      delay={index * 0.03}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {/* Card View (Carousel) */}
            {viewMode === 'card' && (
              <div className="relative -mx-5 px-5">
                <div 
                  ref={carouselRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-1"
                  style={{ scrollBehavior: 'smooth', scrollSnapType: 'x mandatory' }}
                >
                  <AnimatePresence mode="popLayout">
                    {filteredEntries.map((entry, index) => (
                      <div key={entry.id} className="scroll-snap-align-start">
                        <EntryCard
                          entry={entry}
                          viewMode="card"
                          onClick={() => navigate(`/dashboard/entry/${entry.id}`)}
                          delay={index * 0.03}
                        />
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
                
                {/* Carousel Controls - Floating refined buttons */}
                {filteredEntries.length > 1 && (
                  <div className="flex justify-center gap-4 mt-8">
                    <button
                      onClick={() => handleCarouselScroll('left')}
                      className="bg-background border border-border/50 text-foreground rounded-full p-3 hover:bg-muted hover:scale-110 active:scale-95 transition-all shadow-md"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleCarouselScroll('right')}
                      className="bg-background border border-border/50 text-foreground rounded-full p-3 hover:bg-muted hover:scale-110 active:scale-95 transition-all shadow-md"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <AddEntryFAB onEntryAdded={handleEntryAdded} />
    </div>
  );
}
