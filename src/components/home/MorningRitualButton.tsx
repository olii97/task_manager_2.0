import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sunrise } from 'lucide-react';

export const MorningRitualButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/morning-ritual')}
      className="w-full bg-gradient-to-r from-[#2C3E50] to-[#E74C3C] hover:from-[#34495E] hover:to-[#C0392B] text-white py-8 rounded-xl text-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
    >
      <Sunrise className="h-6 w-6" />
      <span>Start Your Morning Ritual</span>
    </Button>
  );
}; 