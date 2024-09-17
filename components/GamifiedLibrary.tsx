import { MutableRefObject, useRef } from "react";
import Image from "next/image";

const useDragToScroll = () => {
  const ref: MutableRefObject<any> = useRef();
  const onMouseDown = (e: any) => {
    ref.current.isDown = true;
    ref.current.startX = e.pageX - ref.current.offsetLeft;
    ref.current.scrollLeft = ref.current.scrollLeft;
  };

  const onMouseLeave = () => {
    ref.current.isDown = false;
  };

  const onMouseUp = () => {
    ref.current.isDown = false;
  };

  const onMouseMove = (e: any) => {
    if (!ref.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - ref.current.startX) * 1; // Scroll-fast
    ref.current.scrollLeft = ref.current.scrollLeft - walk;
  };

  return { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove };
};

const BookSpine = () => {
  return (
    <div
      className="flex items-end justify-center" // Align items at the bottom
      style={{ minWidth: "60px", height: "100%" }}
    >
      <div className="relative h-full w-full flex items-end">
        {" "}
        {/* Ensure full height and bottom alignment */}
        <Image
          className="object-contain"
          src="/default-book-cover.png"
          alt="book cover"
          fill={true}
        />
      </div>
    </div>
  );
};

export default function GamifiedLibrary() {
  const { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove } =
    useDragToScroll();

  return (
    <div
      ref={ref}
      className="border-8 rounded-md grid grid-flow-col auto-cols-min gap-4 h-40 cursor-grab overflow-hidden"
      style={{
        borderColor: "#6b360e",
        backgroundColor: "#f5945c",
        whiteSpace: "nowrap",
        overflowX: "auto",
      }}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      {Array(20).fill(<BookSpine />)}
    </div>
  );
}
