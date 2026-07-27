import { API_BASE_URL } from '@/config';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, Users, TrendingUp, X } from 'lucide-react';

interface Startup {
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

interface District {
  id: string;
  name: string;
  state: string;
  coordinates: [number, number];
  color: string;
}

const IndianDistricts = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  // Sample Indian districts with coordinates (this would be much larger in real implementation)
  const districts: District[] = [
    { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', coordinates: [19.0760, 72.8777], color: '#FF6B6B' },
    { id: 'bangalore', name: 'Bangalore', state: 'Karnataka', coordinates: [12.9716, 77.5946], color: '#4ECDC4' },
    { id: 'delhi', name: 'New Delhi', state: 'Delhi', coordinates: [28.6139, 77.2090], color: '#45B7D1' },
    { id: 'pune', name: 'Pune', state: 'Maharashtra', coordinates: [18.5204, 73.8567], color: '#96CEB4' },
    { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', coordinates: [17.3850, 78.4867], color: '#FFEAA7' },
    { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', coordinates: [13.0827, 80.2707], color: '#DDA0DD' },
    { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', coordinates: [22.5726, 88.3639], color: '#F4A261' },
    { id: 'gurgaon', name: 'Gurgaon', state: 'Haryana', coordinates: [28.4595, 77.0266], color: '#E76F51' },
    { id: 'noida', name: 'Noida', state: 'Uttar Pradesh', coordinates: [28.5355, 77.3910], color: '#2A9D8F' },
    { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', coordinates: [23.0225, 72.5714], color: '#E9C46A' },
    { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', coordinates: [26.9124, 75.7873], color: '#F4A4A4' },
    { id: 'kochi', name: 'Kochi', state: 'Kerala', coordinates: [9.9312, 76.2673], color: '#A8E6CF' },
    { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', coordinates: [22.7196, 75.8577], color: '#FFB6C1' },
    { id: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', coordinates: [11.0168, 76.9558], color: '#87CEEB' },
    { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', coordinates: [26.8467, 80.9462], color: '#DEB887' },
  ];

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/startups`);
      if (!response.ok) throw new Error('Failed to fetch startups');
      const data = await response.json();
      setStartups(data);
    } catch (error) {
      console.error('Error fetching startups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictClick = (district: District) => {
    setSelectedDistrict(district);
    // Filter startups by city/district
    const filtered = startups.filter(startup => 
      startup.city.toLowerCase().includes(district.name.toLowerCase()) ||
      district.name.toLowerCase().includes(startup.city.toLowerCase())
    );
    setFilteredStartups(filtered);
  };

  const closeModal = () => {
    setSelectedDistrict(null);
    setFilteredStartups([]);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Indian Startup Districts</h1>
          <p className="text-sm md:text-base text-gray-300">Explore startups across different districts in India</p>
        </div>

        {/* Interactive India Map */}
        <Card className="bg-sidebar border-sidebar-border overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
              <MapPin className="w-5 h-5" />
              Interactive District Map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative bg-gradient-to-br from-blue-900 to-green-900 h-64 md:h-96 overflow-hidden">
              {/* SVG Map Container */}
              <svg 
                viewBox="0 0 800 500" 
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
              >
                {/* India Outline (simplified) */}
                <path
                  d="M150 100 L650 100 L700 150 L680 300 L600 380 L400 400 L200 380 L100 300 L120 200 Z"
                  fill="rgba(255,255,255,0.1)"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                />
                
                {/* District Points */}
                {districts.map((district) => {
                  const x = (district.coordinates[1] - 68) * 8 + 100; // Longitude to X
                  const y = 400 - (district.coordinates[0] - 8) * 10; // Latitude to Y
                  
                  return (
                    <g key={district.id}>
                      {/* District Circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r={hoveredDistrict === district.id ? 10 : 6}
                        fill={district.color}
                        stroke="white"
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200 hover:scale-125"
                        onClick={() => handleDistrictClick(district)}
                        onMouseEnter={() => setHoveredDistrict(district.id)}
                        onMouseLeave={() => setHoveredDistrict(null)}
                        style={{
                          filter: hoveredDistrict === district.id ? 'brightness(1.2)' : 'none'
                        }}
                      />
                      
                      {/* District Label */}
                      <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                        className="pointer-events-none hidden md:block"
                        style={{
                          textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                          opacity: hoveredDistrict === district.id ? 1 : 0.8
                        }}
                      >
                        {district.name}
                      </text>
                      
                      {/* Pulse Effect for Selected */}
                      {selectedDistrict?.id === district.id && (
                        <circle
                          cx={x}
                          cy={y}
                          r="15"
                          fill="none"
                          stroke={district.color}
                          strokeWidth="3"
                          opacity="0.5"
                          className="animate-ping"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
              
              {/* Legend */}
              <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-black bg-opacity-70 p-2 md:p-3 rounded-lg">
                <h3 className="text-white font-semibold mb-2 text-xs md:text-sm">Districts</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2 text-xs">
                  {districts.slice(0, 6).map((district) => (
                    <div key={district.id} className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: district.color }}
                      />
                      <span className="text-white text-xs truncate">{district.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Total Districts</p>
                  <p className="text-lg md:text-2xl font-bold text-white">{districts.length}</p>
                </div>
                <MapPin className="w-6 h-6 md:w-8 md:h-8 text-sidebar-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Total Startups</p>
                  <p className="text-lg md:text-2xl font-bold text-white">{startups.length}</p>
                </div>
                <Building2 className="w-6 h-6 md:w-8 md:h-8 text-sidebar-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Unicorns</p>
                  <p className="text-lg md:text-2xl font-bold text-white">{startups.filter(s => s.isUnicorn).length}</p>
                </div>
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-sidebar-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">States Covered</p>
                  <p className="text-lg md:text-2xl font-bold text-white">{new Set(districts.map(d => d.state)).size}</p>
                </div>
                <Users className="w-6 h-6 md:w-8 md:h-8 text-sidebar-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* District Modal */}
        {selectedDistrict && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-sidebar border-sidebar-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-sidebar-border">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
                    <div 
                      className="w-3 h-3 md:w-4 md:h-4 rounded-full" 
                      style={{ backgroundColor: selectedDistrict.color }}
                    />
                    <span className="truncate">{selectedDistrict.name}, {selectedDistrict.state}</span>
                  </h2>
                  <p className="text-gray-400 text-xs md:text-sm">
                    {filteredStartups.length} startups found in this district
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="p-4 md:p-6 max-h-80 md:max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Loading startups...</p>
                  </div>
                ) : filteredStartups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredStartups.map((startup) => (
                      <Card key={startup.id} className="bg-sidebar-accent border-sidebar-border">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {startup.logoUrl && (
                              <img 
                                src={startup.logoUrl} 
                                alt={startup.name}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white text-sm md:text-base truncate">{startup.name}</h3>
                              <p className="text-xs md:text-sm text-gray-400 mb-2 line-clamp-2">{startup.description}</p>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs bg-sidebar-primary text-sidebar-primary-foreground px-2 py-1 rounded truncate">
                                  {startup.sector}
                                </span>
                                <span className="text-xs md:text-sm font-bold text-sidebar-primary truncate">
                                  {startup.valuation}
                                </span>
                              </div>
                              {startup.isUnicorn && (
                                <div className="mt-2">
                                  <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
                                    🦄 Unicorn
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No startups found in this district</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Try clicking on other districts like Mumbai, Bangalore, or Delhi
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default IndianDistricts;
