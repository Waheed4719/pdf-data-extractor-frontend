import express from "express";
import cors from "cors";
import pdfParse from 'pdf-parse';
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5100;

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Endpoint to extract data from a static PDF
app.get('/extract-pdf', async (req, res) => {
    try {
      const pdfPath = path.join(__dirname, 'public', 'test-pdf.pdf');
      const pdfBuffer = fs.readFileSync(pdfPath);
  
      pdfParse(pdfBuffer).then(function(data) {
        res.send(data.text);
      });
    } catch (error) {
      console.error('Error extracting PDF data:', error);
      res.status(500).send('Failed to extract data from PDF');
    }
  });

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
