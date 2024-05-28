import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import FlexContainer from "./FlexContainer";

type StepProps = {
  description: string;
  activeStep: number;
  index: number;
  isLast?: boolean;
};

const Step: React.FC<StepProps> = ({
  description,
  index,
  isLast,
  activeStep,
}) => (
  <AnimatePresence mode="wait">
    <FlexContainer
      variant="column-center"
      gap="sm"
      className="relative w-full min-w-max items-center"
    >
      <div
        className={cn(
          "relative z-30 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
          "bg-gray-200 text-gray-900",
        )}
      >
        <span>•</span>
      </div>
      {(activeStep === index || activeStep >= index) && (
        <motion.div
          transition={{
            type: "spring",
            duration: 0.7,
            bounce: 0.3,
            delay: 0.3,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className={cn(
            "absolute top-0 z-40 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-2xl text-white",
          )}
        >
          <span>•</span>
        </motion.div>
      )}
      <FlexContainer variant="column-start" gap="none" className="px-2">
        <p className="min-w-[200px] max-w-[200px] text-center text-sm font-medium leading-relaxed">
          {description}
        </p>
      </FlexContainer>
      {!isLast && (
        <>
          <div
            className={cn(
              "absolute left-1/2 top-0 z-10 mt-[10px] h-[2.5px] w-full",
              "bg-gray-200",
            )}
          ></div>
          {(activeStep === index + 1 || activeStep > index) && (
            <motion.div
              transition={{
                type: "spring",
                duration: 0.7,
                bounce: 0.2,
                // delay: 0.2,
              }}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              exit={{ width: 0 }}
              className={cn(
                "absolute left-1/2 top-0 z-20 mt-[10px] h-[2.5px] w-full origin-left bg-green-500",
              )}
            ></motion.div>
          )}
        </>
      )}
    </FlexContainer>
  </AnimatePresence>
);

type TimelineProps = {
  steps: StepProps[];
};

const Timeline: React.FC<TimelineProps> = ({ steps }) => (
  <section className="flex w-full flex-row overflow-x-auto scrollbar-hide">
    {steps.map((step, index) => (
      <div key={index} className="relative w-full">
        <Step {...step} isLast={index === steps.length - 1} />
      </div>
    ))}
  </section>
);

export default Timeline;
