import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const SatelliteComparison = ({
  beforeImage,
  afterImage,
  siteName,
  yearBefore,
  yearAfter,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  // Default images if props aren't provided
  const defaultBefore = "https://i.ibb.co/KXGVm5z/site-before.jpg";
  const defaultAfter = "https://i.ibb.co/YDFY729/site-after.jpg";

  // Use provided images or fallback to defaults
  const before = beforeImage || defaultBefore;
  const after = afterImage || defaultAfter;
  const site = siteName || "Rio Doce Reforestation";
  const yearB = yearBefore || "2019";
  const yearA = yearAfter || "2023";

  const handleMouseDown = () => {
    setDragging(true);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseMove = (e) => {
    if (dragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }
  };

  const handleTouchMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [dragging]);

  useEffect(() => {
    // Add animation effect on component mount
    const interval = setInterval(() => {
      setSliderPosition((prev) => {
        // Move slider back and forth for demonstration
        if (prev >= 75) return 25;
        if (prev <= 25) return 75;
        return prev;
      });
    }, 3000);

    // Clear animation after 9 seconds
    setTimeout(() => {
      clearInterval(interval);
      setSliderPosition(50);
    }, 9000);

    return () => clearInterval(interval);
  }, []);
  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-xl shadow-2xl border-4 border-white"
      style={{ height: "500px" }}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Before Image */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${before})` }}
      >
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg backdrop-blur-sm">
          Before ({yearB})
        </div>
      </div>

      {/* After Image (clipped by slider) */}
      <div
        className="absolute top-0 left-0 h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${after})`,
          width: `${sliderPosition}%`,
          clipPath: `inset(0 0 0 0)`,
        }}
      >
        <div className="absolute bottom-4 left-4 bg-green-500/70 text-white px-3 py-1 rounded-lg backdrop-blur-sm">
          After ({yearA})
        </div>
      </div>

      {/* Site name overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <div className="bg-black/70 text-white py-2 px-4 rounded-lg backdrop-blur-sm">
          {site}
        </div>
        <div className="bg-green-600/70 text-white py-2 px-4 rounded-lg backdrop-blur-sm">
          NDVI +0.37
        </div>
      </div>

      {/* Slider control */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-xl cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider handle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
          <div className="flex flex-col">
            <span className="transform -rotate-90 text-black font-bold text-xs">
              DRAG
            </span>
          </div>
        </div>
      </div>

      {/* Instructions overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="bg-black/30 backdrop-blur-sm text-white px-6 py-3 rounded-lg">
          <p className="text-sm">Drag slider to compare before & after</p>
        </div>{" "}
      </div>
    </motion.div>
  );
};

export default SatelliteComparison;
