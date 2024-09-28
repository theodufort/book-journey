import { Author } from './types';

export const authors: Author[] = [
  {
    id: 1,
    name: "Jane Doe",
    genre: "Fiction",
    language: "English",
    selfPublished: true,
    bio: "Jane Doe is a self-published author known for her captivating fiction novels."
  },
  {
    id: 2,
    name: "John Smith",
    genre: "Non-Fiction",
    language: "English",
    selfPublished: false,
    bio: "John Smith is a traditionally published author specializing in insightful non-fiction works."
  },
  {
    id: 3,
    name: "Maria Garcia",
    genre: "Mystery",
    language: "Spanish",
    selfPublished: true,
    bio: "Maria Garcia is a rising star in the Spanish-language mystery genre, self-publishing her thrilling novels."
  },
  {
    id: 4,
    name: "Pierre Dubois",
    genre: "Sci-Fi",
    language: "French",
    selfPublished: false,
    bio: "Pierre Dubois is a traditionally published French science fiction author known for his imaginative worlds."
  },
  {
    id: 5,
    name: "Emily Chen",
    genre: "Fiction",
    language: "English",
    selfPublished: false,
    bio: "Emily Chen is a promising new voice in fiction, published by a major publishing house."
  }
];
