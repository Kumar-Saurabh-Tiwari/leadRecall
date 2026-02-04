import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EntryCard } from '@/components/dashboard/EntryCard';
import { AddEntryFAB } from '@/components/dashboard/AddEntryFAB';
import { entryService } from '@/services/entryService';
import { Entry } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setEntries(entryService.getAll());
    
    // Re-fetch entries when returning to this page (simple polling for demo)
    const interval = setInterval(() => {
      setEntries(entryService.getAll());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredEntries = entries.filter(entry => 
    entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.event.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-xl font-bold text-foreground mb-1">
            Welcome, {user?.name?.split(' ')[0] || 'there'}!
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
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </motion.div>
      </header>

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
          filteredEntries.map((entry, index) => (
            <EntryCard 
              key={entry.id} 
              entry={entry} 
              delay={index * 0.05}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <AddEntryFAB />
    </div>
  );
}
