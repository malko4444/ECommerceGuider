import express from "express";

const vendorRouter = express.Router();
import Vendor from "../models/Vendor.js";


vendorRouter.get("/dashboard",async (req, res) => {
  
  try {
    const vendors = await Vendor.find({});
    res.json({ vendors });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vendors", details: error.message });
  }
});

vendorRouter.post("/add", async (req, res) => {
  try {
    console.log("Received vendor data:", req.body);

    const { vendorName, category, website, email } = req.body;

    const newVendor = new Vendor({
      vendorName,
      category,
      website,
      email
    });

    console.log("Created new vendor instance:", newVendor);

    const vendorSaved = await newVendor.save();

    console.log("Vendor saved to database:", vendorSaved);

    return res.status(201).json({
      message: "Vendor added successfully",
      vendor: vendorSaved
    });

  } catch (error) {
    console.log("SAVE ERROR:", error); // 🔥 IMPORTANT
    return res.status(500).json({
      error: "Failed to add vendor",
      details: error.message
    });
  }
});
// delete vendor
vendorRouter.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedVendor = await Vendor.findByIdAndDelete(id);

    if (!deletedVendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json({
      message: `Vendor with ID ${id} deleted successfully`,
      vendor: deletedVendor
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to delete vendor", details: error.message });
  }
});
// update vendor
vendorRouter.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorName, category, website, email } = req.body;

    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      { vendorName, category, website, email },
      { new: true, runValidators: true }   // ← both flags matter
    );

    if (!updatedVendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json({
      message: `Vendor with ID ${id} updated successfully`,
      vendor: updatedVendor
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update vendor",
      details: error.message
    });
  }
});

export default vendorRouter;
 