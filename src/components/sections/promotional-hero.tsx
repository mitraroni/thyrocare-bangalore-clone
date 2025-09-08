"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Network, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';

export const PromoHero = () => {
  const trustIndicators = [
    {
      icon: Shield,
      title: "Quality and Trust Service",
      description: "Reliable diagnostic solutions"
    },
    {
      icon: Award,
      title: "Premier Diagnostic Hub",
      description: "State-of-the-art facilities"
    },
    {
      icon: Network,
      title: "Expansive Health Network",
      description: "Wide coverage area"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#F8F0E8] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-40 w-24 h-24 bg-secondary rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 left-40 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Main Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Discount Banner */}
            <div className="inline-block">
              <Badge className="bg-primary text-white text-lg px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">
                Up To 40% OFF
              </Badge>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-[#343A40] leading-tight">
                <span className="relative">
                  Same trust
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"></div>
                </span>
                <br />
                <span className="text-primary">Better Prices!</span>
              </h1>
              
              <p className="text-xl text-[#6C757D] leading-relaxed">
                Advanced Diagnostics, Local Convenience
              </p>
              
              <p className="text-lg text-[#868E96] leading-relaxed max-w-md">
                Expert Diagnostic Services Right Around the Corner!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-[#D04846] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Book Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300"
              >
                Schedule Your Test
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              {trustIndicators.map((indicator, index) => (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <indicator.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-[#343A40] text-sm">
                      {indicator.title}
                    </h3>
                    <p className="text-xs text-[#868E96]">
                      {indicator.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image Section */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-blue-100 relative">
                {/* Medical Icon Overlay */}
                <div className="absolute top-6 right-6 bg-blue-500 p-4 rounded-full shadow-lg">
                  <div className="w-8 h-8 text-white font-bold flex items-center justify-center">
                    🩺
                  </div>
                </div>
                
                {/* Placeholder for Medical Professional Image */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="text-4xl">👩‍⚕️</div>
                    </div>
                    <h3 className="text-xl font-semibold text-[#343A40] mb-2">
                      Advanced Diagnostics, Local Convenience
                    </h3>
                    <p className="text-[#6C757D]">
                      Expert Diagnostic Services Right Around the Corner!
                    </p>
                    
                    {/* Trust Badges */}
                    <div className="flex justify-center space-x-4 mt-6">
                      <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full shadow-sm">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-medium">Quality and Trust Service</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full shadow-sm">
                        <Award className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium">Premier Diagnostic Hub</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full shadow-sm">
                        <Network className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium">Expansive Health Network</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="mt-6 bg-primary hover:bg-[#D04846] text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Schedule Your Test
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Bottom Section */}
              <div className="bg-white p-6">
                <h4 className="text-lg font-semibold text-[#343A40] text-center">
                  Expert Medical Care
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Contact Section */}
        <div className="mt-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <div className="grid md:grid-cols-4 gap-8 items-center">
            {/* Thyrocare Branding */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold text-[#343A40]">Thyrocare</span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="md:col-span-3 grid sm:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#343A40]">Phone</p>
                  <p className="text-sm text-[#6C757D]">9663955546</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#343A40]">Email</p>
                  <p className="text-sm text-[#6C757D]">aarogyamcentre1@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#343A40]">Hours</p>
                  <p className="text-sm text-[#6C757D]">Mon-Fri 9:00AM-6:00PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};