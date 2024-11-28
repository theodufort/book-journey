"use client";
import Header from "@/components/Header";
import RoadmapCard from "@/components/RoadmapCard";
import { useState } from "react";
import IdeaSubmissionForm from "@/components/IdeaSubmissionForm";

interface Task {
  title: string;
  description: string;
  tags: string[];
  votes: number;
}

const mockTasks = {
  ideas: [
    {
      title: "Integration with Goodreads",
      description: "Allow users to import their Goodreads libraries",
      tags: ["integration", "feature"],
      votes: 25,
    },
    {
      title: "Reading Challenges",
      description: "Create and participate in reading challenges with friends",
      tags: ["social", "feature"],
      votes: 18,
    },
  ],
  planned: [
    {
      title: "Mobile App Development",
      description: "Create native mobile apps for iOS and Android",
      tags: ["mobile", "app", "development"],
      votes: 15,
    },
    {
      title: "Dark Mode Support",
      description: "Implement dark mode across the platform",
      tags: ["ui", "theme"],
      votes: 8,
    },
  ],
  inProgress: [
    {
      title: "User Authentication",
      description: "Implement OAuth and social login",
      tags: ["security", "auth"],
      votes: 12,
    },
  ],
  completed: [
    {
      title: "Search Functionality",
      description: "Implement advanced search features",
      tags: ["search", "feature"],
      votes: 20,
    },
  ],
};

export default function Roadmap() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'ideas'>('roadmap');

  const allTags = Array.from(
    new Set(
      [
        ...mockTasks.planned,
        ...mockTasks.inProgress,
        ...mockTasks.completed,
      ].flatMap((task) => task.tags)
    )
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filterTasks = (tasks: Task[]) => {
    if (selectedTags.length === 0) return tasks;
    return tasks.filter((task) =>
      task.tags.some((tag) => selectedTags.includes(tag))
    );
  };
  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 pb-24">
        <section className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Product Roadmap</h1>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-outline">
                Filter by tags ({selectedTags.length})
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </label>
              <div
                tabIndex={0}
                className="dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                {allTags.map((tag, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-2 p-2 hover:bg-base-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div role="tablist" className="tabs tabs-boxed mb-6">
            <a 
              role="tab" 
              className={`tab ${activeTab === 'roadmap' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('roadmap')}
            >
              Roadmap
            </a>
            <a 
              role="tab" 
              className={`tab ${activeTab === 'ideas' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('ideas')}
            >
              Community Ideas
            </a>
          </div>

          <div className="tab-contents">
            <div className={`tab-content ${activeTab === 'roadmap' ? '' : 'hidden'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Planned Column */}
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-xl mb-4">Planned</h2>
                    <div className="space-y-4">
                      {filterTasks(mockTasks.planned).map((task, index) => (
                        <RoadmapCard key={index} {...task} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-xl mb-4">In Progress</h2>
                    <div className="space-y-4">
                      {filterTasks(mockTasks.inProgress).map((task, index) => (
                        <RoadmapCard key={index} {...task} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Completed Column */}
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-xl mb-4">Completed</h2>
                    <div className="space-y-4">
                      {filterTasks(mockTasks.completed).map((task, index) => (
                        <RoadmapCard key={index} {...task} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`tab-content ${activeTab === 'ideas' ? '' : 'hidden'}`}>
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-xl mb-4">Community Ideas</h2>
                    <IdeaSubmissionForm
                      onSubmit={(idea) => {
                        // Here you would typically make an API call to save the idea
                        console.log("New idea submitted:", idea);
                      }}
                    />
                    <div className="divider">Submitted Ideas</div>
                    <div className="space-y-4">
                      {filterTasks(mockTasks.ideas).map((task, index) => (
                        <RoadmapCard key={index} {...task} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
