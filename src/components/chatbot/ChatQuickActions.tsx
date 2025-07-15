
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
        english: "Shelter", 
        swahili: "Makazi", 
        sheng: "Base", 
        arabic: "مأوى" 
      },
      message: { 
        english: "I need a place to sleep tonight", 
        swahili: "Nahitaji mahali pa kulala leo usiku", 
        sheng: "Bro, sina base ya kulala leo. Niko baridi sana na sina mahali.", 
        arabic: "أحتاج مكان للنوم الليلة" 
      },
      icon: MapPin,
      variant: "destructive" as const
    },
    { 
      label: { 
        english: "Food", 
        swahili: "Chakula", 
        sheng: "Dishi", 
        arabic: "طعام" 
      },
      message: { 
        english: "I'm hungry and need food", 
        swahili: "Nina njaa na nahitaji chakula", 
        sheng: "Maze, nina njaa kubwa. Sina pesa ya food. Nisaidie kupata dishi.", 
        arabic: "أنا جوعان وأحتاج طعام" 
      },
      icon: Heart,
      variant: "default" as const
    },
    { 
      label: { 
        english: "Health", 
        swahili: "Afya", 
        sheng: "Doki", 
        arabic: "صحة" 
      },
      message: { 
        english: "I need medical help", 
        swahili: "Nahitaji msaada wa kimatibabu", 
        sheng: "Bro, nahitaji kuona doki haraka. Nina shida ya health na sina pesa ya hospital.", 
        arabic: "أحتاج مساعدة طبية" 
      },
      icon: Phone,
      variant: "default" as const
    },
    { 
      label: { 
        english: "Emergency", 
        swahili: "Dharura", 
        sheng: "Emergency", 
        arabic: "طوارئ" 
      },
      message: { 
        english: "Help! I need urgent assistance", 
        swahili: "Msaada! Nahitaji msaada wa haraka", 
        sheng: "Emergency bro! Nahitaji msaada haraka sana. Hii ni dharura kubwa.", 
        arabic: "مساعدة! أحتاج مساعدة عاجلة" 
      },
      icon: AlertTriangle,
      variant: "destructive" as const
    },
    { 
      label: { 
        english: "Money", 
        swahili: "Pesa", 
        sheng: "Dough", 
        arabic: "نقود" 
      },
      message: { 
        english: "I need financial help", 
        swahili: "Nahitaji msaada wa kifedha", 
        sheng: "Maze, sina dough kabisa. Nimejam na sina chapaa ya basic needs.", 
        arabic: "أحتاج مساعدة مالية" 
      },
      icon: DollarSign,
      variant: "outline" as const
    },
    { 
      label: { 
        english: "Work", 
        swahili: "Kazi", 
        sheng: "Hustle", 
        arabic: "وظائف" 
      },
      message: { 
        english: "I need help finding work", 
        swahili: "Nahitaji msaada kupata kazi", 
        sheng: "Bro, nahitaji msaada kupata hustle. Nina skills lakini sina connections za job.", 
        arabic: "أحتاج مساعدة في العثور على عمل" 
      },
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
              className="text-xs h-8 px-2 flex items-center gap-1 hover:scale-105 transition-transform"
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
