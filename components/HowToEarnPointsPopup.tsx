import { useState } from "react";

interface props {
  showDialog: boolean;
}
export const HowToEarnPointsPopup = ({ showDialog }: props) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center m-0">
      <dialog className="modal" open={showDialog}>
        <div className="modal-box w-11/12 max-w-2xl">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                showDialog = false;
              }}
            >
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg pb-5">
            Here is how you can earn points
          </h3>
          <ul className="list-decimal list-inside">
            <li>
              Start reading a book of your choice by searching for it or adding
              it from reading recommendations.
            </li>
            <li>
              When finished reading, change the reading status to "Finished" and
              you will be awarded points!
            </li>
            <li>
              Earn additionnal points by leaving a star review and a text
              review.
            </li>
          </ul>
        </div>
      </dialog>
    </div>
  );
};
