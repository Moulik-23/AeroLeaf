import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const BlockchainVisualization = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Define blocks
    const blocks = [];
    const blockCount = 7;
    const blockWidth = canvas.offsetWidth / blockCount - 20;
    const blockHeight = blockWidth * 0.6;

    for (let i = 0; i < blockCount; i++) {
      blocks.push({
        x: 20 + i * (blockWidth + 20),
        y: canvas.offsetHeight / 2 - blockHeight / 2,
        width: blockWidth,
        height: blockHeight,
        hue: 140 + i * 5,
        transactions: Math.floor(Math.random() * 8) + 2,
        timestamp: Date.now() - (blockCount - i) * 300000,
        hash: generateRandomHash(),
        prevHash: i > 0 ? blocks[i - 1]?.hash : "0000000000000000",
        pulsePhase: Math.random() * Math.PI * 2,
        selected: false,
      });
    }

    // Animation loop
    let animationFrameId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw connections
      ctx.lineWidth = 2;
      for (let i = 1; i < blocks.length; i++) {
        const prevBlock = blocks[i - 1];
        const currentBlock = blocks[i];

        // Draw connection line
        ctx.beginPath();
        ctx.moveTo(
          prevBlock.x + prevBlock.width,
          prevBlock.y + prevBlock.height / 2
        );
        ctx.lineTo(currentBlock.x, currentBlock.y + currentBlock.height / 2);

        // Animated particles along connection
        const particleCount = 3;
        const now = Date.now() / 1000;

        for (let j = 0; j < particleCount; j++) {
          const phase = (now * 0.5 + j / particleCount) % 1;
          const particleX =
            prevBlock.x +
            prevBlock.width +
            (currentBlock.x - prevBlock.x - prevBlock.width) * phase;
          const particleY = prevBlock.y + prevBlock.height / 2;

          ctx.strokeStyle = `hsla(${currentBlock.hue}, 80%, 60%, ${
            1 - Math.abs(phase - 0.5) * 2
          })`;
          ctx.fillStyle = `hsla(${currentBlock.hue}, 80%, 60%, ${
            1 - Math.abs(phase - 0.5) * 2
          })`;
          ctx.fillRect(particleX - 3, particleY - 3, 6, 6);
        }

        ctx.strokeStyle = `hsla(${currentBlock.hue}, 70%, 50%, 0.4)`;
        ctx.stroke();
      }

      // Draw blocks
      blocks.forEach((block, index) => {
        // Pulsating effect
        const pulseTime = Date.now() / 1000;
        const pulseFactor =
          Math.sin(pulseTime * 2 + block.pulsePhase) * 0.05 + 1;

        // Block shadow
        ctx.fillStyle = `hsla(${block.hue}, 70%, 40%, 0.2)`;
        ctx.fillRect(
          block.x + 5,
          block.y + 8,
          block.width * pulseFactor,
          block.height * pulseFactor
        );

        // Main block
        const gradient = ctx.createLinearGradient(
          block.x,
          block.y,
          block.x,
          block.y + block.height
        );
        gradient.addColorStop(0, `hsla(${block.hue}, 70%, 50%, 1)`);
        gradient.addColorStop(1, `hsla(${block.hue}, 60%, 40%, 1)`);

        ctx.fillStyle = gradient;
        ctx.strokeStyle = `hsla(${block.hue}, 80%, 65%, 1)`;
        ctx.lineWidth = 1.5;

        // Rounded rectangle for block
        const radius = 6;
        ctx.beginPath();
        ctx.moveTo(block.x + radius, block.y);
        ctx.lineTo(block.x + block.width * pulseFactor - radius, block.y);
        ctx.quadraticCurveTo(
          block.x + block.width * pulseFactor,
          block.y,
          block.x + block.width * pulseFactor,
          block.y + radius
        );
        ctx.lineTo(
          block.x + block.width * pulseFactor,
          block.y + block.height * pulseFactor - radius
        );
        ctx.quadraticCurveTo(
          block.x + block.width * pulseFactor,
          block.y + block.height * pulseFactor,
          block.x + block.width * pulseFactor - radius,
          block.y + block.height * pulseFactor
        );
        ctx.lineTo(block.x + radius, block.y + block.height * pulseFactor);
        ctx.quadraticCurveTo(
          block.x,
          block.y + block.height * pulseFactor,
          block.x,
          block.y + block.height * pulseFactor - radius
        );
        ctx.lineTo(block.x, block.y + radius);
        ctx.quadraticCurveTo(block.x, block.y, block.x + radius, block.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Block content
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          `Block ${index + 1}`,
          block.x + (block.width * pulseFactor) / 2,
          block.y + 15
        );

        // Show tx count
        ctx.fillText(
          `${block.transactions} Tx`,
          block.x + (block.width * pulseFactor) / 2,
          block.y + 30
        );

        // Timestamp
        const date = new Date(block.timestamp);
        const timeString = date.toLocaleTimeString();
        ctx.font = "8px Arial";
        ctx.fillText(
          timeString,
          block.x + (block.width * pulseFactor) / 2,
          block.y + block.height * pulseFactor - 10
        );

        // Hash visualization
        const hashVizWidth = block.width * pulseFactor - 20;
        const hashVizHeight = 5;
        const hashVizY = block.y + block.height * pulseFactor - 25;

        // Create a pattern based on the hash
        for (let i = 0; i < 8; i++) {
          const segmentWidth = hashVizWidth / 8;
          const hashChar = parseInt(block.hash.charAt(i * 2), 16);
          ctx.fillStyle = `hsla(${
            (block.hue + hashChar * 15) % 360
          }, 100%, 85%, 0.8)`;
          ctx.fillRect(
            block.x + 10 + i * segmentWidth,
            hashVizY,
            segmentWidth,
            hashVizHeight
          );
        }
      });

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    // Add interactivity
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      blocks.forEach((block) => {
        block.selected =
          mouseX >= block.x &&
          mouseX <= block.x + block.width &&
          mouseY >= block.y &&
          mouseY <= block.y + block.height;
      });
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  function generateRandomHash() {
    let hash = "";
    const chars = "0123456789abcdef";
    for (let i = 0; i < 16; i++) {
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return hash;
  }
  return (
    <motion.div
      className="w-full rounded-lg overflow-hidden border border-green-200 shadow-lg bg-white p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
        <svg
          className="w-6 h-6 mr-2 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        Carbon Credit Blockchain
      </h3>
      <div className="text-sm text-gray-600 mb-4">
        Live visualization of verified carbon credits on the blockchain
      </div>
      <div className="relative w-full h-48 bg-gray-50 rounded overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="mt-3 flex justify-between text-xs text-gray-500">
        <div>Latest block: #4,329,058</div>
        <div>Total credits verified: 14,892</div>
        <div>Network: Polygon</div>
      </div>
    </motion.div>
  );
};

export default BlockchainVisualization;
