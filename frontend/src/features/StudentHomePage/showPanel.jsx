import React, { useState } from "react";
import TorEditPanel from "./TorEditPanel";

const ShowPanel = ({ images, onClose, onUpdateImages, onProcess, userName }) => {
  const [editingImage, setEditingImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = (img) => {
    const link = document.createElement("a");
    link.href = img.src;
    link.download = img.name || "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveEdit = (updatedImg) => {
    const newImages = images.map((img) =>
      img.id === updatedImg.id ? updatedImg : img
    );
    onUpdateImages(newImages);
    setEditingImage(null);
  };

  const getTransformStyle = (img) => {
    if (!img.transform) return {};
    const { vertical, horizontal, rotation, zoom } = img.transform;
    return {
      transform: `
        perspective(1000px)
        rotateX(${vertical}deg)
        rotateY(${horizontal}deg)
        rotate(${rotation}deg)
        scale(${zoom})
      `,
    };
  };

  const handleViewImage = (img) => {
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head><title>View Image</title></head>
        <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background:#000;">
          <img src="${img.src}" 
            style="max-width:100%; max-height:100%; ${
              img.transform ? `transform:${getTransformStyle(img).transform};` : ""
            }" 
          />
        </body>
      </html>
    `);
  };

  // 🔹 Handle OCR Processing
const handleProcess = async () => {
  setLoading(true);

  try {
    const formData = new FormData();

    // append all images under "images"
    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i].file);  // ✅ matches Django
    }

    // include other fields if your backend needs them
    formData.append("account_id", userName);

    const res = await fetch("http://127.0.0.1:8000/api/ocr/", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("OCR request failed");

    const data = await res.json();

    // backend returns all OCR results in one response
    onProcess(data);
  } catch (err) {
    console.error("Error processing OCR:", err);
    alert("Failed to process OCR. Please try again.");
  } finally {
    setLoading(false);
  }
};




  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-lg w-[90%] max-w-5xl">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Image Preview and Edit
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              <span className="ml-4 text-lg">Processing OCR...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {images.map((img, index) => (
                  <div key={index} className="flex flex-col items-center space-y-3">
                    <img
                      src={img.src}
                      alt={`img-${index}`}
                      className="rounded shadow object-cover w-full h-48"
                      style={getTransformStyle(img)}
                    />
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setEditingImage(img)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewImage(img)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Image
                      </button>
                      <button
                        onClick={() => handleDownload(img)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={onClose}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                  Close
                </button>
                <button
                  onClick={handleProcess}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Process
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {editingImage && (
        <TorEditPanel
          image={editingImage}
          onSave={handleSaveEdit}
          onCancel={() => setEditingImage(null)}
        />
      )}
    </>
  );
};

export default ShowPanel;