import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingCardProps {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  type:
    | "toggle"
    | "select"
    | "textarea"
    | "number"
    | "multiselect"
    | "checkboxList";
  value: any;
  onChange: (value: any) => void;
  options?: string[] | { key: string; label: string }[];
  placeholder: string;
  min?: number;
  max?: number;
}

export function SettingCard({
  label,
  description,
  icon: Icon,
  type,
  value,
  onChange,
  options = [],
  placeholder,
  min,
  max,
}: SettingCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  // Validation function
  const validateValue = (newValue: any) => {
    setError(null);
    setIsValid(true);

    if (type === "number") {
      const num = Number(newValue);
      if (isNaN(num)) {
        setError("Debe ser un número válido");
        setIsValid(false);
        return false;
      }
      if (min !== undefined && num < min) {
        setError(`Valor mínimo: ${min}`);
        setIsValid(false);
        return false;
      }
      if (max !== undefined && num > max) {
        setError(`Valor máximo: ${max}`);
        setIsValid(false);
        return false;
      }
    }

    if (type === "textarea" && newValue && newValue.length > 500) {
      setError("Máximo 500 caracteres");
      setIsValid(false);
      return false;
    }

    return true;
  };

  // Handle value changes with validation
  const handleChange = (newValue: any) => {
    if (validateValue(newValue)) {
      onChange(newValue);
      console.log(`${placeholder} changed to:`, newValue);
    }
  };

  // Render different control types
  const renderControl = () => {
    switch (type) {
      case "toggle":
        if (Array.isArray(options) && options.length === 2) {
          // Binary toggle (e.g., "12h" vs "24h")
          return (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  value === options[0] ? "text-white" : "text-gray-500",
                )}
              >
                {options[0]}
              </span>
              <Switch
                checked={value === options[1]}
                onCheckedChange={(checked) =>
                  handleChange(checked ? options[1] : options[0])
                }
                className="data-[state=checked]:bg-blue-600"
              />
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  value === options[1] ? "text-white" : "text-gray-500",
                )}
              >
                {options[1]}
              </span>
            </div>
          );
        } else {
          // Simple on/off toggle
          return (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  !value ? "text-white" : "text-gray-500",
                )}
              >
                Off
              </span>
              <Switch
                checked={value}
                onCheckedChange={handleChange}
                className="data-[state=checked]:bg-blue-600"
              />
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  value ? "text-white" : "text-gray-500",
                )}
              >
                On
              </span>
            </div>
          );
        }

      case "select":
        return (
          <Select value={value} onValueChange={handleChange}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {options.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="text-white hover:bg-gray-700"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "textarea":
        return (
          <div className="space-y-2">
            <Textarea
              value={value || ""}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Introduce tu firma..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[80px]"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">
                {value ? value.length : 0}/500 caracteres
              </span>
              {value && value.includes("{{") && (
                <Badge className="bg-blue-600 text-white text-xs">
                  Variables disponibles
                </Badge>
              )}
            </div>
          </div>
        );

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => handleChange(Number(e.target.value))}
            min={min}
            max={max}
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            placeholder={`${min || 0} - ${max || 100}`}
          />
        );

      case "multiselect":
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1 min-h-[32px] p-2 bg-gray-800 border border-gray-600 rounded">
              {Array.isArray(value) && value.length > 0 ? (
                value.map((item: string) => (
                  <Badge key={item} className="bg-blue-600 text-white text-xs">
                    {item}
                    <button
                      onClick={() =>
                        handleChange(value.filter((v: string) => v !== item))
                      }
                      className="ml-1 hover:bg-blue-700 rounded"
                    >
                      ×
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-gray-400 text-sm">
                  No hay elementos seleccionados
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {options.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant="outline"
                  disabled={Array.isArray(value) && value.includes(option)}
                  onClick={() => {
                    const currentValue = Array.isArray(value) ? value : [];
                    if (!currentValue.includes(option)) {
                      handleChange([...currentValue, option]);
                    }
                  }}
                  className="h-8 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      case "checkboxList":
        return (
          <div className="space-y-2">
            {options.map((option) => {
              const optionKey =
                typeof option === "string" ? option : option.key;
              const optionLabel =
                typeof option === "string" ? option : option.label;
              const isChecked =
                Array.isArray(value) && value.includes(optionKey);

              return (
                <div key={optionKey} className="flex items-center gap-2">
                  <Checkbox
                    id={optionKey}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const currentValue = Array.isArray(value) ? value : [];
                      if (checked) {
                        handleChange([...currentValue, optionKey]);
                      } else {
                        handleChange(
                          currentValue.filter((v: string) => v !== optionKey),
                        );
                      }
                    }}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label
                    htmlFor={optionKey}
                    className="text-sm text-gray-300 cursor-pointer"
                  >
                    {optionLabel}
                  </label>
                </div>
              );
            })}
          </div>
        );

      default:
        return (
          <div className="text-gray-400 text-sm">Control no soportado</div>
        );
    }
  };

  return (
    <Card className="bg-[#1E1F23] border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/20">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="p-2 rounded-lg bg-gray-700/50"
            style={{ marginRight: "12px" }}
          >
            <Icon className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-semibold text-white leading-tight"
              style={{ fontSize: "16px" }}
            >
              {label}
            </h3>
            <p
              className="text-xs text-gray-400 leading-relaxed mt-1"
              style={{ fontSize: "14px" }}
            >
              {description}
            </p>
          </div>
          {/* Status indicator */}
          <div className="flex-shrink-0">
            {isValid ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
          </div>
        </div>

        {/* Control */}
        <div className="space-y-2">
          {renderControl()}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>{error}</span>
            </div>
          )}

          {/* Placeholder info for debugging */}
          <div className="text-xs text-gray-600 opacity-50">{placeholder}</div>
        </div>
      </CardContent>
    </Card>
  );
}
