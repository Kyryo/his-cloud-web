"use client";

import type { ReactNode } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageToolbarActions,
  ListPageToolbarFilters,
  ListPageToolbarSearch,
  ListPageToolbarSection,
} from "@/features/app-shell/components/page-layout/list-page-toolbar-section";
import { cn } from "@/lib/utils";

const TOOLBAR_CONTROL_CLASS =
  "h-10 rounded-lg border-dash-border bg-white text-brand-slate";

type ListPageSearchFieldProps = {
  id?: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  "data-testid"?: string;
};

export function ListPageSearchField({
  id,
  value,
  placeholder,
  disabled = false,
  onChange,
  onSubmit,
  "data-testid": dataTestId,
}: ListPageSearchFieldProps) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <AppIcon
        name="search"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dash-muted"
        size={16}
      />
      <Input
        id={id}
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        disabled={disabled}
        className="h-10 w-full rounded-lg border-dash-border bg-white pl-9"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSubmit();
          }
        }}
        data-testid={dataTestId}
      />
    </div>
  );
}

type ListPageSearchButtonProps = {
  disabled?: boolean;
  onClick: () => void;
  "data-testid"?: string;
};

export function ListPageSearchButton({
  disabled = false,
  onClick,
  "data-testid": dataTestId,
}: ListPageSearchButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      className={TOOLBAR_CONTROL_CLASS}
      onClick={onClick}
      data-testid={dataTestId}
    >
      Search
    </Button>
  );
}

type ListPageClearSearchButtonProps = {
  disabled?: boolean;
  onClick: () => void;
  "data-testid"?: string;
};

export function ListPageClearSearchButton({
  disabled = false,
  onClick,
  "data-testid": dataTestId,
}: ListPageClearSearchButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      className={TOOLBAR_CONTROL_CLASS}
      onClick={onClick}
      data-testid={dataTestId}
    >
      Clear
    </Button>
  );
}

type ListPageFilterButtonProps = {
  disabled?: boolean;
  activeCount?: number;
  onClick: () => void;
  "data-testid"?: string;
};

export function ListPageFilterButton({
  disabled = false,
  activeCount = 0,
  onClick,
  "data-testid": dataTestId,
}: ListPageFilterButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      className={cn(TOOLBAR_CONTROL_CLASS, "px-4")}
      onClick={onClick}
      data-testid={dataTestId}
    >
      <AppIcon name="add" size={16} />
      Add filter
      {activeCount > 0 ? (
        <Badge variant="secondary" className="ml-1 px-1.5 py-0">
          {activeCount}
        </Badge>
      ) : null}
    </Button>
  );
}

type ListPageSearchToolbarProps = {
  search: string;
  searchId?: string;
  placeholder: string;
  searchTestId?: string;
  searchSubmitTestId?: string;
  clearTestId?: string;
  isLoading?: boolean;
  showSearchButton?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  filter?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

export function ListPageSearchToolbar({
  search,
  searchId,
  placeholder,
  searchTestId,
  searchSubmitTestId,
  clearTestId,
  isLoading = false,
  showSearchButton = true,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  filter,
  trailing,
  className,
}: ListPageSearchToolbarProps) {
  return (
    <ListPageToolbarSection
      className={cn(!trailing && "lg:justify-start", className)}
    >
      <ListPageToolbarSearch className="flex">
        <ListPageSearchField
          id={searchId}
          value={search}
          placeholder={placeholder}
          disabled={isLoading}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
          data-testid={searchTestId}
        />
        <ListPageToolbarActions>
          {showSearchButton ? (
            <ListPageSearchButton
              disabled={isLoading}
              onClick={onSearchSubmit}
              data-testid={searchSubmitTestId}
            />
          ) : null}
          {filter}
          {search ? (
            <ListPageClearSearchButton
              disabled={isLoading}
              onClick={onClearSearch}
              data-testid={clearTestId}
            />
          ) : null}
        </ListPageToolbarActions>
      </ListPageToolbarSearch>
      {trailing ? (
        <ListPageToolbarFilters>{trailing}</ListPageToolbarFilters>
      ) : null}
    </ListPageToolbarSection>
  );
}
