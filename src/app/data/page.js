"use client";
import { useEffect, useState } from "react";
import { Table, Input, Button } from "antd";
import { useRouter } from "next/navigation";

export default function StockPage() {
  const [data, setData] = useState([]); // Original data from API
  const [filteredData, setFilteredData] = useState([]); // Data after filtering
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetch("/api/stock") // Fetch stock data from API
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data:", data); // ✅ Place inside `.then()`
        setData(data);
        setFilteredData(data); // Set both data and filteredData initially
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stock data:", err);
        setLoading(false);
      });
  }, []);

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    const filtered = data.filter((item) =>
      item.item.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  // Define Ant Design Table columns
  const columns = [
    { title: "Item", dataIndex: "item", key: "item" },
    // { title: "HSN Code", dataIndex: "hsn_code", key: "hsn_code" },
    { title: "Purchase Qty", dataIndex: "purchase_qty", key: "purchase_qty" },
    { title: "Sale Qty", dataIndex: "sale_qty", key: "sale_qty" },
    { title: "Stock Qty", dataIndex: "stock_qty", key: "stock_qty" },
    { 
      title: "Rate", 
      dataIndex: "rate", 
      key: "rate",
      render: (value) => value ?? "-", // ✅ Handle null values
    },
    { title: "Total Amount", dataIndex: "total_amount", key: "total_amount" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Stock Data</h1>
      <div className="space-y-4">
        <button
          className="rounded-md border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg
      text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2 active:bg-slate-900 disabled:pointer-events-none disabled:opacity-50"
          onClick={() => router.push(`/`)}
        >
          Home Page
        </button>

        <Input
          placeholder="Search Item"
          value={searchText}
          onChange={handleSearch}
          className="w-full"
        />

        {/* Table with filtered data */}
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 12 }}
        />
      </div>
    </div>
  );
}
