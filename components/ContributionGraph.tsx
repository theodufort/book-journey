import React from "react";

// Define the contribution data (replace with actual data)
const contributionData = [
  // Each inner array represents a week; each number represents a day's contribution level
  [0, 1, 0, 2, 3, 1, 0], // Week 1
  [2, 0, 1, 3, 4, 0, 1], // Week 2
  // Add more weeks as needed
];

const ContributionGraph = () => {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-lg font-bold mb-4">
        795 contributions in the last year
      </h2>
      <div className="border rounded-lg p-4">
        <div className="flex justify-between mb-2 text-sm text-gray-400">
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
        </div>
        <div className="flex">
          <div className="mr-2 flex flex-col justify-between text-sm text-gray-400">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div className="flex flex-wrap">
            {contributionData.map((week, i) => (
              <div key={i} className="flex flex-col mr-1">
                {week.map((day, j) => (
                  <div
                    key={j}
                    className={`w-4 h-4 rounded-sm mb-1 ${
                      day === 0
                        ? "bg-gray-800"
                        : day === 1
                        ? "bg-green-700"
                        : day === 2
                        ? "bg-green-600"
                        : day === 3
                        ? "bg-green-500"
                        : "bg-green-400"
                    }`}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-sm bg-gray-800"></div>
            <div className="w-4 h-4 rounded-sm bg-green-700"></div>
            <div className="w-4 h-4 rounded-sm bg-green-600"></div>
            <div className="w-4 h-4 rounded-sm bg-green-500"></div>
            <div className="w-4 h-4 rounded-sm bg-green-400"></div>
          </div>
          <span>More</span>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button className="text-sm p-2 bg-blue-500 text-white rounded">
          2024
        </button>
        <button className="text-sm p-2 text-gray-400">2023</button>
        <button className="text-sm p-2 text-gray-400">2022</button>
      </div>
    </div>
  );
};

export default ContributionGraph;
