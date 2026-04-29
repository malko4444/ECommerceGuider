import mongoose from "mongoose";


const vendorSchema = new mongoose.Schema(
  {
    vendorName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Home Decor",
        "Electronics",
        "IT Services",
        "Clothing",
        "Food Supplier",
        "Construction",
        "Marketing",
        "Other",
      ],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("Vendor", vendorSchema);