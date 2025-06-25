require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Apple = require("./models/Apple");

const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv"); 

const app = express();
app.use(cors());
app.use(express.json());

//tells the server how to handle file uploads (CSV), storing them temporarily my uploads folder
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Default route
app.get("/", (req, res) => {
  res.send(" Apple Explorer API is live!");
});

// GET apples filters 
app.get("/apples", async (req, res) => {
  try {
    const {
      cultivarName,
      accession,
      originCountry,
      originProvince,
      originCity,
      genus,
      species,
      pedigree,
      harvestDate
    } = req.query;

    const baseFilter = {};

    if (cultivarName) baseFilter.cultivarName = { $regex: new RegExp(cultivarName, "i") };
    if (accession) baseFilter.accession = accession;
    if (harvestDate) baseFilter.harvestDate = harvestDate;

    const results = await Apple.aggregate([
      {
        $lookup: {
          from: "Origin",
          localField: "originId",
          foreignField: "_id",
          as: "origin"
        }
      },
      {
        $lookup: {
          from: "AppleProfile",
          localField: "appleProfileId",
          foreignField: "_id",
          as: "profile"
        }
      },
      { $unwind: "$origin" },
      { $unwind: "$profile" },
      {
        $match: {
          ...baseFilter,
          ...(originCountry && { "origin.country": { $regex: new RegExp(originCountry, "i") } }),
          ...(originProvince && { "origin.province": { $regex: new RegExp(originProvince, "i") } }),
          ...(originCity && { "origin.city": { $regex: new RegExp(originCity, "i") } }),
          ...(genus && { "profile.genus": { $regex: new RegExp(genus, "i") } }),
          ...(species && { "profile.species": { $regex: new RegExp(species, "i") } }),
          ...(pedigree && { "profile.pedigree": { $regex: new RegExp(pedigree, "i") } })
        }
      }
    ]);

    res.json(results);
  } catch (err) {
    console.error("Error fetching filtered apples:", err);
    res.status(500).json({ error: "Failed to fetch filtered apples" });
  }
});


// POST a new apple, this just adds single apples 
app.post("/apples", async (req, res) => {
  try {
    const {
      accession,
      cultivarName,
      harvestDate,
      tasteNotes,
      notes,
      appleProfileId,
      physicalAttributesId,
      originId
    } = req.body;

    if (!accession || !cultivarName || !originId) {
      return res.status(400).json({ error: "Missing required fields: accession, cultivarName, or originId" });
    }

    const duplicate = await Apple.findOne({
      $or: [{ accession }, { cultivarName }]
    });

    if (duplicate) {
      return res.status(409).json({ error: "Duplicate accession or cultivarName" });
    }

    const newApple = new Apple({
      accession: accession.trim(),
      cultivarName: cultivarName.trim(),
      harvestDate: harvestDate?.trim(),
      tasteNotes: tasteNotes?.trim(),
      notes: notes?.trim(),
      appleProfileId,
      physicalAttributesId,
      originId
    });

    await newApple.save();
    res.status(201).json({ message: "Apple added successfully", data: newApple });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add apple" });
  }
});

// Upload CSV and import apples/ bulk
app.post("/apples/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const results = [];
  const errors = [];
  const filePath = path.join(__dirname, req.file.path);

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      const isValid =
        row.accession &&
        row.cultivarName &&
        row.originId &&
        row.accession.trim() !== "" &&
        row.cultivarName.trim() !== "" &&
        row.originId.trim() !== "";

      if (!isValid) {
        errors.push({ row, error: "Missing required fields" });
        return;
      }

      results.push({
        accession: row.accession.trim(),
        cultivarName: row.cultivarName.trim(),
        harvestDate: row.harvestDate?.trim() || null,
        tasteNotes: row.tasteNotes?.trim() || null,
        notes: row.notes?.trim() || null,
        appleProfileId: row.appleProfileId || null,
        physicalAttributesId: row.physicalAttributesId || null,
        originId: row.originId.trim()
      });
    })
