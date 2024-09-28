import Link from 'next/link';
import { getSEOTags } from "@/libs/seo";

export async function generateMetadata() {
  return getSEOTags({
    title: "Tools - MyBookQuest",
    description: "Explore our collection of book-related tools",
    canonicalUrlRelative: `/tools`,
  });
}

const tools = [
  {
    name: "AI Book Recommendations",
    description: "Get personalized book recommendations from our AI assistant",
    path: "/tools/ai-book-recommendations",
  },
  // Add more tools here as they become available
];

export default function ToolsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-center mb-10">MyBookQuest Tools</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <Link href={tool.path} key={index} className="block">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition duration-300">
              <h2 className="text-2xl font-bold mb-2">{tool.name}</h2>
              <p className="text-gray-600">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
