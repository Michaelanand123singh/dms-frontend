"use client";
import { ReactNode } from "react";
import { Table, TableHeader, TableRow, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.key} align={column.align || "left"}>
              {column.header}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <tbody>
        {data.map((item) => (
          <TableRow key={keyExtractor(item)}>
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align || "left"}>
                {column.render ? column.render(item) : (item[column.key as keyof T] as ReactNode)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}

