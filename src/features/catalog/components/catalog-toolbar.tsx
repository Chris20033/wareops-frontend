"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export interface SortOption {
  label: string;
  value: string;
}

interface CatalogToolbarProps {
  searchPlaceholder?: string;
  sortOptions: SortOption[];
  extraFilters?: ReactNode;
  primaryAction?: ReactNode;
}

export function CatalogToolbar({
  searchPlaceholder = "Buscar...",
  sortOptions,
  extraFilters,
  primaryAction,
}: CatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";
  const currentStatus = searchParams.get("isActive") ?? "";
  const currentSort = searchParams.get("sort") ?? sortOptions[0]?.value ?? "";
  const currentOrder = searchParams.get("order") ?? "asc";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [prevSearch, setPrevSearch] = useState(currentSearch);

  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    setSearchInput(currentSearch);
  }

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value !== null && value.trim() !== "") {
        params.set(key, value.trim());
      } else {
        params.delete(key);
      }
    }
    // Always reset page to 1 when changing filters
    if (!("page" in updates)) {
      params.delete("page");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateParams({ search: searchInput });
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateParams({ isActive: event.target.value });
  };

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateParams({ sort: event.target.value });
  };

  const handleOrderToggle = () => {
    updateParams({ order: currentOrder === "asc" ? "desc" : "asc" });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    router.replace(pathname);
  };

  const hasActiveFilters = Boolean(
    currentSearch ||
    currentStatus ||
    (currentSort && currentSort !== sortOptions[0]?.value) ||
    currentOrder !== "asc" ||
    searchParams.get("branchId"),
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200/80 bg-white p-3.5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative flex-1">
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 text-xs"
              aria-label={searchPlaceholder}
            />
          </div>
          <Button type="submit" size="xs" variant="outline">
            Buscar
          </Button>
          {hasActiveFilters ? (
            <Button
              type="button"
              size="xs"
              variant="secondary"
              onClick={handleClearFilters}
            >
              Limpiar
            </Button>
          ) : null}
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {extraFilters}

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-500">Estado:</span>
            <Select
              aria-label="Filtrar por estado activo"
              value={currentStatus}
              onChange={handleStatusChange}
              className="h-8 w-28 text-xs"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </Select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-500">Orden:</span>
            <Select
              aria-label="Ordenar registros por campo"
              value={currentSort}
              onChange={handleSortChange}
              className="h-8 w-32 text-xs"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={handleOrderToggle}
              title={`Dirección: ${currentOrder === "asc" ? "Ascendente" : "Descendente"}`}
              aria-label={`Orden ${currentOrder === "asc" ? "ascendente" : "descendente"}`}
            >
              {currentOrder === "asc" ? "Asc ↑" : "Desc ↓"}
            </Button>
          </div>

          {primaryAction ? <div className="pl-1">{primaryAction}</div> : null}
        </div>
      </div>
    </div>
  );
}
