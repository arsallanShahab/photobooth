import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import FlexContainer from "./FlexContainer";

interface ImageEditorProps {
  capturedImage: string | null;
  setCapturedImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const ImageEditor = ({ capturedImage, setCapturedImage }: ImageEditorProps) => {
  const [originalImage, setOriginalImage] = useState<string | null>(
    capturedImage,
  );
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>();
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [hasGradient, setHasGradient] = useState(false);

  const onCropComplete = (crop: Crop | null | undefined) => {
    setCompletedCrop(crop);
  };

  const handleRotate = (degree: number) => {
    if (!capturedImage) return;

    const image = new Image();
    image.src = capturedImage as string;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // If the rotation degree is 90 or 270 (or a multiple of these), swap the width and height.
      if (degree % 180 === 90) {
        canvas.width = image.naturalHeight;
        canvas.height = image.naturalWidth;
      } else {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
      }

      // Calculate the new coordinates for the image after rotation
      const x =
        degree % 180 === 90 ? (canvas.width - image.naturalHeight) / 2 : 0;
      const y =
        degree % 180 === 90 ? (canvas.height - image.naturalWidth) / 2 : 0;

      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      // ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degree * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      ctx.drawImage(image, x, y, image.naturalWidth, image.naturalHeight);
      // ctx.restore();

      const base64Image = canvas.toDataURL("image/jpeg");
      setCapturedImage(base64Image);
    };
  };
  console.log(isGrayscale, "abc");

  const handleGrayscale = () => {
    if (!capturedImage) return;
    setIsGrayscale(!isGrayscale);

    const image = new Image();
    image.src = capturedImage as string;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      console.log(isGrayscale, "isGrayscale");
      if (isGrayscale) {
        setCapturedImage(originalImage);
        return;
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
      }
      ctx.putImageData(imageData, 0, 0);
      const base64Image = canvas.toDataURL("image/jpeg");
      setCapturedImage(base64Image);
    };
  };

  const handleGradient = () => {
    if (!capturedImage) return;

    setHasGradient(!hasGradient);

    const image = new Image();
    image.src = capturedImage as string;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (hasGradient) {
        setCapturedImage(originalImage);
        return;
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      gradient.addColorStop(0, "rgba(236,72,153,0.7)");
      gradient.addColorStop(1, "rgba(255,255,255,0.1)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "screen";
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL("image/jpeg");
      setCapturedImage(base64Image);
    };
  };

  const handleSaveImage = () => {
    if (!completedCrop || !capturedImage) return;
    const canvas = document.createElement("canvas");
    const image = new Image();
    image.src = capturedImage;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );
    const base64Image = canvas.toDataURL("image/jpeg");
    setCapturedImage(base64Image);
    setOriginalImage(base64Image);
    setCrop(undefined);
  };

  useEffect(() => {
    if (!isGrayscale && capturedImage) {
      setOriginalImage(capturedImage);
    }
    // if (!hasGradient && isGrayscale && capturedImage) {
    //   setOriginalImage(capturedImage);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage]);

  console.log(originalImage, "originalImage");
  return (
    <FlexContainer variant="column-start">
      <ReactCrop
        renderSelectionAddon={() => (
          <div className="flex cursor-pointer items-end justify-end gap-3">
            <button
              onClick={() => handleSaveImage()}
              className="rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white shadow-md hover:bg-black/70 active:bg-black"
            >
              <Save size={14} />
            </button>
          </div>
        )}
        crop={crop}
        onChange={(c) => setCrop(c)}
        onComplete={onCropComplete}
      >
        <img src={capturedImage ?? ""} className="rounded-xl" />
      </ReactCrop>
      {capturedImage && (
        <FlexContainer wrap="wrap">
          <button
            className="text-nowrap rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white shadow-md hover:bg-black/70 active:bg-black"
            onClick={() => handleRotate(90)}
          >
            Rotate +90
          </button>
          <button
            className="text-nowrap rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white shadow-md hover:bg-black/70 active:bg-black"
            onClick={() => handleRotate(-90)}
          >
            Rotate -90
          </button>
          <button
            className="text-nowrap rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white shadow-md hover:bg-black/70 active:bg-black"
            onClick={handleGrayscale}
          >
            Toggle Grayscale
          </button>
          <button
            className="text-nowrap rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white shadow-md hover:bg-black/70 active:bg-black"
            onClick={handleGradient}
          >
            Toggle Gradient
          </button>
        </FlexContainer>
      )}
    </FlexContainer>
  );
};

export default ImageEditor;
