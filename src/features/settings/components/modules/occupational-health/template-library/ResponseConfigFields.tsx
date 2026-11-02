"use client";

import { Plus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { OhResponseConfig } from "@/features/occupational-health/types";
import {
  defaultResponseConfig,
  normalizeResponseConfig,
  OH_RESPONSE_TYPES,
  type OhResponseType,
} from "@/features/settings/components/modules/occupational-health/template-library/responseConfig";
import { cn } from "@/lib/utils";

type ResponseConfigFieldsProps = {
  value: OhResponseConfig;
  onChange: (next: OhResponseConfig) => void;
  disabled?: boolean;
  className?: string;
};

const OPTION_TYPES = new Set<string>(["boolean", "single_select", "multi_select"]);
const NUMERIC_TYPES = new Set<string>(["number", "decimal"]);
const TEXT_TYPES = new Set<string>(["text"]);

export function ResponseConfigFields({
  value,
  onChange,
  disabled,
  className,
}: ResponseConfigFieldsProps) {
  const config = normalizeResponseConfig(value);
  const responseType = config.response_type as OhResponseType;
  const showOptions = OPTION_TYPES.has(responseType);
  const showNumericValidation = NUMERIC_TYPES.has(responseType);
  const showTextValidation = TEXT_TYPES.has(responseType);

  function patch(partial: Partial<OhResponseConfig>) {
    onChange(normalizeResponseConfig({ ...config, ...partial }));
  }

  function setResponseType(nextType: OhResponseType) {
    if (nextType === responseType) {
      return;
    }
    const next = defaultResponseConfig(nextType);
    onChange(next);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label>Response type</Label>
        <Select
          value={responseType}
          onValueChange={(next) => setResponseType(next as OhResponseType)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose type" />
          </SelectTrigger>
          <SelectContent>
            {OH_RESPONSE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start justify-between gap-3 rounded-xl border border-dash-border px-3 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-brand-navy">Ask after selecting</p>
          <p className="mt-0.5 text-xs leading-5 text-dash-muted">
            When off, picking an item (radio/checkbox) is enough — no Yes/No under it.
          </p>
        </div>
        <Switch
          checked={config.prompt_after_select}
          disabled={disabled}
          onCheckedChange={(checked) => patch({ prompt_after_select: checked })}
          aria-label="Ask for a response after selecting an item"
        />
      </div>

      {showOptions && config.prompt_after_select ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Options</Label>
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                patch({
                  options: [
                    ...config.options,
                    { code: "", label: "" },
                  ],
                })
              }
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline disabled:opacity-50"
            >
              <Plus className="size-3.5" aria-hidden />
              Add
            </button>
          </div>
          <div className="space-y-2">
            {config.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option.label}
                  disabled={disabled}
                  placeholder="Label"
                  onChange={(event) => {
                    const options = [...config.options];
                    options[index] = { ...options[index], label: event.target.value };
                    patch({ options });
                  }}
                />
                <Input
                  value={option.code}
                  disabled={disabled}
                  placeholder="Code"
                  className="font-mono text-[13px]"
                  onChange={(event) => {
                    const options = [...config.options];
                    options[index] = { ...options[index], code: event.target.value };
                    patch({ options });
                  }}
                />
                <button
                  type="button"
                  disabled={disabled || config.options.length <= 1}
                  aria-label="Remove option"
                  onClick={() => {
                    patch({ options: config.options.filter((_, i) => i !== index) });
                  }}
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {showNumericValidation ? (
        <ValidationPair
          disabled={disabled}
          min={config.validation.min}
          max={config.validation.max}
          minLabel="Min"
          maxLabel="Max"
          onMinChange={(min) =>
            patch({ validation: { ...config.validation, min } })
          }
          onMaxChange={(max) =>
            patch({ validation: { ...config.validation, max } })
          }
        />
      ) : null}

      {showTextValidation ? (
        <ValidationPair
          disabled={disabled}
          min={config.validation.min_length}
          max={config.validation.max_length}
          minLabel="Min length"
          maxLabel="Max length"
          onMinChange={(min_length) =>
            patch({ validation: { ...config.validation, min_length } })
          }
          onMaxChange={(max_length) =>
            patch({ validation: { ...config.validation, max_length } })
          }
        />
      ) : null}
    </div>
  );
}

function ValidationPair({
  disabled,
  min,
  max,
  minLabel,
  maxLabel,
  onMinChange,
  onMaxChange,
}: {
  disabled?: boolean;
  min?: number;
  max?: number;
  minLabel: string;
  maxLabel: string;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label>{minLabel}</Label>
        <Input
          type="number"
          disabled={disabled}
          value={min ?? ""}
          onChange={(event) => {
            const raw = event.target.value.trim();
            onMinChange(raw === "" ? undefined : Number(raw));
          }}
        />
      </div>
      <div className="space-y-2">
        <Label>{maxLabel}</Label>
        <Input
          type="number"
          disabled={disabled}
          value={max ?? ""}
          onChange={(event) => {
            const raw = event.target.value.trim();
            onMaxChange(raw === "" ? undefined : Number(raw));
          }}
        />
      </div>
    </div>
  );
}
