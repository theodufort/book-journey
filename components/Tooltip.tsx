import { useEffect, useState } from "react";
import { PlacesType, Tooltip } from "react-tooltip";
import { v4 as uuidv4 } from "uuid";
interface props {
  content: string;
  place: PlacesType;
}

export default function TooltipHelper({ content, place }: props) {
  const [anchorId, setAnchorId] = useState<string>("");
  useEffect(() => {
    setAnchorId(uuidv4());
  }, []); // Only run once on mount
  return (
    <div>
      <p className={`anchor-${anchorId}`}>
        <svg
          height={25}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="Warning / Info">
            <path
              id="Vector"
              d="M12 11V16M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 8V8.1L11.9502 8.1002V8H12.0498Z"
              stroke="#000000"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        </svg>
      </p>
      <Tooltip
        className="z-[10000] max-w-[200px] whitespace-normal break-words"
        anchorSelect={`.anchor-${anchorId}`}
        place={place}
      >
        {content}
      </Tooltip>
    </div>
  );
}
