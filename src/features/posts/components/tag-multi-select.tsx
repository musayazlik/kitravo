"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

/** Searchable multi-select whose trigger shows the picked values as removable chips. */
export function TagMultiSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  emptyLabel,
  maxChips = 4,
}: {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
  placeholder?: string;
  emptyLabel?: string;
  maxChips?: number;
}) {
  const { t } = useI18n();
  const copy = t.posts.tags;
  const selected = options.filter((option) => value.includes(option.value));
  const toggle = (next: string) => onChange(value.includes(next) ? value.filter((v) => v !== next) : [...value, next]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          className="h-auto min-h-8 w-full justify-between px-2 py-1 font-normal"
        >
          <span className="flex flex-wrap items-center gap-1">
            {selected.length === 0 && <span className="px-0.5 text-muted-foreground">{placeholder ?? copy.placeholder}</span>}
            {selected.slice(0, maxChips).map((option) => (
              <Badge key={option.value} variant="secondary" className="gap-1 pe-1">
                {option.label}
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={fill(copy.remove, { name: option.label })}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggle(option.value);
                  }}
                  className="rounded-sm opacity-60 hover:opacity-100"
                >
                  <X className="size-3" />
                </span>
              </Badge>
            ))}
            {selected.length > maxChips && <Badge variant="outline">+{selected.length - maxChips}</Badge>}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={copy.search} />
          <CommandList>
            <CommandEmpty>{options.length ? copy.noMatch : (emptyLabel ?? copy.empty)}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const on = value.includes(option.value);
                return (
                  <CommandItem key={option.value} value={option.label} onSelect={() => toggle(option.value)}>
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border",
                        on ? "border-primary bg-primary text-primary-foreground" : "border-input [&_svg]:invisible",
                      )}
                    >
                      <Check className="size-3 text-current" />
                    </span>
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
