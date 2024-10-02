interface Props {
  showDialog: boolean;
  onClose: () => void;
}

export const HowToEarnPointsPopup = ({ showDialog, onClose }: Props) => {
  return (
    <dialog
      open={showDialog}
      className="modal fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex justify-center items-center m-0"
    >
      <div className="modal-box w-11/12 max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onClose}
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-2xl pb-5 text-center text-gray-800 dark:text-white">
          How to Earn Points
        </h3>
        <ul className="list-none space-y-4">
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center w-8 h-8 mr-2 text-white bg-blue-500 dark:bg-blue-600 rounded-full flex-shrink-0">
              1
            </span>
            <p className="text-gray-700 dark:text-gray-300">
              Start reading a book of your choice by searching for it or adding
              it from reading recommendations.
            </p>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center w-8 h-8 mr-2 text-white bg-blue-500 dark:bg-blue-600 rounded-full flex-shrink-0">
              2
            </span>
            <p className="text-gray-700 dark:text-gray-300">
              When finished reading, change the reading status to "Finished" and
              you will be awarded points!
            </p>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center w-8 h-8 mr-2 text-white bg-blue-500 dark:bg-blue-600 rounded-full flex-shrink-0">
              3
            </span>
            <p className="text-gray-700 dark:text-gray-300">
              Earn additional points by leaving a star review and a text review.
            </p>
          </li>
        </ul>
      </div>
    </dialog>
  );
};
