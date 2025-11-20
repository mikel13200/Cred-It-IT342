"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, RefreshCw } from "lucide-react";

/**
 * Props:
 *  - images: [{ id, src, name, file? }]  // src = dataURL preview; file optional if uploader stores File
 *  - onClose: () => void
 */
export default function DemoResultCard({ images = [], onClose }) {
  const [imagesWithResults, setImagesWithResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0); // bump to retry

  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();

    const dataURLtoFile = (dataurl, filename) => {
      const arr = dataurl.split(",");
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "image/png";
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      return new File([u8arr], filename, { type: mime });
    };

    const fetchOCR = async () => {
      if (!images || images.length === 0) {
        setImagesWithResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      // Initialize UI entries so user sees something while waiting
      setImagesWithResults(images.map((img) => ({ ...img, result: null })));

      try {
        const formData = new FormData();

        for (const img of images) {
          if (img.file instanceof File) {
            // If uploader already stored File, send it directly
            formData.append("images", img.file, img.file.name);
          } else if (typeof img.src === "string" && img.src.startsWith("data:")) {
            // Convert dataURL to File
            const file = dataURLtoFile(img.src, img.name || `image-${Date.now()}.jpg`);
            formData.append("images", file, file.name);
          } else {
            // can't convert, skip
            console.warn("Skipping image (no file or dataURL):", img);
          }
        }

        const res = await fetch("http://127.0.0.1:8000/demo-ocr/", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${res.statusText} ${txt}`);
        }

        const data = await res.json();

        // Map backend results to images by filename; fallback to ordering
        const mapped = images.map((img, index) => {
          const matchByName =
            data.results?.find((r) => r.file_name === (img.name || img.file?.name));
          const fallback = data.results?.[index];
          const result = matchByName || fallback || { file_name: img.name || "", student_name: null, school_name: null, entries: [] };
          return { ...img, result };
        });

        if (!aborted) setImagesWithResults(mapped);
      } catch (err) {
        if (!aborted) {
          console.error("OCR fetch failed:", err);
          setError(err.message || "Failed to fetch OCR results");
          setImagesWithResults(images.map((img) => ({ ...img, result: null })));
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    fetchOCR();

    return () => {
      aborted = true;
      controller.abort();
    };
    // re-run when images change or when retry is pressed
  }, [images, attempt]);

  const handleRetry = () => {
    setAttempt((a) => a + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white text-black w-full max-w-5xl max-h-[90vh] rounded-xl shadow-lg overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">CRED-IT Results</h2>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm font-medium text-center p-3 rounded-lg mb-4">
            The image you uploaded will be processed using OCR (Optical Character
            Recognition) to extract its contents. Please note: no information will be
            stored, saved, or used in any way. This is only a demonstration to show how
            the OCR process works.
        </div>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-700">
            <Loader2 className="animate-spin" /> Processing images...
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            <p className="mb-2"><strong>OCR Error:</strong> {error}</p>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white border text-sm"
                onClick={handleRetry}
              >
                <RefreshCw className="h-4 w-4" /> Retry
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center px-3 py-1.5 rounded bg-gray-100 border text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          {imagesWithResults.length === 0 && !loading && !error && (
            <p className="text-center text-gray-600">No images to process.</p>
          )}

          {imagesWithResults.map((img, idx) => (
            <div key={img.id || idx} className="mb-3 border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={img.src}
                  alt={img.name}
                  className="w-20 h-20 object-cover rounded border"
                />
                <div>
                  <div className="font-semibold">{img.name || img.file?.name || `Image ${idx + 1}`}</div>
                  <div className="text-sm text-gray-500">
                    Extracted {Array.isArray(img.result?.entries) ? img.result.entries.length : 0} entries
                  </div>
                </div>
              </div>

              {/* Student / School */}
              {img.result?.student_name || img.result?.school_name ? (
                <div className="mb-3 text-sm text-gray-700">
                  <div><strong>Student:</strong> {img.result.student_name || "N/A"}</div>
                  <div><strong>School:</strong> {img.result.school_name || "N/A"}</div>
                </div>
              ) : null}

              {/* Entries list */}
              {img.result?.entries && img.result.entries.length > 0 ? (
                <div className="space-y-3">
                  {img.result.entries.map((entry, i) => (
                    <div key={i} className="p-3 border rounded bg-white shadow-sm text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div><strong>Subject Code:</strong> <span className="ml-1">{entry.subject_code || "—"}</span></div>
                        <div><strong>Total Units:</strong> <span className="ml-1">{entry.total_academic_units ?? 0}</span></div>

                        <div className="col-span-2"><strong>Description:</strong> <span className="ml-1">{entry.subject_description || "—"}</span></div>

                        <div><strong>Year:</strong> <span className="ml-1">{entry.student_year || "—"}</span></div>
                        <div><strong>Semester:</strong> <span className="ml-1">{entry.semester || "—"}</span></div>

                        <div><strong>School Year Offered:</strong> <span className="ml-1">{entry.school_year_offered || "—"}</span></div>
                        <div><strong>Final Grade:</strong> <span className="ml-1">{entry.final_grade ?? "—"}</span></div>

                        <div><strong>Remarks:</strong> <span className="ml-1">{entry.remarks || "—"}</span></div>
                        <div><strong>Pre-requisite:</strong> <span className="ml-1">{entry.pre_requisite || "—"}</span></div>

                        <div className="col-span-2"><strong>Co-requisite:</strong> <span className="ml-1">{entry.co_requisite || "—"}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic text-sm">No subject entries extracted.</div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}