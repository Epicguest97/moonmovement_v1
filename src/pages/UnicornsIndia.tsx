
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Calendar, TrendingUp, MapPin, Filter, Trophy, Crown } from 'lucide-react';

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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-sidebar-accent rounded w-3/4 mx-auto"></div>
              <div className="h-6 bg-sidebar-accent rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-gray-300 mt-8">Loading India's most valuable companies...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
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
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Hall of Fame
            </h1>
            <Crown className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            India's Most Valuable Startups & Unicorns - The Elite League of Innovation
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 bg-sidebar-accent px-4 py-2 rounded-full">
              <Building2 className="w-4 h-4 text-sidebar-primary" />
              <span className="text-sm font-medium">{startups.length} Companies</span>
            </div>
            <div className="flex items-center gap-2 bg-sidebar-accent px-4 py-2 rounded-full">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">{startups.filter(s => s.isUnicorn).length} Unicorns</span>
            </div>
            <div className="flex items-center gap-2 bg-sidebar-accent px-4 py-2 rounded-full">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{cities.length} Cities</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-sidebar border-sidebar-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-sidebar-primary" />
              <h3 className="text-lg font-semibold text-white">Filters & Sorting</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Status</label>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="bg-sidebar-accent border-sidebar-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ({startups.length})</SelectItem>
                    <SelectItem value="unicorns">🦄 Unicorns ({startups.filter(c => c.isUnicorn).length})</SelectItem>
                    <SelectItem value="sunicorns">🌟 Soonicorns ({startups.filter(c => !c.isUnicorn).length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sector Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Sector</label>
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="bg-sidebar-accent border-sidebar-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {sectors.map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">City</label>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="bg-sidebar-accent border-sidebar-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Founded After</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="bg-sidebar-accent border-sidebar-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {yearRanges.map(year => (
                      <SelectItem key={year} value={year}>{year}+</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Sort By</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="bg-sidebar-accent border-sidebar-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="valuation">Valuation</SelectItem>
                    <SelectItem value="founded">Founded Year</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 opacity-0">Clear</label>
                <Button 
                  variant="outline" 
                  className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={() => {
                    setFilterType('all');
                    setSectorFilter('all');
                    setCityFilter('all');
                    setYearFilter('all');
                    setSortBy('valuation');
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-gray-300">
            Showing <span className="font-bold text-white">{filteredCompanies.length}</span> companies
          </p>
        </div>

        {/* Companies Grid - Forbes Style */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => (
              <Card key={company.id} className="group bg-sidebar border-sidebar-border hover:border-sidebar-primary transition-all duration-300 hover:shadow-xl hover:shadow-sidebar-primary/20">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    {/* Rank Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-300 text-black' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-sidebar-accent text-sidebar-accent-foreground'
                      }`}>
                        #{index + 1}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      {company.isUnicorn ? (
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          🦄 UNICORN
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          🌟 SOONICORN
                        </div>
                      )}
                    </div>

                    {/* Company Logo/Image */}
                    <div className="h-48 bg-gradient-to-br from-sidebar-accent to-sidebar-primary/20 flex items-center justify-center relative overflow-hidden">
                      {company.logoUrl ? (
                        <img 
                          src={company.logoUrl} 
                          alt={`${company.name} logo`} 
                          className="w-20 h-20 object-contain rounded-full bg-white p-2"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-sidebar-primary rounded-full flex items-center justify-center">
                          <Building2 className="w-10 h-10 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>

                    {/* Company Info */}
                    <div className="p-6 space-y-4">
                      <div>
                        <Link to={`/startup/${company.id}`}>
                          <h3 className="text-xl font-bold text-white hover:text-sidebar-primary transition-colors cursor-pointer line-clamp-1">
                            {company.name}
                          </h3>
                        </Link>
                        <p className="text-gray-400 text-sm line-clamp-2 mt-1">{company.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Valuation</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                            {company.valuation}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Sector</span>
                          <span className="bg-sidebar-accent text-sidebar-accent-foreground px-2 py-1 rounded text-xs font-medium">
                            {company.sector}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Location</span>
                          <div className="flex items-center gap-1 text-gray-300">
                            <MapPin size={12} />
                            <span className="text-sm">{company.city}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Founded</span>
                          <div className="flex items-center gap-1 text-gray-300">
                            <Calendar size={12} />
                            <span className="text-sm">{company.foundedYear}</span>
                          </div>
                        </div>
                      </div>

                      <Link to={`/startup/${company.id}`}>
                        <Button className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No companies found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters to see more results.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterType('all');
                setSectorFilter('all');
                setCityFilter('all');
                setYearFilter('all');
              }}
              className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UnicornsIndia;
