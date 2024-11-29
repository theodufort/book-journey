"use client";
import { useState } from "react";

interface IdeaSubmissionFormProps {
  onSubmit: (idea: {
    title: string;
    description: string;
    tags: string[];
  }) => void;
}

export default function IdeaSubmissionForm({
  onSubmit,
}: IdeaSubmissionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    setTitle("");
    setDescription("");
    setTags("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Idea title"
          className="input input-bordered w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <textarea
          placeholder="Describe your idea"
          className="textarea textarea-bordered w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          className="input input-bordered w-full"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary w-full">
        Submit Idea
      </button>
    </form>
  );
}
