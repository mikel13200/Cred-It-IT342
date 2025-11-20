import React from "react";
import { Button } from "../../components/ui/button";
import { X } from "lucide-react";
import ReactCrop from "react-image-crop";

export default function ImageEditorDialog({
  isEditing,
  previewUrl,
  crop,
  onCropChange,
  onCropComplete,
  onImageLoad,
  imgRef,
  previewRef,
  imageTransformStyle,
  percentCrop,
  previewScale,
  verticalPerspective,
  horizontalPerspective,
  rotate,
  setVerticalPerspective,
  setHorizontalPerspective,
  setRotate,
  setPreviewScale,
  handleDoneEditing,
  handleDialogClose,
  handleViewImage,
  handleDownloadImage,
  handleDialogContinue,
  setIsEditing
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[95vw] h-[90vh] mx-4 overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Image Preview & Edit
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDialogClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {!isEditing && previewUrl && (
            <div className="mb-6 text-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-md h-auto mx-auto rounded-lg border border-gray-200"
              />
            </div>
          )}

          {isEditing && previewUrl && (
            <div className="flex flex-col md:flex-row gap-8 items-center h-[70vh]">
              {/* Edit View */}
              <div className="w-full md:w-1/2">
                <h4 className="text-lg font-medium text-center mb-2">Edit</h4>
                <div style={{ perspective: "1000px", height: "400px", position: "relative", overflow: "hidden" }}>
                  <ReactCrop
                    crop={crop}
                    onChange={onCropChange}
                    onComplete={onCropComplete}
                  >
                    <img
                      ref={imgRef}
                      alt="Edit"
                      src={previewUrl}
                      style={{
                        transform: `scale(${previewScale}) ${imageTransformStyle.transform}`,
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                        display: "block",     // make image a block element to help with centering
                        margin: "0 auto",     // horizontally center image,
                      }}
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                </div>
              </div>

              {/* Live Preview */}
              <div className="w-full md:w-1/2 text-center">
                <h4 className="text-lg font-medium text-center mb-2">Live Preview</h4>
                <div
                  ref={previewRef}
                  className="relative w-full h-[400px] mx-auto rounded-md overflow-hidden"
                  style={{
                    perspective: "1000px",
                    border: "1px solid #ccc",
                    background: "#f8f8f8",
                  }}
                >
                  <div
                    style={{
                      ...imageTransformStyle,
                      transform: `scale(${previewScale}) ${imageTransformStyle.transform}`,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      alt="Live Preview"
                      src={previewUrl}
                      style={{
                        objectFit: "contain",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        clipPath: percentCrop
                          ? `inset(${percentCrop.y}% ${100 - (percentCrop.x + percentCrop.width)}% ${100 - (percentCrop.y + percentCrop.height)}% ${percentCrop.x}%)`
                          : "none",
                        transform: `scale(${previewScale})`,
                        transformOrigin: "center",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          {isEditing && (
            <div className="flex flex-wrap justify-center gap-4 my-6">
              {[
                {
                  label: "Vertical Perspective",
                  value: verticalPerspective,
                  min: -45,
                  max: 45,
                  onChange: setVerticalPerspective,
                },
                {
                  label: "Horizontal Perspective",
                  value: horizontalPerspective,
                  min: -45,
                  max: 45,
                  onChange: setHorizontalPerspective,
                },
                {
                  label: "Rotation",
                  value: rotate,
                  min: -180,
                  max: 180,
                  onChange: setRotate,
                },
                {
                  label: "Preview Zoom",
                  value: previewScale,
                  min: 0.1,
                  max: 2,
                  step: 0.1,
                  onChange: setPreviewScale,
                },
              ].map((ctrl, index) => (
                <div key={index} className="w-full px-4 text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {ctrl.label}: <span className="font-bold">{Math.round(ctrl.value * 100) / 100}</span>
                  </label>
                  <input
                    type="range"
                    min={ctrl.min}
                    max={ctrl.max}
                    step={ctrl.step || 1}
                    value={ctrl.value}
                    onChange={(e) => ctrl.onChange(Number(e.target.value))}
                    className="w-[75%] mx-auto block accent-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-4">
            {!isEditing ? (
              <>
                <Button variant="outline" className="px-6 py-2" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button variant="outline" className="px-6 py-2" onClick={handleViewImage}>
                  View Image
                </Button>
                <Button variant="outline" className="px-6 py-2" onClick={handleDownloadImage}>
                  Download
                </Button>
                <Button className="px-6 py-2 bg-blue-600 text-white" onClick={handleDialogContinue}>
                  Continue
                </Button>
              </>
            ) : (
              <Button className="px-6 py-2 bg-blue-600 text-white" onClick={handleDoneEditing}>
                Done Editing
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
