import Header from "@/components/Header";
import RoadmapCard from "@/components/RoadmapCard";

const mockTasks = {
  planned: [
    {
      title: "Mobile App Development",
      description: "Create native mobile apps for iOS and Android",
      tags: ["mobile", "app", "development"],
      votes: 15
    },
    {
      title: "Dark Mode Support",
      description: "Implement dark mode across the platform",
      tags: ["ui", "theme"],
      votes: 8
    }
  ],
  inProgress: [
    {
      title: "User Authentication",
      description: "Implement OAuth and social login",
      tags: ["security", "auth"],
      votes: 12
    }
  ],
  completed: [
    {
      title: "Search Functionality",
      description: "Implement advanced search features",
      tags: ["search", "feature"],
      votes: 20
    }
  ]
};

export default function Roadmap() {
  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 pb-24">
        <section className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Product Roadmap</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Planned Column */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Planned</h2>
                <div className="space-y-4">
                  {mockTasks.planned.map((task, index) => (
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
                  {mockTasks.inProgress.map((task, index) => (
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
                  {mockTasks.completed.map((task, index) => (
                    <RoadmapCard key={index} {...task} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
