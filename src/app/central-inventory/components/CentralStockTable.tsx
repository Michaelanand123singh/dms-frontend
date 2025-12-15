"use client";
import { DataTable, Column } from "@/components/data-display/DataTable/DataTable";
import { Badge } from "@/components/ui/Badge";
import type { CentralStock } from "@/shared/types/central-inventory.types";

interface CentralStockTableProps {
  data: CentralStock[];
  loading?: boolean;
  onRowClick?: (stock: CentralStock) => void;
}

export function CentralStockTable({ data, loading = false, onRowClick }: CentralStockTableProps) {
  const getStatusBadge = (status: CentralStock["status"]) => {
    const variants: Record<CentralStock["status"], "success" | "warning" | "danger"> = {
      "In Stock": "success",
      "Low Stock": "warning",
      "Out of Stock": "danger",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const columns: Column<CentralStock>[] = [
    {
      key: "partName",
      header: "Part Name",
      render: (item) => (
        <div>
          <p className="font-medium">{item.partName}</p>
          {item.partCode && <p className="text-xs text-gray-400">Code: {item.partCode}</p>}
        </div>
      ),
    },
    {
      key: "hsnCode",
      header: "HSN Code / Part Number",
      render: (item) => (
        <div>
          <p className="text-sm">{item.hsnCode}</p>
          <p className="text-xs text-gray-400">{item.partNumber}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item) => <span className="text-sm text-gray-600">{item.category}</span>,
    },
    {
      key: "currentQty",
      header: "Current Qty",
      align: "right",
      render: (item) => <span className="font-medium">{item.currentQty}</span>,
    },
    {
      key: "minMax",
      header: "Min / Max",
      align: "right",
      render: (item) => (
        <span className="text-sm text-gray-600">
          {item.minStock} / {item.maxStock}
        </span>
      ),
    },
    {
      key: "unitPrice",
      header: "Unit Price",
      align: "right",
      render: (item) => <span>₹{item.unitPrice.toLocaleString()}</span>,
    },
    {
      key: "totalValue",
      header: "Total Value",
      align: "right",
      render: (item) => (
        <span className="font-medium">₹{(item.currentQty * item.unitPrice).toLocaleString()}</span>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (item) => (
        <div>
          <p className="text-sm">{item.location}</p>
          <p className="text-xs text-gray-400">{item.warehouse}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (item) => getStatusBadge(item.status),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(item) => item.id}
      loading={loading}
      emptyMessage="No stock items found"
    />
  );
}

