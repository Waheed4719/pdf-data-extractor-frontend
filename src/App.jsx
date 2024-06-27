import { useEffect, useState } from "react";
import "./App.css";
import AdobeViewer from "./components/AdobeViewer";
import Button from "./components/Button";
import Dropzone from "./components/Dropzone";

const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [urlToPDF, setUrlToPDF] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [downloadURL, setDownloadURL] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const pdf = url.searchParams.get("pdf");
    if (pdf) setUrlToPDF(`${SERVER_URL}/${pdf}`);
  }, []);

  const handleFileUpload = (files) => {
    const file = files[0];
    if (!file) return;
    if (file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setUrlToPDF(url);
      setPdfFile(file);
      updateUrlParam(file.name);
    } else {
      console.log("Excel file", file);
      setExcelFile(file);
    }
  };

  const updateUrlParam = (fileName) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("pdf", fileName);
    window.history.pushState({ path: newUrl.href }, "", newUrl.href);
  };

  const handleSubmit = (file, endpoint) => {
    const formData = new FormData();
    formData.append(endpoint === "upload-xlFile" ? "xlFile" : "pdfFile", file);
    if (endpoint === "upload-xlFile")
      formData.append("pdfFile", urlToPDF.split("/").slice(-1)?.[0]);
    fetch(`${SERVER_URL}/${endpoint}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (endpoint === "upload-pdf") {
          setUrlToPDF(`${SERVER_URL}/${data.file.filename}`);
          updateUrlParam(data.file.filename);
        } else {
          setDownloadURL(`${SERVER_URL}/${data.xlsxURL}`);
        }
        console.log(data);
      });
  };

  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          backgroundColor: "#27272a",
          borderRadius: 8,
          border: "1px solid darkslategray",
        }}
      >
        {urlToPDF && <AdobeViewer urlToPDF={urlToPDF} />}
      </div>
      <div
        style={{
          flex: "30%",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "whitesnow",
          padding: 20,
        }}
      >
        <FileSection
          title="Select PDF File"
          file={pdfFile}
          handleFileUpload={handleFileUpload}
          handleSubmit={() => handleSubmit(pdfFile, "upload-pdf")}
        />
        {urlToPDF && (
          <FileSection
            title="Select Excel File"
            file={excelFile}
            handleFileUpload={(files) => setExcelFile(files[0])}
            handleSubmit={() => handleSubmit(excelFile, "upload-xlFile")}
            downloadURL={downloadURL}
          />
        )}
      </div>
    </div>
  );
}

function FileSection({
  title,
  file,
  handleFileUpload,
  handleSubmit,
  downloadURL,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        flexDirection: "column",
        marginBottom: 40,
      }}
    >
      <h3>{title}</h3>
      <Dropzone
        style={{
          margin: "20px 0px",
          padding: 20,
          border: "1px dashed darkslategray",
        }}
        onFilesAdded={handleFileUpload}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          color: "rgba(255, 255, 255, 0.6)",
          fontSize: 18,
          fontWeight: "bold",
          width: "100%",
          marginBottom: 10,
        }}
      >
        {file
          ? `File Name: ${file.name}`
          : `No ${title.split(" ")[1]} file selected!`}
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
        }}
      >
        <Button onClick={handleSubmit}>Submit</Button>
        {console.log("downloadURL", downloadURL)}
        {downloadURL && <a href={downloadURL}>Download Updated Excel</a>}
      </div>
    </div>
  );
}

export default App;
