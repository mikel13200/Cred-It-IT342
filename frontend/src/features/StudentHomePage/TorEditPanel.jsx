import React, { useState } from "react";
import "./TorEditPanel.css";

const TorEditPanel = ({ image, onSave, onCancel }) => {
  const [vertical, setVertical] = useState(0);
  const [horizontal, setHorizontal] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  const handleDoneEditing = () => {
    const imgElement = new Image();
    imgElement.crossOrigin = "anonymous"; // important if image is from external source
    imgElement.src = image.src;

    imgElement.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // set canvas size based on zoom
      const width = imgElement.width * zoom;
      const height = imgElement.height * zoom;
      canvas.width = width;
      canvas.height = height;

      ctx.save();
      // move origin to center for rotation
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // NOTE: vertical/horizontal perspective isn't directly supported in canvas,
      // but we can simulate by skewing transform matrix if needed.
      const skewX = (horizontal * Math.PI) / 180;
      const skewY = (vertical * Math.PI) / 180;
      ctx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);

      ctx.drawImage(
        imgElement,
        -imgElement.width / 2,
        -imgElement.height / 2,
        imgElement.width,
        imgElement.height
      );
      ctx.restore();

      const newSrc = canvas.toDataURL("image/png");

      const editedImage = {
        ...image,
        src: newSrc, // ✅ replace original src with canvas result
      };

      onSave(editedImage);
    };
  };

  return (
    <div className="tor-edit-modal-overlay">
      <div className="tor-edit-modal">
        <h3>Editing Image</h3>
        <div className="tor-edit-content">
          <div className="tor-image-container">
            <p>Original</p>
            <img src={image.src} alt="original" className="tor-edit-img" />
          </div>
          <div className="tor-image-container">
            <p>Live Preview</p>
            <img
              src={image.src}
              alt="preview"
              className="tor-edit-img"
              style={{
                transform: `
                  perspective(1000px)
                  rotateX(${vertical}deg)
                  rotateY(${horizontal}deg)
                  rotate(${rotation}deg)
                  scale(${zoom})
                `,
              }}
            />
          </div>
        </div>

        <div className="tor-slider-controls">
          <label>
            Vertical Perspective: {vertical}
            <input
              type="range"
              min={-45}
              max={45}
              value={vertical}
              onChange={(e) => setVertical(parseInt(e.target.value))}
            />
          </label>
          <label>
            Horizontal Perspective: {horizontal}
            <input
              type="range"
              min={-45}
              max={45}
              value={horizontal}
              onChange={(e) => setHorizontal(parseInt(e.target.value))}
            />
          </label>
          <label>
            Rotation: {rotation}
            <input
              type="range"
              min={-180}
              max={180}
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
            />
          </label>
          <label>
            Preview Zoom: {zoom}
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="tor-edit-buttons">
          <button onClick={onCancel}>Cancel</button>
          <button className="primary" onClick={handleDoneEditing}>
            Done Editing
          </button>
        </div>
      </div>
    </div>
  );
};

export default TorEditPanel;

