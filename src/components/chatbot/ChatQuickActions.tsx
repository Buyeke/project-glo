
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, Phone, AlertTriangle, Briefcase } from 'lucide-react';

interface QuickAction {
  label: Record<string, string>;
  message: Record<string, string>;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "destructive" | "outline";
}

interface ChatQuickActionsProps {
  currentLanguage: string;
  onActionClick: (message: string, language: string) => void;
}

export const ChatQuickActions = ({ currentLanguage, onActionClick }: ChatQuickActionsProps) => {
  const quickActions: QuickAction[] = [
    { 
      label: { english: "Shelter", swahili: "Makazi", sheng: "Base", arabic: "مأوى" },
      message: { english: "I need a place to sleep tonight", swahili: "Nahitaji mahali pa kulala leo usiku", sheng: "Nahitaji place ya kulala leo", arabic: "أحتاج مكان للنوم الليلة" },
      icon: MapPin,
      variant: "destructive" as const
    },
    { 
      label: { english: "Food", swahili: "Chakula", sheng: "Food", arabic: "طعام" },
      message: { english: "I'm hungry and need food", swahili: "Nina njaa na nahitaji chakula", sheng: "Nina njaa, nahitaji food", arabic: "أنا جوعان وأحتاج طعام" },
      icon: Heart,
      variant: "default" as const
    },
    { 
      label: { english: "Health", swahili: "Afya", sheng: "Health", arabic: "صحة" },
      message: { english: "I need medical help", swahili: "Nahitaji msaada wa kimatibabu", sheng: "Nahitaji medical help", arabic: "أحتاج مساعدة طبية" },
      icon: Phone,
      variant: "default" as const
    },
    { 
      label: { english: "Emergency", swahili: "Dharura", sheng: "Emergency", arabic: "طوارئ" },
      message: { english: "Help! I need urgent assistance", swahili: "Msaada! Nahitaji msaada wa haraka", sheng: "Help! Nahitaji msaada haraka", arabic: "مساعدة! أحتاج مساعدة عاجلة" },
      icon: AlertTriangle,
      variant: "destructive" as const
    },
    { 
      label: { english: "Talk", swahili: "Ongea", sheng: "Talk", arabic: "تحدث" },
      message: { english: "I need someone to talk to", swahili: "Nahitaji mtu wa kuongea naye", sheng: "Nahitaji mtu wa kuongea", arabic: "أحتاج شخص للحديث معه" },
      icon: Heart,
      variant: "outline" as const
    },
    { 
      label: { english: "Jobs", swahili: "Kazi", sheng: "Job", arabic: "وظائف" },
      message: { english: "I need help finding work", swahili: "Nahitaji msaada kupata kazi", sheng: "Nahitaji msaada kupata job", arabic: "أحتاج مساعدة في العثور على عمل" },
      icon: Briefcase,
      variant: "outline" as const
    }
  ];

  return (
    <div className="px-4 py-3 border-t bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="grid grid-cols-3 gap-1">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          const label = action.label[currentLanguage as keyof typeof action.label] || action.label.english;
          const message = action.message[currentLanguage as keyof typeof action.message] || action.message.english;
          
          return (
            <Button
              key={index}
              variant={action.variant}
              size="sm"
              onClick={() => onActionClick(message, currentLanguage)}
              className="text-xs h-8 px-2 flex items-center gap-1"
            >
              <Icon className="h-3 w-3" />
              <span className="truncate">{label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
