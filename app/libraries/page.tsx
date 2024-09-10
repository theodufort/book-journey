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
    .select("state_name, city_ascii")
    .order("state_name", { ascending: true })
    .order("city_ascii", { ascending: true });

  if (error) {
    console.error(error);
    return <div>Error loading libraries. Please try again later.</div>;
  }

  const uniqueLocations = Array.from(new Set(libraries.map(lib => `${lib.state_name}-${lib.city_ascii}`)))
    .map(location => {
      const [state, city] = location.split('-');
      return { state, city };
    });

  const locationsByState = uniqueLocations.reduce((acc, location) => {
    if (!acc[location.state]) {
      acc[location.state] = [];
    }
    acc[location.state].push(location.city);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Libraries Directory</h1>
      {Object.entries(locationsByState).map(([state, cities]) => (
        <div key={state} className="space-y-4">
          <h2 className="text-2xl font-semibold">{state}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {cities.map((city) => (
              <li key={`${state}-${city}`}>
                <Link
                  href={`/libraries/libraries-in-${encodeURIComponent(city.toLowerCase().replace(/\s+/g, '-'))}-${state.toLowerCase().substring(0, 2)}`}
                  className="text-blue-600 hover:underline"
                >
                  {city}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
