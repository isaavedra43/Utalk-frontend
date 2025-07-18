import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Lightbulb,
  BarChart3,
  Clock,
  MessageSquare,
  Sparkles,
  Brain,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIActionsProps {
  isLoading: boolean;
  onAIAction: (action: string, contactId?: string) => void;
  selectedContactId: string | null;
  className?: string;
}

export function AIActions({
  isLoading,
  onAIAction,
  selectedContactId,
  className,
}: AIActionsProps) {
  const aiActions = [
    {
      id: "summarize",
      label: "Resumir",
      icon: Bot,
      description: "Generate conversation summary",
      color: "text-blue-400 hover:text-blue-300",
      bgColor: "hover:bg-blue-500/10",
      requiresSelection: true,
    },
    {
      id: "suggest-response",
      label: "Sugerir Respuesta",
      icon: Lightbulb,
      description: "AI response suggestions",
      color: "text-yellow-400 hover:text-yellow-300",
      bgColor: "hover:bg-yellow-500/10",
      requiresSelection: true,
    },
    {
      id: "sentiment-analysis",
      label: "Analizar Sentimiento",
      icon: MessageSquare,
      description: "Detect conversation sentiment",
      color: "text-green-400 hover:text-green-300",
      bgColor: "hover:bg-green-500/10",
      requiresSelection: true,
    },
    {
      id: "classify-lead",
      label: "AI Score",
      icon: BarChart3,
      description: "Classify lead potential",
      color: "text-blue-400 hover:text-blue-300",
      bgColor: "hover:bg-blue-500/10",
      requiresSelection: true,
    },
    {
      id: "auto-reminder",
      label: "Recordar",
      icon: Clock,
      description: "Schedule follow-up reminder",
      color: "text-orange-400 hover:text-orange-300",
      bgColor: "hover:bg-orange-500/10",
      requiresSelection: true,
    },
    {
      id: "bulk-analysis",
      label: "Análisis Masivo",
      icon: Brain,
      description: "Analyze all visible contacts",
      color: "text-cyan-400 hover:text-cyan-300",
      bgColor: "hover:bg-cyan-500/10",
      requiresSelection: false,
    },
    {
      id: "trend-analysis",
      label: "Tendencias",
      icon: TrendingUp,
      description: "Analyze conversation trends",
      color: "text-pink-400 hover:text-pink-300",
      bgColor: "hover:bg-pink-500/10",
      requiresSelection: false,
    },
    {
      id: "optimize-responses",
      label: "Optimizar IA",
      icon: Sparkles,
      description: "Optimize AI responses",
      color: "text-indigo-400 hover:text-indigo-300",
      bgColor: "hover:bg-indigo-500/10",
      requiresSelection: false,
    },
  ];

  return (
    <div
      className={cn("border-b border-gray-800 bg-gray-900/50 p-3", className)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-medium text-white">AI Actions</h3>
          {selectedContactId && (
            <Badge className="bg-blue-600 text-white text-xs">
              Contact Selected
            </Badge>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </div>

      {/* AI Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {aiActions.map((action) => {
          const Icon = action.icon;
          const isDisabled =
            isLoading || (action.requiresSelection && !selectedContactId);

          return (
            <Button
              key={action.id}
              size="sm"
              variant="outline"
              disabled={isDisabled}
              onClick={() =>
                onAIAction(action.id, selectedContactId || undefined)
              }
              className={cn(
                "h-8 border-gray-600 transition-all duration-200",
                isDisabled
                  ? "text-gray-500 border-gray-700 cursor-not-allowed"
                  : cn(
                      "text-gray-300 hover:text-white border-gray-600",
                      action.color,
                      action.bgColor,
                    ),
              )}
              title={action.description}
            >
              <Icon className="h-3 w-3 mr-1.5" />
              {action.label}
            </Button>
          );
        })}
      </div>

      {/* Help Text */}
      {!selectedContactId && (
        <p className="text-xs text-gray-500 mt-2">
          Select a contact to enable individual AI actions
        </p>
      )}

      {/* AI Status Indicators */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-800">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">AI Model: Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-400">Real-time Analysis: On</span>
          </div>
        </div>

        <div className="text-xs text-gray-500">Last AI update: 2 mins ago</div>
      </div>
    </div>
  );
}
