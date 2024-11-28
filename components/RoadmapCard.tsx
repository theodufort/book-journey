interface TaskProps {
  title: string;
  description: string;
  tags: string[];
  votes: number;
}

export default function RoadmapCard({ title, description, tags, votes }: TaskProps) {
  return (
    <div className="card bg-base-100 shadow-xl mb-4">
      <div className="card-body p-4">
        <h3 className="card-title text-lg">{title}</h3>
        <p className="text-sm">{description}</p>
        <div className="flex flex-wrap gap-2 my-2">
          {tags.map((tag, index) => (
            <span key={index} className="badge badge-primary badge-sm">{tag}</span>
          ))}
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2">
            <button className="btn btn-sm btn-ghost">👍</button>
            <span className="flex items-center">{votes}</span>
            <button className="btn btn-sm btn-ghost">👎</button>
          </div>
        </div>
      </div>
    </div>
  );
}
