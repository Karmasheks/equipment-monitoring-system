import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataTableProps<TData> {
  data: TData[];
  columns: {
    accessorKey: keyof TData | ((row: TData) => any);
    header: string;
    cell?: (row: TData) => React.ReactNode;
  }[];
  onRowClick?: (row: TData) => void;
  className?: string;
}

export function DataTable<TData>({
  data,
  columns,
  onRowClick,
  className,
}: DataTableProps<TData>) {
  return (
    <div className={`w-full overflow-auto ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, i) => (
              <TableHead key={i} className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-6 text-sm text-gray-500">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow 
                key={i} 
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
              >
                {columns.map((column, j) => (
                  <TableCell key={j} className="whitespace-nowrap">
                    {column.cell ? (
                      column.cell(row)
                    ) : (
                      <div className="text-sm text-gray-900">
                        {typeof column.accessorKey === "function"
                          ? column.accessorKey(row)
                          : row[column.accessorKey] !== undefined
                          ? String(row[column.accessorKey])
                          : ""}
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
