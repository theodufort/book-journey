import { User } from "@supabase/supabase-js";

interface ProfileInfoProps {
  user: User | null;
  preferredCategories: string[];
  setPreferredCategories: React.Dispatch<React.SetStateAction<string[]>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  bio: string;
  setBio: React.Dispatch<React.SetStateAction<string>>;
  profilePictureUrl: string;
  setProfilePictureUrl: React.Dispatch<React.SetStateAction<string>>;
  updateProfile: () => Promise<void>;
  isUpdated: boolean;
}

export default function ProfileInfo({
  user,
  preferredCategories,
  setPreferredCategories,
  username,
  setUsername,
  bio,
  setBio,
  profilePictureUrl,
  setProfilePictureUrl,
  updateProfile,
  isUpdated,
}: ProfileInfoProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        updateProfile();
      }}
      className="space-y-6"
    >
      <div>
        <span className="label-text">
          Preferred Book Categories (Choose up to 3)
        </span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {[
            "Fiction",
            "Non-fiction",
            "Mystery",
            "Science Fiction",
            "Fantasy",
            "Romance",
            "Thriller",
            "Biography",
            "History",
            "Self-help",
          ].map((category) => (
            <label
              key={category}
              className="label cursor-pointer justify-start gap-2"
            >
              <input
                type="checkbox"
                className="checkbox"
                checked={preferredCategories.includes(category)}
                onChange={() => {
                  setPreferredCategories((prev) => {
                    if (prev.includes(category)) {
                      return prev.filter((c) => c !== category);
                    } else if (prev.length < 3) {
                      return [...prev, category];
                    }
                    return prev;
                  });
                }}
              />
              <span className="label-text">{category}</span>
            </label>
          ))}
        </div>
      </div>
      <button type="submit" className="btn btn-primary">
        Save Profile
      </button>
      {isUpdated && (
        <p className="text-green-500 mt-2">Profile updated successfully!</p>
      )}
    </form>
  );
}
