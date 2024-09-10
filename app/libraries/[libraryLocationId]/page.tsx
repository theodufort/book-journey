import { getSEOTags } from "@/libs/seo";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Link from "next/link";

const supabase = createClientComponentClient<Database>();

export async function generateMetadata({
  params,
}: {
  params: { libraryLocationId: string };
}) {
  const match = params.libraryLocationId.match(/libraries-in-(.+)-(.+)/);
  if (!match) {
    throw new Error("Invalid URL format");
  }
  const [, city, stateAbbr] = match;
  const cityName = city.replace(/-/g, " ");

  return getSEOTags({
    title: `Libraries in ${cityName}, ${stateAbbr.toUpperCase()}`,
    description: `List of libraries located in ${cityName}, ${stateAbbr.toUpperCase()}.`,
    canonicalUrlRelative: `/libraries/${params.libraryLocationId}`,
  });
}

export default async function LibraryLocationPage({
  params,
}: {
  params: { libraryLocationId: string };
}) {
  const match = params.libraryLocationId.match(/libraries-in-(.+)-(.+)/);
  if (!match) {
    throw new Error("Invalid URL format");
  }
  const [, city, stateAbbr] = match;
  const cityName = city.replace(/-/g, " ");
  const { data: libraries, error } = await supabase
    .from("libraries")
    .select("*")
    .ilike("city_ascii", cityName)
    .ilike("state_id", stateAbbr)
    .order("display_name", { ascending: true });
  if (error) {
    console.error(error);
    return <div>Error loading libraries. Please try again later.</div>;
  }

  if (!libraries || libraries.length === 0) {
    return <div>No libraries found in this location.</div>;
  }

  const stateName = libraries[0].state_name;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">
        Libraries in {cityName}, {stateAbbr.toUpperCase()}
      </h1>
      <ul className="space-y-2">
        {libraries.map((library) => (
          <li key={library.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{library.display_name}</h2>
            <p>County: {library.county_name}</p>
            {library.lat && library.lon && (
              <p>
                Coordinates: {library.lat}, {library.lon}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
