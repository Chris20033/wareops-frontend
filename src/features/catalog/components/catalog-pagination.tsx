"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export function CatalogPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
}: CatalogPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalItems === 0) {
    return null;
  }

  const navigateToPage = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(targetPage));
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col items-start justify-between gap-3 border-t border-neutral-200/80 px-4 py-3 sm:flex-row sm:items-center">
      <p className="font-mono text-xs text-neutral-500 tabular-nums">
        Mostrando{" "}
        <span className="font-medium text-neutral-900">{startRecord}</span> a{" "}
        <span className="font-medium text-neutral-900">{endRecord}</span> de{" "}
        <span className="font-medium text-neutral-900">{totalItems}</span>{" "}
        registros
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={page <= 1}
          onClick={() => navigateToPage(page - 1)}
        >
          Anterior
        </Button>
        <span className="font-mono text-xs text-neutral-600 tabular-nums">
          Pág. {page} de {Math.max(1, totalPages)}
        </span>
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => navigateToPage(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
