import ButtonCheckout from "./ButtonCheckout";
import config from "@/config";

interface SubscriptionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="modal modal-open z-[100000]">
      <div className="modal-box w-11/12 max-w-5xl relative">
        <button
          onClick={() => {
            onClose();
          }}
          className="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
export default SubscriptionManager;
