const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Multer for image upload
const upload = multer({ dest: 'uploads/' });

// Mock Data for Weather
const weatherData = {
    temp: 28,
    humidity: 65,
    rainfall: "Moderate",
    condition: "Cloudy"
};

// Mock Data for Market Prices
const marketPrices = [
    { crop: "Wheat", price: "2200/quintal", change: "+5%" },
    { crop: "Rice", price: "1900/quintal", change: "-2%" },
    { crop: "Cotton", price: "6000/quintal", change: "+1.5%" },
    { crop: "Maize", price: "1500/quintal", change: "0%" },
    { crop: "Tomato", price: "1200/quintal", change: "+10%" },
];

// Routes

// 1. Get Weather Info
app.get('/api/weather', (req, res) => {
    res.json(weatherData);
});

// 2. Crop Recommendation Logic
app.post('/api/recommend', (req, res) => {
    const { soil, season, budget, location, prevCrop } = req.body;
    let recommendations = [];

    // Simple Rule-Based Logic
    // Crops Database
    const crops = [
        { name: "Wheat", soil: ["loam", "clay"], season: "rabi", minBudget: 5000, details: "Requires cool climate. Good for North India." },
        { name: "Rice", soil: ["clay", "loam"], season: "kharif", minBudget: 8000, details: "High water requirement. Ideal for heavy rain areas." },
        { name: "Cotton", soil: ["black"], season: "kharif", minBudget: 10000, details: "Cash crop. Best in black soil regions." },
        { name: "Maize", soil: ["loam", "sandy"], season: "kharif", minBudget: 4000, details: "Versatile crop. Good fodder and food." },
        { name: "Mustard", soil: ["sandy", "loam"], season: "rabi", minBudget: 3000, details: "Low water needed. High oil content." },
        { name: "Watermelon", soil: ["sandy"], season: "zaid", minBudget: 5000, details: "Summer crop. High profit potential." },
        { name: "Soybean", soil: ["loam", "black"], season: "kharif", minBudget: 6000, details: "Nitrogen-fixing. Improves soil health." },
        { name: "Sugarcane", soil: ["loam", "clay"], season: "kharif", minBudget: 15000, details: "Long duration crop. High water need." },
        { name: "Barley", soil: ["sandy", "loam"], season: "rabi", minBudget: 3500, details: "Drought tolerant. Good for saline soil." }
    ];

    const cleanSoil = soil.toLowerCase();
    const cleanSeason = season.toLowerCase();
    const userBudget = parseFloat(budget) || 0;
    const cleanPrevCrop = prevCrop ? prevCrop.toLowerCase() : "";

    // Filter Logic
    recommendations = crops.filter(crop =>
        (crop.soil.includes(cleanSoil) || cleanSoil === 'all') &&
        (crop.season === cleanSeason || cleanSeason === 'all') &&
        userBudget >= crop.minBudget
    );

    // Apply Smart Insights (Simple Logic)
    recommendations = recommendations.map(crop => {
        let details = crop.details;

        // Crop Rotation Logic
        if (cleanPrevCrop.includes("soybean") || cleanPrevCrop.includes("pulse") || cleanPrevCrop.includes("legume")) {
            if (["maize", "wheat", "sugarcane"].includes(crop.name.toLowerCase())) {
                details += " (Highly Recommended: Good rotation after legumes)";
            }
        }

        // Location context (Mock Logic)
        if (location && location.toLowerCase().includes("north")) {
            if (["wheat", "mustard"].includes(crop.name.toLowerCase())) details += " (Suitable for this region)";
        }

        return { ...crop, details };
    });

    if (recommendations.length === 0) {
        recommendations.push({
            name: "General Mixed Vegetables",
            details: "Spinach, Radish, or Okra suitable for low budget or mixed conditions."
        });
    }

    res.json({ recommendations });
});

// 3. Image Analysis (Mock)
app.post('/api/analyze-image', upload.single('cropImage'), (req, res) => {
    // In a real app, this would use ML. Here we mock it.
    // Randomize result for demo fun
    const results = [
        { status: "Healthy", disease: "None", remedy: "Continue standard care." },
        { status: "Diseased", disease: "Leaf Spot", remedy: "Apply Fungicide X." },
        { status: "Diseased", disease: "Yellow Rust", remedy: "Spray Nitrogen supplement." }
    ];
    const randomResult = results[Math.floor(Math.random() * results.length)];

    // Simulate processing delay
    setTimeout(() => {
        res.json(randomResult);
    }, 1500);
});

// 4. Market Info
app.get('/api/market', (req, res) => {
    res.json(marketPrices);
});

// Serve Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
