import { useEffect, useState } from "react";

const AdobeViewer = ({ urlToPDF }) => {
  const [isAdobeDCReady, setIsAdobeDCReady] = useState(false);
  useEffect(() => {
    // Dynamically load the Adobe Document Cloud View SDK
    const script = document.createElement("script");
    script.src = "https://documentcloud.adobe.com/view-sdk/viewer.js";
    script.async = true;
    script.onload = () => setIsAdobeDCReady(true); // Set flag to true when SDK is ready
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isAdobeDCReady) {
      return;
    }
    console.log("Adobe DC View SDK is ready");

    const fetchPDF = async (url) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return blob.arrayBuffer();
      } catch (error) {
        console.error("Failed to fetch PDF:", error);
        throw error;
      }
    };

    const goToPage = (previewFilePromise, pageNum) => {
      previewFilePromise.then((adobeViewer) => {
        adobeViewer.getAPIs().then((apis) => {
          apis.gotoLocation(parseInt(pageNum));
        });
      });
    };

    const processEvent = (event, previewFilePromise) => {
      if (event.type === "PDF_VIEWER_OPEN") {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const pageNum = urlParams.get("page");
        if (pageNum) {
          goToPage(previewFilePromise, pageNum);
        }
      }
    };
    function onSDKReady() {
      console.log("Adobe DC View SDK is ready");
      const AdobeDC = window.AdobeDC;
      const adobeDCView = new AdobeDC.View({
        // eslint-disable-next-line no-undef
        clientId: import.meta.env.VITE_REACT_ADOBE_DC_CLIENT_ID,
        divId: "adobe-dc-view",
      });
      const previewFilePromise = adobeDCView.previewFile(
        {
          content: { promise: fetchPDF(urlToPDF) },
          metaData: { fileName: urlToPDF.split("/").slice(-1)[0] },
        },
        {
          embedMode: "FULL_WINDOW",
          defaultViewMode: "FIT_PAGE",
          showDownloadPDF: false,
          showPrintPDF: false,
          showLeftHandPanel: true,
          showAnnotationTools: false,
        }
      );

      const eventOptions = {
        listenOn: [AdobeDC.View.Enum.Events.PDF_VIEWER_OPEN],
        enableFilePreviewEvents: true,
      };

      adobeDCView.registerCallback(
        AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
        (event) => processEvent(event, previewFilePromise),
        eventOptions
      );
    }
    if (window.AdobeDC) {
      onSDKReady();
    } else {
      document.addEventListener("adobe_dc_view_sdk.ready", onSDKReady);
    }

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("adobe_dc_view_sdk.ready", onSDKReady);
    };
  }, [urlToPDF, isAdobeDCReady]);

  return (
    <div id="adobe-dc-view" style={{ width: "100%", height: "100vh" }}></div>
  );
};

export default AdobeViewer;
