/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-unused-vars */
import CameraCapture from "@/components/CameraCapture";
import FlexContainer from "@/components/FlexContainer";

import NextButton from "@/components/NextButton";
import Timeline from "@/components/Timeline";
import { cn, getSizeFactor, loadImage } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const importAll = import.meta.glob("../../public/frames/*.png");

// Now you can use the images object to render your images

const Capture = () => {
  const [images, setImages] = useState<{ [key: string]: string } | null>({});
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  // const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [mergedImage, setMergedImage] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  // const [isImageCaptured, setIsImageCaptured] = useState(false);
  // const [isImageUploaded, setIsImageUploaded] = useState(false);
  // const [isImageDownloading, setIsImageDownloading] = useState(false);
  // const [isCameraError, setIsCameraError] = useState(false);
  // const [isCameraPermissionDenied, setIsCameraPermissionDenied] =
  //   useState(false);
  const [activeStep, setActiveStep] = useState(0);

  async function findBoundingBox(
    imageUrl: string,
  ): Promise<{ x: number; y: number; width: number; height: number }> {
    const image = await loadImage(imageUrl);

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to get canvas context");
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  }

  async function mergeImages(
    backgroundUrl: string,
    overlayUrl: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<string> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to get canvas context");

    try {
      const background = await loadImage(backgroundUrl);
      canvas.width = background.width;
      canvas.height = background.height;
      canvas.style.backgroundColor = "transparent";
      ctx.drawImage(background, 0, 0);

      const overlay = await loadImage(overlayUrl);

      // Calculate the scale factor to fit the overlay image within the frame
      const scale = Math.min(width / overlay.width, height / overlay.height);

      // Calculate the new dimensions of the overlay image
      const overlayWidth = overlay.width * scale * 0.75;
      const overlayHeight = overlay.height * scale * 0.85;

      // Calculate the position to center the overlay image within the frame
      const overlayX = x + 2 + (width - overlayWidth) / 2;
      const overlayY = y + 7 + (height - overlayHeight) / 2;

      ctx.drawImage(overlay, overlayX, overlayY, overlayWidth, overlayHeight);

      const dataUrl = canvas.toDataURL("image/jpeg");
      const blob = await (await fetch(dataUrl)).blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      return canvas.toDataURL("image/jpeg"); // Change the output format to JPEG
    } catch (error) {
      throw error;
    }
  }

  // Merge the images when the capturedImage or selectedFrame state changes
  useEffect(() => {
    const mergeImage = async () => {
      if (!selectedFrame || !capturedImage) return;
      const { x, y, width, height } = await findBoundingBox(selectedFrame);
      const mergedImage = await mergeImages(
        selectedFrame,
        capturedImage,
        x,
        y,
        width,
        height,
      );
      setMergedImage(mergedImage);
    };
    mergeImage();
  }, [capturedImage, selectedFrame]);

  useEffect(() => {
    for (const path in importAll) {
      importAll[path]().then((mod) => {
        const key = path
          .replace("../../public/frames/", "")
          .replace(".png", "")
          .replace("-", "_");
        setImages((prev) => ({
          ...prev,
          [key]: (mod as unknown as { default: string })?.default,
        }));
      });
    }
  }, []);

  return (
    <FlexContainer
      variant="column-start"
      className="overflow-hidden"
      gap="none"
    >
      <FlexContainer
        variant="row-center"
        className="mx-auto max-w-screen-xl px-5 pb-6 pt-16"
      >
        <Timeline
          steps={[
            {
              description: "Select your frame first",
              activeStep: activeStep,
              index: 0,
            },
            {
              description: "Adjust your photo",
              activeStep: activeStep,
              index: 1,
            },
            {
              description: "Review the photo and download it",
              activeStep: activeStep,
              index: 2,
            },
          ]}
        />
      </FlexContainer>
      <AnimatePresence>
        <FlexContainer
          variant="column-start"
          className="mx-auto max-w-screen-xl px-10 pb-24 pt-10"
        >
          {activeStep === 0 && (
            <motion.div
              transition={{
                type: "spring",
                duration: 0.7,
                bounce: 0.2,
                delay: 0.2,
              }}
              initial={{
                opacity: 0,
                x: 100,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <FlexContainer variant="column-start" gap="2xl">
                <FlexContainer variant="row-between">
                  <FlexContainer variant="column-start" gap="sm">
                    <p className="text-sm font-medium text-zinc-400">STEP 1</p>
                    <h1 className="text-4xl font-semibold">
                      Select your frame
                    </h1>
                  </FlexContainer>
                  <FlexContainer variant="row-end" className="gap-3">
                    <NextButton
                      colorScheme="primary"
                      onClick={() => setActiveStep(1)}
                    >
                      Next
                    </NextButton>
                  </FlexContainer>
                </FlexContainer>
                {images && (
                  <div className="flex flex-wrap gap-3">
                    {Object.keys(images).map((key) => {
                      const src = images[key].replace("/public", ".");
                      const sizeFactor = getSizeFactor(350, 450, 200, 200);
                      return (
                        <img
                          key={key}
                          onClick={() => setSelectedFrame(src)}
                          src={src}
                          alt={key}
                          style={{
                            width: (350 / sizeFactor) * 2,
                            height: (450 / sizeFactor) * 2,
                          }}
                          className={cn(
                            "rounded-xl",
                            selectedFrame === src
                              ? "border-3 border-amber-500"
                              : "border-3 border-transparent",
                          )}
                        />
                      );
                    })}
                  </div>
                )}
              </FlexContainer>
            </motion.div>
          )}
          {activeStep === 1 && (
            <motion.div
              transition={{
                type: "spring",
                duration: 0.7,
                bounce: 0.2,
                delay: 0.2,
              }}
              initial={{
                opacity: 0,
                x: 100,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <FlexContainer variant="column-start" gap="2xl">
                <FlexContainer variant="row-between">
                  <FlexContainer variant="column-start" gap="sm">
                    <p className="text-sm font-medium text-zinc-400">STEP 2</p>
                    <h1 className="text-4xl font-semibold">
                      Adjust your photo
                    </h1>
                  </FlexContainer>
                  <FlexContainer variant="row-end" className="gap-3">
                    <NextButton
                      colorScheme="secondary"
                      onClick={() => setActiveStep(0)}
                    >
                      Back
                    </NextButton>
                    <NextButton
                      colorScheme="primary"
                      onClick={() => setActiveStep(2)}
                    >
                      Next
                    </NextButton>
                  </FlexContainer>
                </FlexContainer>
                <CameraCapture
                  ref={webcamRef}
                  capturedImage={capturedImage}
                  setCapturedImage={setCapturedImage}
                />
              </FlexContainer>
            </motion.div>
          )}
          {activeStep === 2 && (
            <motion.div
              transition={{
                type: "spring",
                duration: 0.7,
                bounce: 0.2,
                delay: 0.2,
              }}
              initial={{
                opacity: 0,
                x: 100,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <FlexContainer variant="column-start" gap="2xl">
                <FlexContainer variant="row-between">
                  <FlexContainer variant="column-start" gap="sm">
                    <p className="text-sm font-medium text-zinc-400">STEP 3</p>
                    <h1 className="text-4xl font-semibold">
                      Review the photo and download it
                    </h1>
                  </FlexContainer>
                  <FlexContainer
                    variant="row-end"
                    className="items-center gap-3"
                  >
                    {downloadUrl && (
                      <a
                        href={downloadUrl}
                        download={selectedFrame}
                        className="text-nowrap rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-xs font-medium text-white shadow-small duration-100 hover:bg-zinc-700 active:scale-95 active:bg-zinc-800"
                      >
                        Download image
                      </a>
                    )}
                    <span className="text-nowrap text-sm">|</span>
                    <NextButton
                      colorScheme="secondary"
                      onClick={() => setActiveStep(1)}
                    >
                      Back
                    </NextButton>
                    <NextButton
                      colorScheme="primary"
                      onClick={() => setActiveStep(3)}
                    >
                      Next
                    </NextButton>
                  </FlexContainer>
                </FlexContainer>
                <FlexContainer>
                  {mergedImage && (
                    <img
                      src={mergedImage}
                      alt="Merged Image"
                      className="h-auto w-[400px] rounded-xl border-2 object-contain"
                    />
                  )}
                </FlexContainer>
              </FlexContainer>
            </motion.div>
          )}
        </FlexContainer>
      </AnimatePresence>
    </FlexContainer>
  );
};

export default Capture;
