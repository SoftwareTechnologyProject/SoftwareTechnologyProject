import Lottie from "lottie-react";
import effect from "../../assets/New_Year.json";

const Effect = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: 150,
        zIndex: 9999,
        pointerEvents: "none"
      }}
    >
      <Lottie className="relative" animationData={effect} loop autoplay />
    </div>
  );
};

export default Effect;