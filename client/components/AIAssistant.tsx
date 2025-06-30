import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  Copy,
  Edit3,
  MessageSquare,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Star,
  Send,
  BarChart3,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  className?: string;
}

export function AIAssistant({ className }: AIAssistantProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sentiment, setSentiment] = useState<
    "positive" | "neutral" | "negative"
  >("positive");

  const generateSuggestion = async (type: string) => {
    setIsGenerating(true);

    // Simulate AI response generation
    setTimeout(() => {
      const suggestions = {
        summarize:
          "Customer inquired about order #AL-2024-0123 delivery status. Agent confirmed March 15th delivery date and offered expedited shipping options. Customer satisfied with response.",
        reply:
          "I'd be happy to help you with expedited shipping! For your location, we have 2-day express ($25) and overnight delivery ($45) available. Both include tracking and delivery confirmation. Would you like me to upgrade your order?",
        improve:
          "I'd be delighted to assist you with expedited shipping options! For your location, we offer 2-day express shipping ($25) and overnight delivery ($45). Both services include comprehensive tracking and delivery confirmation. Would you prefer to upgrade your current order to one of these premium shipping options?",
        professional:
          "Thank you for your inquiry regarding expedited shipping options. We are pleased to offer the following premium delivery services for your location: Express 2-Day Delivery ($25) and Overnight Delivery ($45). Both services include comprehensive tracking and delivery confirmation. Please let me know if you would like to proceed with upgrading your current order.",
        custom: customPrompt
          ? `Here's a response based on your request: "${customPrompt}"`
          : "",
      };

      setSuggestion(suggestions[type as keyof typeof suggestions] || "");
      setIsGenerating(false);
    }, 1500);
  };

  const copySuggestion = () => {
    navigator.clipboard.writeText(suggestion);
  };

  const useSuggestion = () => {
    // Here you would typically insert the suggestion into the chat input
    console.log("Using suggestion:", suggestion);
  };

  const provideFeedback = (positive: boolean) => {
    // Here you would send feedback to improve AI suggestions
    console.log("Feedback:", positive ? "positive" : "negative");
  };

  const getSentimentColor = () => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-gray-900 border-l border-gray-800",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">AI Copilot</h3>
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-400 text-xs"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
        <p className="text-sm text-gray-400">
          Suggest replies, summarize conversations, or improve message tone
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Sentiment Analysis */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Conversation Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Customer Sentiment:
                </span>
                <Badge className={cn("text-xs", getSentimentColor())}>
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Response Time:</span>
                <span className="text-sm text-green-400">2.3 min avg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Resolution Score:</span>
                <div className="flex items-center gap-1">
                  {[...Array(4)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <Star className="h-3 w-3 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => generateSuggestion("summarize")}
                disabled={isGenerating}
              >
                <FileText className="h-4 w-4 mr-2" />
                Summarize Conversation
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => generateSuggestion("reply")}
                disabled={isGenerating}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Suggest a Reply
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => generateSuggestion("improve")}
                disabled={isGenerating}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Improve Tone
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => generateSuggestion("professional")}
                disabled={isGenerating}
              >
                <Zap className="h-4 w-4 mr-2" />
                Make Professional
              </Button>
            </CardContent>
          </Card>

          {/* Custom AI Request */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white">
                Ask AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Ask AI to help with something specific..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 resize-none"
                rows={3}
              />
              <Button
                onClick={() => generateSuggestion("custom")}
                disabled={!customPrompt.trim() || isGenerating}
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Ask AI
              </Button>
            </CardContent>
          </Card>

          {/* AI Suggestion Output */}
          {(suggestion || isGenerating) && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  AI Suggestion
                  {isGenerating && (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isGenerating ? (
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-200 whitespace-pre-wrap">
                        {suggestion}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copySuggestion}
                        className="flex-1 border-gray-600 text-gray-300 hover:text-white"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-gray-600 text-gray-300 hover:text-white"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>

                    <Button
                      onClick={useSuggestion}
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Use This Suggestion
                    </Button>

                    {/* Feedback */}
                    <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-700">
                      <span className="text-xs text-gray-400">
                        Rate this suggestion:
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => provideFeedback(true)}
                          className="text-gray-400 hover:text-green-400 p-1"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => provideFeedback(false)}
                          className="text-gray-400 hover:text-red-400 p-1"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
