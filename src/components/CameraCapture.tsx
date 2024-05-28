import React, {
  MutableRefObject,
  forwardRef,
  useCallback,
  useRef,
} from "react";
import Webcam from "react-webcam";
import FlexContainer from "./FlexContainer";
import ImageEditor from "./ImageEditor";
import NextButton from "./NextButton";

const videoConstraints = {
  width: 300,
  height: 300,
  facingMode: "user",
};

interface CameraCaptureProps {
  capturedImage: string | null;
  setCapturedImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const CameraCapture = forwardRef<Webcam, CameraCaptureProps>(
  ({ capturedImage, setCapturedImage }, ref) => {
    const webcamRef = useRef<Webcam | null>(null);

    const capture = useCallback(() => {
      if (!webcamRef.current) return;
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        return alert("No image captured");
      }
      setCapturedImage(imageSrc);
    }, [webcamRef, setCapturedImage]);

    return (
      <FlexContainer variant="column-start">
        <FlexContainer variant="row-start">
          <Webcam
            audio={false}
            ref={(webcam) => {
              webcamRef.current = webcam;
              if (ref) {
                if (typeof ref === "function") {
                  ref(webcam);
                } else {
                  (ref as MutableRefObject<Webcam | null>).current = webcam;
                }
              }
            }}
            screenshotFormat="image/jpeg"
            height={300}
            width={300}
            className="rounded-xl"
            mirrored={false}
            videoConstraints={videoConstraints}
            controls
            onPause={() => console.log("paused")}
          />
          <ImageEditor
            capturedImage={capturedImage}
            setCapturedImage={setCapturedImage}
          />
          {/* {capturedImage && (
            <img
              className="rounded-xl"
              src={capturedImage}
              alt="Captured Photo"
            />
          )} */}
          <NextButton
            colorScheme="flat"
            onClick={capture}
            className="border border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-800"
          >
            Take Photo
          </NextButton>
        </FlexContainer>
      </FlexContainer>
    );
  },
);

export default CameraCapture;
