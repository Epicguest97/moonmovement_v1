
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Calendar, TrendingUp, MapPin, Filter, Trophy, Crown, Search } from 'lucide-react';

interface UnicornCompany {
  id: number;
  name: string;
  sector: string;
  valuation: string;
  valuationNumber: number;
  city: string;
  foundedYear: number;
  logoUrl?: string;
  description: string;
  isUnicorn: boolean;
}

const UnicornsIndia = () => {
  const [filterType, setFilterType] = useState<'all' | 'unicorns' | 'sunicorns'>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'valuation' | 'founded' | 'name'>('valuation');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startups, setStartups] = useState<UnicornCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://moonmovement.onrender.com/api/startups');
        if (!response.ok) {
          throw new Error('Failed to fetch startups');
        }
        const startupsData = await response.json();
        setStartups(startupsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch startups');
        console.error('Error fetching startups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  const filteredCompanies = startups
    .filter(company => {
      if (filterType === 'unicorns') return company.isUnicorn;
      if (filterType === 'sunicorns') return !company.isUnicorn;
      return true;
    })
    .filter(company => sectorFilter === 'all' || company.sector === sectorFilter)
    .filter(company => cityFilter === 'all' || company.city === cityFilter)
    .filter(company => {
      if (yearFilter === 'all') return true;
      const year = parseInt(yearFilter);
      return company.foundedYear >= year;
    })
    .filter(company => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return company.name.toLowerCase().includes(query) ||
             company.sector.toLowerCase().includes(query) ||
             company.city.toLowerCase().includes(query) ||
             company.description.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'valuation':
          return b.valuationNumber - a.valuationNumber;
        case 'founded':
          return b.foundedYear - a.foundedYear;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.valuationNumber - a.valuationNumber;
      }
    });

  const sectors = Array.from(new Set(startups.map(s => s.sector)));
  const cities = Array.from(new Set(startups.map(s => s.city)));
  const yearRanges = ['2020', '2015', '2010', '2005', '2000'];

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
          {/* Hero Section Skeleton */}
          <div className="relative rounded-lg overflow-hidden h-[300px]">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(/lovable-uploads/6ee929f6-d821-4271-bd62-f3e8869d5dc0.png)',
                backgroundPosition: 'center 30%'
              }}
            >
              <div className="absolute inset-0 bg-black/60"></div>
            </div>
            <div className="relative z-10 p-8 text-white flex flex-col justify-end h-full">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-yellow-500 animate-pulse" />
                <div className="h-12 bg-white/20 rounded w-64 animate-pulse"></div>
                <Crown className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
              <div className="h-6 bg-white/20 rounded w-96 mx-auto animate-pulse"></div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-300">Loading India's most valuable companies...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
          <div className="text-center py-16">
            <p className="text-red-400 text-lg mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="bg-sidebar-primary hover:bg-sidebar-primary/90">
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Hero Section - Similar to home page */}
        <div className="relative rounded-lg overflow-hidden h-[300px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/lovable-uploads/6ee929f6-d821-4271-bd62-f3e8869d5dc0.png)',
              backgroundPosition: 'center 30%'
            }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="relative z-10 p-8 text-white flex flex-col justify-end h-full">
            <div className="text-xs opacity-90 mb-2">Hall of Fame</div>
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                India's Elite
              </h1>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            
            {/* Search bar in hero */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search companies..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-sidebar/60 hover:bg-sidebar/80 border-sidebar-border/50 text-white placeholder:text-gray-300 rounded-full pl-10 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Stats and Quick Filters */}
        <div className="bg-sidebar border border-sidebar-border rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-sidebar-accent px-3 py-2 rounded-full">
                <Building2 className="w-4 h-4 text-sidebar-primary" />
                <span className="text-sm font-medium text-white">{startups.length} Companies</span>
              </div>
              <div className="flex items-center gap-2 bg-sidebar-accent px-3 py-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-white">{startups.filter(s => s.isUnicorn).length} Unicorns</span>
              </div>
              <div className="flex items-center gap-2 bg-sidebar-accent px-3 py-2 rounded-full">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-white">{cities.length} Cities</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={filterType === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterType('all')}
                className="rounded-full"
              >
                All
              </Button>
              <Button 
                variant={filterType === 'unicorns' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterType('unicorns')}
                className="rounded-full"
              >
                🦄 Unicorns
              </Button>
              <Button 
                variant={filterType === 'sunicorns' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterType('sunicorns')}
                className="rounded-full"
              >
                🌟 Soonicorns
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-sidebar-primary" />
            <h3 className="font-medium text-white">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="bg-sidebar-accent border-sidebar-border">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="bg-sidebar-accent border-sidebar-border">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="bg-sidebar-accent border-sidebar-border">
                <SelectValue placeholder="Founded After" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {yearRanges.map(year => (
                  <SelectItem key={year} value={year}>{year}+</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="bg-sidebar-accent border-sidebar-border">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="valuation">Valuation</SelectItem>
                <SelectItem value="founded">Founded Year</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results - Big rectangle container like posts */}
        {filteredCompanies.length > 0 ? (
          <div className="bg-sidebar border border-sidebar-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-sidebar-border">
              <div className="text-sm text-gray-400">
                Showing {filteredCompanies.length} of {startups.length} companies
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {Array.from({ length: Math.ceil(filteredCompanies.length / 3) }, (_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredCompanies.slice(rowIndex * 3, (rowIndex + 1) * 3).map((company, index) => {
                    const globalIndex = rowIndex * 3 + index;
                    return (
                      <Card key={company.id} className="group bg-sidebar-accent border-sidebar-border hover:border-sidebar-primary transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="relative">
                            {/* Rank Badge */}
                            <div className="absolute top-0 left-0 z-10">
                              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                                globalIndex === 0 ? 'bg-yellow-500 text-black' :
                                globalIndex === 1 ? 'bg-gray-300 text-black' :
                                globalIndex === 2 ? 'bg-amber-600 text-white' :
                                'bg-sidebar-primary text-white'
                              }`}>
                                #{globalIndex + 1}
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-0 right-0 z-10">
                              {company.isUnicorn ? (
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  🦄
                                </div>
                              ) : (
                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  🌟
                                </div>
                              )}
                            </div>

                            {/* Company Logo */}
                            <div className="flex justify-center mb-4 pt-8">
                              {company.logoUrl ? (
                                <img 
                                  src={company.logoUrl} 
                                  alt={`${company.name} logo`} 
                                  className="w-12 h-12 object-contain rounded-full bg-white p-1"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-sidebar-primary rounded-full flex items-center justify-center">
                                  <Building2 className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Company Info */}
                            <div className="space-y-3 text-center">
                              <div>
                                <Link to={`/startup/${company.id}`}>
                                  <h3 className="font-bold text-white hover:text-sidebar-primary transition-colors cursor-pointer">
                                    {company.name}
                                  </h3>
                                </Link>
                                <p className="text-gray-400 text-sm line-clamp-2 mt-1">{company.description}</p>
                              </div>

                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Valuation</span>
                                  <span className="font-bold text-green-400">{company.valuation}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Sector</span>
                                  <span className="text-gray-300">{company.sector}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Location</span>
                                  <span className="text-gray-300">{company.city}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Founded</span>
                                  <span className="text-gray-300">{company.foundedYear}</span>
                                </div>
                              </div>

                              <Link to={`/startup/${company.id}`}>
                                <Button size="sm" className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 mt-3">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-sidebar border border-sidebar-border rounded-lg p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No companies found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterType('all');
                setSectorFilter('all');
                setCityFilter('all');
                setYearFilter('all');
                setSearchQuery('');
              }}
              className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UnicornsIndia;
