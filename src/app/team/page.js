"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Badge, Modal, Button, Select, Input, DatePicker, Table } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function TeamPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = searchParams.get("user");
  const [currentUser,setCurrentUser]=useState("")
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [items, setItems] = useState([]); // Store stock items
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentStock, setCurrentStock] = useState(""); // Store current stock value
  const [batchFields, setBatchFields] = useState([]);
  const [srNo, setSrNo] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItemTeam, setSelectedItemTeam] = useState(""); // Track team of selected item
  const [teamName, setTeamName] = useState("New Entry");
  const [tableData, setTableData] = useState([]); // Store batch data
  const [isEditable,setIsEditable]=useState(true);

  useEffect(() => {
    if (user) {
      let formattedUser = user;
      
      if (user === "teamblue") formattedUser = "Team Blue";
      else if (user === "teamred") formattedUser = "Team Red";
      setCurrentUser(formattedUser);
    }
  }, [user]);
  
  


  useEffect(() => {
    if (batchFields.length > 0) {
      setTeamName(batchFields[0].team || "New Entry");
    }
  }, [batchFields]);
  const addBatchField = () => {
    setBatchFields([
      ...batchFields,
      { lot: "", expiry: null, stock: "", mrp: "" },
    ]);
  };

  const openModal = () => {
   
    setSelectedItem(null); // Reset only the item selection
    setIsModalOpen(true); // Open modal
    setSrNo("");
    setCurrentStock("");
    setBatchFields([]);
  };
 

  const deleteBatchField = async (index, batchId) => {
    if (!batchId) {
      console.error("❌ Missing batchId! Cannot delete.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this batch?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/batchdata?batchId=${batchId}`, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete batch from database");
      }

      // ✅ Remove from UI only after successful deletion
      setBatchFields((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("❌ Error deleting batch:", error);
      alert(error.message);
    }
  };

  const handleBatchChange = (index, field, value) => {
    const newBatchFields = [...batchFields];
    newBatchFields[index][field] = value;
    setBatchFields(newBatchFields);
  };

  useEffect(() => {
    setIsModalOpen(true);

    // Fetch stock items from API
    fetch("/api/stock")
      .then((res) => res.json())
      .then((data) => {
        setItems(data); // Store fetched stock data
      })
      .catch((err) => console.error("Error fetching stock data:", err));
  }, []);

  const handleOk = async () => {
    if (!selectedItem) {
      alert("Please select an item before saving!");
      return;
    }

    // Separate existing and new batches
    const existingBatches = batchFields.filter((batch) => batch.id); // Has ID → Update
    const newBatches = batchFields.filter((batch) => !batch.id); // No ID → Create

    try {
      // ✅ Update existing batches (PUT)
      if (existingBatches.length > 0) {
        const updateResponse = await fetch("/api/batchdata", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: selectedItem,
            batchFields: existingBatches,
            team:currentUser,
          }),
        });

        if (!updateResponse.ok) throw new Error("Failed to update batch data");
      }

      // ✅ Add new batches (POST)
      if (newBatches.length > 0) {
        const createResponse = await fetch("/api/batchdata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: selectedItem,
            batchFields: newBatches,
            team:currentUser,
          }),
        });

        if (!createResponse.ok)
          throw new Error("Failed to create new batch data");
      }

      console.log("✅ Batch data saved/updated successfully");
      setIsModalOpen(false); // Close modal
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Failed to save batch data");
    }
  };

  const handleCancel = () => setIsModalOpen(false);

  // Handle item selection
 const handleItemChange = async (value) => {
  setSelectedItem(value);
  setIsEditMode(false);
  setIsEditable(false);

  const selected = items.find((item) => item.id === value);
  if (!selected) {
    console.warn("⚠️ No matching item found!");
    return;
  }

  setCurrentStock(selected.stock_qty);
  setSrNo(selected.sr_no || "");

  try {
    // 🔹 Fetch the team handling this product from stock_data
    const response = await fetch(`/api/stockdata?itemId=${value}`);
    const stockData = await response.json();

    const team = stockData.team || "New Entry";
    setTeamName(team);

    if (team === "New Entry" || team === currentUser) {
      // ✅ If the product is free or assigned to the current team, allow editing
      setIsEditable(true);

      // 🔹 Assign the product to the team if it's a new entry
      if (team === "New Entry") {
        await fetch(`/api/stockdata`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: value, team: currentUser }),
        });
      }
    } else {
      // ❌ If another team is handling the item, block editing
      setIsEditable(false);
      alert(`❌ This item is currently assigned to ${team}.`);
    }

    // 🔹 Fetch batch data for this item
    const batchResponse = await fetch(`/api/batchdata?itemId=${value}`);
    const batchData = await batchResponse.json();
    if (batchResponse.ok) {
      setBatchFields(batchData.length > 0 ? batchData : []);
      setIsEditMode(batchData.length > 0);
    } else {
      console.error("❌ Error fetching batch data:", batchData.error);
    }
  } catch (error) {
    console.error("⚠️ Network error:", error);
  }
};

  
  
  
  

  // Calculate Total Batch Stock
  const totalBatchStock = batchFields.reduce(
    (sum, batch) => sum + (Number(batch.stock) || 0),
    0
  );

  // Calculate Remaining Stock
  const remainingStock = currentStock - totalBatchStock;



  // Fetch batch data with item names
  useEffect(() => {
    fetch("/api/tabledata")
      .then((res) => res.json())
      .then((data) => {
        setTableData(data);
        console.log("Fetched Data:", tableData); // ✅ Log data before setting state
      })
      .catch((err) => console.error("Error fetching batch data:", err));
  }, []);
  


  const columns = [
    {
      title: "Item Name",
      dataIndex: "item_name",
      key: "item_name",
    },
    {
      title: "Lot/Batch",
      dataIndex: "lot",
      key: "lot",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Expiry",
      dataIndex: "expiry",
      key: "expiry",
      render: (date) => date ? dayjs(date).format("DD-MM-YYYY") : "N/A"
    },
    {
      title: "Team",
      dataIndex: "team",
      key: "team",
      render: (team) => (
        <span style={{ color: team === "Team Red" ? "red" : team === "Team Blue" ? "blue" : "black" }}>
          {team}
        </span>
      ),
    },

  ];

  const expandedRowRender = (record) => {
    const batchColumns = [
      { title: "Lot", dataIndex: "lot", key: "lot" },
      { title: "Expiry Date", dataIndex: "expiry", key: "expiry", render: (date) => date ? dayjs(date).format("YYYY-MM-DD") : "N/A" },
      { title: "Stock", dataIndex: "stock", key: "stock" },
      { title: "MRP", dataIndex: "mrp", key: "mrp" },
      { title: "Team", dataIndex: "team", key: "team" },
    ];
  }
    // return <Table columns={batchColumns} dataSource={record.batches} rowKey="id" pagination={false} />;}







  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Popup Modal  */}

      <div>
        <Modal
          title="Welcome!"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={isEditMode ? "Edit" : "Save"}
          width={800}
          okButtonProps={{ disabled: !isEditable }}
        >
          <Badge.Ribbon
            text={teamName}
            color={
              teamName === "teamblue"
                ? "blue"
                : teamName === "New Entry"
                ? "green"
                : "red"
            }
          >
            <Card>
              <p className="mb-4">
                Hello! Welcome{" "}
                {currentUser.replace(/\b\w/g, (char) => char.toUpperCase())}.
              </p>

              {/* 🔹 Top Section: Current Item Details */}
              {!isEditable && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4">
                  Editing is only permitted for{" "}
                  <strong>{teamName}</strong>. Please forward this to
                  the respective team.
                </div>
              )}
              <div className="mb-4">
                <label className="block font-medium mb-1">Select Item</label>
                <Select
                  showSearch
                  placeholder="Select an item"
                  optionFilterProp="label"
                  className="w-full"
                  onChange={handleItemChange}
                  value={selectedItem} // Ensures it resets when modal opens
                  options={items.map((item) => ({
                    label: item.item,
                    value: item.id,
                  }))}
                  // disabled={!isEditable}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Current Stock Field */}
                <div>
                  <label className="block font-medium mb-1">
                    Current Stock
                  </label>
                  <Input
                    className="w-full"
                    value={currentStock}
                    placeholder="Current Stock"
                    disabled
                  />
                </div>

                {/* SR NO Field (Placed on the Right) */}
                <div>
                  <label className="block font-medium mb-1">SR NO</label>
                  <Input
                    className="w-full"
                    value={srNo}
                    placeholder="SR NO"
                    disabled
                  />
                </div>
              </div>

              {/* 🔹 Separation Line */}
              <hr className="my-4 border-gray-300" />

              {/* 🔹 Bottom Section: Add Batch Fields */}
              <h3 className="text-lg font-semibold mb-2">Add Batch Details</h3>

              {/* Table Header (Single Row) */}
              {batchFields.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-2 font-medium text-gray-700">
                  <span>LOT/Batch</span>
                  <span>Expiry Date</span>
                  <span>Stock</span>
                  <span>MRP</span>
                </div>
              )}

              {/* Batch Fields (Without Repeating Labels) */}
              {batchFields.map((batch, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-2 mb-2 items-center"
                >
                  <Input
                    placeholder="Enter LOT/Batch"
                    value={batch.lot}
                    onChange={(e) =>
                      handleBatchChange(index, "lot", e.target.value)
                    }
                    disabled={!isEditable}
                  />
                  <DatePicker
                    className="w-full"
                    placeholder="Select Date"
                    value={batch.expiry ? dayjs(batch.expiry) : null} // ✅ Use dayjs
                    onChange={(date) => {
                      
                      handleBatchChange(
                        index,
                        "expiry",
                        date ? date.toISOString() : null
                      );
                    }}
                    disabled={!isEditable}
                  />
                  <Input
                    placeholder="Enter Stock"
                    value={batch.stock}
                    onChange={(e) =>
                      handleBatchChange(index, "stock", e.target.value)
                      
                    }
                    disabled={!isEditable}

                  />
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter MRP"
                      value={batch.mrp}
                      onChange={(e) =>
                        handleBatchChange(index, "mrp", e.target.value)
                      }
                      disabled={!isEditable}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => deleteBatchField(index, batch.id)}
                      disabled={!isEditable}
                    />
                  </div>
                </div>
              ))}

              {/* ➕ Add More Button */}
              <Button
                type="dashed"
                className="w-full flex items-center justify-center"
                icon={<PlusOutlined />}
                onClick={addBatchField}
                disabled={!isEditable}
              >
                Add Batch
              </Button>

              {/* 🔹 Stock Calculation */}
              <p className="mt-4 text-lg font-medium text-gray-700">
                Current Stock - Total Batch Stock ={" "}
                <span className="font-bold">{remainingStock}</span>
              </p>
            </Card>
          </Badge.Ribbon>
        </Modal>
      </div>

      {/* Team Info */}
      <h1 className="text-2xl font-bold mb-4">
        Welcome {user === "teamblue" ? "Team Blue" : "Team Red"}!
      </h1>
      {/* Buttons */}
      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => router.push("/")}
          className="bg-blue-500 text-white"
        >
          Home Page
        </Button>
        <Button type="primary" onClick={openModal}>
          Add New
        </Button>
      </div>
      {/* Expandable Table */}
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="id"
        expandable={{ expandedRowRender }}
        bordered
      />
    </div>

  );
}
