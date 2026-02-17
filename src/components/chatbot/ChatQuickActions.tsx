
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, Phone, AlertTriangle, Briefcase, DollarSign } from 'lucide-react';

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
      label: { 
        sheng: "Makao", 
        swahili: "Makazi", 
        english: "Shelter", 
        arabic: "مأوى" 
      },
      message: { 
        sheng: "Mresh, sina place ya kulala leo. Naeza get shelter safe?", 
        swahili: "Nahitaji mahali pa kulala leo usiku salama", 
        english: "I need a safe place to sleep tonight", 
        arabic: "أحتاج مكان آمن للنوم الليلة" 
      },
      icon: MapPin,
      variant: "destructive" as const
    },
    { 
      label: { 
        sheng: "Chakula", 
        swahili: "Chakula", 
        english: "Food", 
        arabic: "طعام" 
      },
      message: { 
        sheng: "Mresh, nina njaa sana. Naeza get food ama dishi?", 
        swahili: "Nina njaa na nahitaji chakula", 
        english: "I'm hungry and need food", 
        arabic: "أنا جوعان وأحتاج طعام" 
      },
      icon: Heart,
      variant: "default" as const
    },
    { 
      label: { 
        sheng: "Doki", 
        swahili: "Afya", 
        english: "Health", 
        arabic: "صحة" 
      },
      message: { 
        sheng: "Mresh, siko poa. Naeza get help ya health?", 
        swahili: "Siko vizuri na nahitaji msaada wa kimatibabu", 
        english: "I'm not feeling well and need medical help", 
        arabic: "لست بخير وأحتاج مساعدة طبية" 
      },
      icon: Phone,
      variant: "default" as const
    },
    { 
      label: { 
        sheng: "Legal Aid", 
        swahili: "Msaada wa Kisheria", 
        english: "Legal Help", 
        arabic: "مساعدة قانونية" 
      },
      message: { 
        sheng: "Mresh, nina case ya legal. Naeza get lawyer?", 
        swahili: "Nina tatizo la kisheria na nahitaji lawyer", 
        english: "I have a legal issue and need a lawyer", 
        arabic: "لدي مشكلة قانونية وأحتاج محامي" 
      },
      icon: AlertTriangle,
      variant: "outline" as const
    },
    { 
      label: { 
        sheng: "Job", 
        swahili: "Kazi", 
        english: "Work", 
        arabic: "عمل" 
      },
      message: { 
        sheng: "Mresh, naeza get job opportunities? Nataka kufanya kazi", 
        swahili: "Naeza kupata fursa za kazi?", 
        english: "Can I get job opportunities?", 
        arabic: "هل يمكنني الحصول على فرص عمل؟" 
      },
      icon: Briefcase,
      variant: "outline" as const
    },
    { 
      label: { 
        sheng: "Mental Health", 
        swahili: "Afya ya Akili", 
        english: "Counseling", 
        arabic: "صحة نفسية" 
      },
      message: { 
        sheng: "Mresh, niko down sana. Naeza get counselor?", 
        swahili: "Nimehuzunika na nahitaji counselor", 
        english: "I'm feeling down and need counseling", 
        arabic: "أشعر بالحزن وأحتاج إلى مستشار" 
      },
      icon: Heart,
      variant: "default" as const
    }
  ];

  return (
    <div className="px-4 py-3 border-t bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="grid grid-cols-3 gap-1">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          const label = action.label[currentLanguage as keyof typeof action.label] || action.label.sheng;
          const message = action.message[currentLanguage as keyof typeof action.message] || action.message.sheng;
          
          return (
            <Button
              key={index}
              variant={action.variant}
              size="sm"
              onClick={() => onActionClick(message, currentLanguage)}
              className="text-xs h-8 px-2 flex items-center gap-1 hover:scale-105 transition-transform"
            >
              <Icon className="h-3 w-3" />
              <span className="truncate">{label}</span>
            </Button>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-gray-600 text-center">
        Unaweza pause ama stop wakati wowote. Uko safe hapa.
      </div>
    </div>
  );
};
