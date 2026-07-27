import { API_BASE_URL } from '@/config';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Calendar, TrendingUp, MapPin, Search, Trophy, Crown } from 'lucide-react';

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
        const response = await fetch(`${API_BASE_URL}/startups`);
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
          <div className="relative rounded-lg overflow-hidden h-[350px]">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(/unicorns.jpeg)',
                backgroundPosition: 'center 30%'
              }}
            >
              <div className="absolute inset-0 bg-black/60"></div>
            </div>
            <div className="relative z-10 p-8 text-white h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="animate-pulse">
                  <div className="h-4 bg-white/20 rounded w-24 mb-2"></div>
                  <div className="h-12 bg-white/20 rounded w-64 mb-4"></div>
                </div>
                <div className="flex gap-6 animate-pulse">
                  <div className="text-center">
                    <div className="h-8 bg-white/20 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-white/20 rounded w-20"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-8 bg-white/20 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-white/20 rounded w-20"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-8 bg-white/20 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-white/20 rounded w-20"></div>
                  </div>
                </div>
              </div>
              
              <div className="w-full">
                <div className="h-10 bg-white/20 rounded-full animate-pulse"></div>
              </div>
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
        {/* Enhanced Hero Section with Glassy Effects */}
        <div className="relative rounded-lg overflow-hidden h-[350px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/unicorns.jpeg)',
              backgroundPosition: 'center 30%'
            }}
          >
            {/* Remove this line completely for full opacity */}
            {/* Or change to a lower opacity like bg-black/20 for slight dimming */}
          </div>
          <div className="relative z-10 p-6 pb-5 text-white flex flex-col justify-end h-full">
            {/* Header with Glassy Stats moved to top */}
            <div className="absolute top-6 right-6 flex gap-4">
              <div className="text-center bg-sidebar/60 hover:bg-sidebar/80 backdrop-blur-sm border border-sidebar-border/50 rounded-lg px-3 py-2 transition-all duration-300">
                <div className="text-lg font-bold text-yellow-400">{startups.length}</div>
                <div className="text-xs text-gray-200 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Companies
                </div>
              </div>
              <div className="text-center bg-sidebar/60 hover:bg-sidebar/80 backdrop-blur-sm border border-sidebar-border/50 rounded-lg px-3 py-2 transition-all duration-300">
                <div className="text-lg font-bold text-green-400">{startups.filter(s => s.isUnicorn).length}</div>
                <div className="text-xs text-gray-200 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Unicorns
                </div>
              </div>
              <div className="text-center bg-sidebar/60 hover:bg-sidebar/80 backdrop-blur-sm border border-sidebar-border/50 rounded-lg px-3 py-2 transition-all duration-300">
                <div className="text-lg font-bold text-blue-400">{cities.length}</div>
                <div className="text-xs text-gray-200 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Cities
                </div>
              </div>
            </div>

            {/* Full Width Glassy Search bar - exactly like main page */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                <Input 
                  placeholder="Search companies..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-sidebar/60 hover:bg-sidebar/80 border-sidebar-border/50 cursor-pointer text-white placeholder:text-gray-300 rounded-full px-4 py-2 text-sm backdrop-blur-sm w-full pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Integrated Filters */}
        {filteredCompanies.length > 0 ? (
          <div className="bg-sidebar border border-sidebar-border rounded-lg overflow-hidden">
            {/* Integrated Filter Bar */}
            <div className="p-4 border-b border-sidebar-border bg-sidebar-accent/50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                  <Button 
                    variant={filterType === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilterType('all')}
                    className="rounded-full text-xs"
                  >
                    All
                  </Button>
                  <Button 
                    variant={filterType === 'unicorns' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilterType('unicorns')}
                    className="rounded-full text-xs"
                  >
                    🦄 Unicorns
                  </Button>
                  <Button 
                    variant={filterType === 'sunicorns' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilterType('sunicorns')}
                    className="rounded-full text-xs"
                  >
                    🌟 Soonicorns
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Select value={sectorFilter} onValueChange={setSectorFilter}>
                    <SelectTrigger className="w-32 h-8 text-xs bg-sidebar-accent border-sidebar-border">
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
                    <SelectTrigger className="w-28 h-8 text-xs bg-sidebar-accent border-sidebar-border">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-28 h-8 text-xs bg-sidebar-accent border-sidebar-border">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="valuation">Valuation</SelectItem>
                      <SelectItem value="founded">Founded</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 mt-2">
                Showing {filteredCompanies.length} companies
              </div>
            </div>
            
            {/* Companies Grid */}
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
