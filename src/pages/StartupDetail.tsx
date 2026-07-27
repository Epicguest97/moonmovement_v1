import { API_BASE_URL } from '@/config';

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Calendar, TrendingUp, MapPin, Users, Globe, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const StartupDetail = () => {
  const { startupId } = useParams<{ startupId: string }>();
  const [startup, setStartup] = useState<UnicornCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStartup = async () => {
      if (!startupId) {
        setError('No startup ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/startups/${startupId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch startup');
        }
        const startupData = await response.json();
        setStartup(startupData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch startup');
        console.error('Error fetching startup:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStartup();
  }, [startupId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-300">Loading startup details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !startup) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            {error ? 'Error loading startup' : 'Startup not found'}
          </h2>
          <p className="text-gray-300">
            {error || 'The startup you\'re looking for doesn\'t exist.'}
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4 bg-sidebar-primary hover:bg-sidebar-primary/90">
            Retry
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6 bg-sidebar border-sidebar-border">
          <CardContent className="p-8">
            <div className="flex items-start gap-6 mb-6">
              {startup.logoUrl && (
                <img 
                  src={startup.logoUrl} 
                  alt={`${startup.name} logo`} 
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{startup.name}</h1>
                  {startup.isUnicorn ? (
                    <span className="bg-sidebar-primary text-sidebar-primary-foreground px-3 py-1 rounded font-medium">
                      🦄 Unicorn
                    </span>
                  ) : (
                    <span className="bg-yellow-600 text-yellow-100 px-3 py-1 rounded font-medium">
                      🌟 Soonicorn
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-lg mb-4">{startup.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-sidebar-primary" />
                    <div>
                      <p className="text-xs text-gray-400">Valuation</p>
                      <p className="text-sidebar-primary font-bold text-lg">{startup.valuation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Sector</p>
                      <p className="text-white font-medium">{startup.sector}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Location</p>
                      <p className="text-white font-medium">{startup.city}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Founded</p>
                      <p className="text-white font-medium">{startup.foundedYear}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Company Overview</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Business Model</h4>
                  <p className="text-gray-400">
                    {startup.sector === 'E-commerce' && 'Online marketplace connecting buyers and sellers across multiple categories.'}
                    {startup.sector === 'EdTech' && 'Technology-driven educational platform offering personalized learning experiences.'}
                    {startup.sector === 'Fintech' && 'Digital financial services platform offering payments and banking solutions.'}
                    {startup.sector === 'Food Delivery' && 'On-demand food delivery platform connecting restaurants with customers.'}
                    {startup.sector === 'Automotive' && 'Digital platform for buying and selling pre-owned vehicles.'}
                    {startup.sector === 'HealthTech' && 'Digital healthcare platform providing medical services and pharmacy solutions.'}
                    {startup.sector === 'Social Commerce' && 'Social media-driven commerce platform enabling peer-to-peer selling.'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Market Position</h4>
                  <p className="text-gray-400">
                    {startup.isUnicorn 
                      ? 'Leading player in the Indian startup ecosystem with proven market dominance.'
                      : 'Emerging player with strong growth potential in the Indian market.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Company Age</span>
                  <span className="text-white font-medium">{2025 - startup.foundedYear} years</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Status</span>
                  <span className="text-white font-medium">
                    {startup.isUnicorn ? 'Unicorn' : 'Soonicorn'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Valuation Range</span>
                  <span className="text-white font-medium">
                    {startup.valuationNumber >= 1 ? '$1B+' : '$500M+'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Market</span>
                  <span className="text-white font-medium">India</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default StartupDetail;
