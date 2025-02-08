require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json()); // Đọc dữ liệu JSON từ request
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MongoDB URI is missing in .env file!");
    process.exit(1);
}

// Kết nối MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// Định nghĩa Schema dựa trên cấu trúc trong App.jsx
const formSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 18 },
    email: { type: String, required: true, match: /\S+@\S+\.\S+/ },
    gender: { type: String, required: true, enum: ["Nam", "Nữ", "Khác"] },
    relatives: [{
        relativeName: String,
        relativePhone: { type: String, match: /^[0-9]{10}$/ } // 10 chữ số
    }]
});

// Model tương ứng với MongoDB
const FormData = mongoose.model("FormData", formSchema);

// API xử lý form data từ ReactJS
app.post("/submit", async (req, res) => {
    try {
        console.log("📩 Nhận dữ liệu từ client:", req.body);

        // Tạo instance từ FormData model
        const newData = new FormData(req.body);
        await newData.save();

        res.status(201).json({ message: "✅ Data saved successfully!" });
    } catch (error) {
        console.error("❌ Error saving data:", error);
        res.status(500).json({ error: "Error saving data" });
    }
});

// API lấy danh sách dữ liệu đã lưu
app.get("/data", async (req, res) => {
    try {
        const data = await FormData.find();
        res.status(200).json(data);
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        res.status(500).json({ error: "Error fetching data" });
    }
});

// Khởi động server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
