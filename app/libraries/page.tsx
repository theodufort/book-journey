import { getSEOTags } from "@/libs/seo";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Link from "next/link";

const supabase = createClientComponentClient<Database>();

export async function generateMetadata() {
  return getSEOTags({
    title: "Libraries Directory",
    description: "Find libraries near you.",
    canonicalUrlRelative: "/libraries",
  });
}

export default async function LibrariesDirectory() {
  const { data: libraries, error } = await supabase
    .from("libraries")
    .select("*")
    .order("state_name", { ascending: true })
    .order("city_ascii", { ascending: true });

  if (error) {
    console.error(error);
    return <div>Error loading libraries. Please try again later.</div>;
  }

  const librariesByState = libraries.reduce((acc, library) => {
    if (!acc[library.state_name]) {
      acc[library.state_name] = {};
    }
    if (!acc[library.state_name][library.city_ascii]) {
      acc[library.state_name][library.city_ascii] = [];
    }
    acc[library.state_name][library.city_ascii].push(library);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Libraries Directory</h1>
      {Object.entries(librariesByState).map(([state, cities]) => (
        <div key={state} className="space-y-4">
          <h2 className="text-2xl font-semibold">{state}</h2>
          {Object.entries(cities).map(([city, cityLibraries]) => (
            <div key={city} className="space-y-2">
              <h3 className="text-xl font-medium">{city}</h3>
              <ul className="list-disc list-inside">
                {cityLibraries.map((library) => (
                  <li key={library.id}>
                    <Link
                      href={`/libraries/${library.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      {library.display_name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