.on("end", async () => {
  const inserted = [];

  for (const data of results) {
    const duplicate = await Apple.findOne({
      $or: [
        { accession: data.accession },
        { cultivarName: data.cultivarName }
      ]
    });

    if (!duplicate) {
      try {
        const newApple = new Apple(data);
        await newApple.save();
        inserted.push(newApple);
      } catch (err) {
        errors.push({ row: data, error: "MongoDB error" });
      }
    } else {
      errors.push({ row: data, error: "Duplicate accession or cultivarName" });
    }
  }
  });

  fs.unlinkSync(filePath); // Delete uploaded file

  // Save errors to logs
  if (errors.length > 0) {
    const logsDir = path.join(__dirname, "logs");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

    fs.writeFileSync(
      path.join(logsDir, "upload_errors.json"),
      JSON.stringify(errors, null, 2)
    );

    const errorFields = ["row.accession", "row.cultivarName", "error"];
    const errorParser = new Parser({ fields: errorFields, flatten: true });
    const errorCsv = errorParser.parse(errors);
    fs.writeFileSync(path.join(logsDir, "upload_errors.csv"), errorCsv);
  }

  res.json({
    message: "CSV processed",
    insertedCount: inserted.length,
    skippedCount: errors.length,
    errors
  });
});

app.get("/apples/upload/errors", (req, res) => {
  const errorFile = "logs/upload_errors.csv";

  if (!fs.existsSync(errorFile)) {
    return res.status(404).json({ error: "No error log found" });
  }

  res.download(errorFile, "upload_errors.csv");
});

// CSV Export Route
// CSV Export Route with filtering, sorting, and pagination
app.get("/apples/export", async (req, res) => {
  try {
    const {
      cultivarName,
      accession,
      originCountry,
      originProvince,
      originCity,
      genus,
      species,
      pedigree,
      harvestDate,
      sortBy = "cultivarName",
      order = "asc",
      page = 1,
      limit = 10
    } = req.query;

    const baseFilter = {};
    if (cultivarName) baseFilter.cultivarName = { $regex: new RegExp(cultivarName, "i") };
    if (accession) baseFilter.accession = accession;
    if (harvestDate) baseFilter.harvestDate = harvestDate;

    const apples = await Apple.aggregate([
      {
        $lookup: {
          from: "Origin",
          localField: "originId",
          foreignField: "_id",
          as: "origin"
        }
      },
      {
        $lookup: {
          from: "AppleProfile",
          localField: "appleProfileId",
          foreignField: "_id",
          as: "profile"
        }
      },
      { $unwind: "$origin" },
      { $unwind: "$profile" },
      {
        $match: {
          ...baseFilter,
          ...(originCountry && { "origin.country": { $regex: new RegExp(originCountry, "i") } }),
          ...(originProvince && { "origin.province": { $regex: new RegExp(originProvince, "i") } }),
          ...(originCity && { "origin.city": { $regex: new RegExp(originCity, "i") } }),
          ...(genus && { "profile.genus": { $regex: new RegExp(genus, "i") } }),
          ...(species && { "profile.species": { $regex: new RegExp(species, "i") } }),
          ...(pedigree && { "profile.pedigree": { $regex: new RegExp(pedigree, "i") } })
        }
      },
      { $sort: { [sortBy]: order === "desc" ? -1 : 1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ]);

    if (!apples.length) {
      return res.status(404).json({ error: "No apples found to export" });
    }

    const fields = [
      "accession",
      "cultivarName",
      "harvestDate",
      "tasteNotes",
      "notes",
      "appleProfileId",
      "physicalAttributesId",
      "originId"
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(apples);

    res.header("Content-Type", "text/csv");
    res.attachment("filtered_apple_data.csv");
    res.send(csv);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ error: "Failed to export apples" });
  }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});