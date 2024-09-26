import { generateSlug, parseSlug } from "@/app/libraries/_assets/generateSlug";
import { getSEOTags } from "@/libs/seo";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient<Database>();

export async function generateStaticParams() {
  const { data: libraries, error } = await supabase
    .from("libraries")
    .select("city_ascii, state_id")
    .order("city_ascii", { ascending: true })
    .order("state_id", { ascending: true });

  if (error) {
    console.error("Error fetching libraries:", error.message);
    return [];
  }

  if (!libraries || libraries.length === 0) {
    console.error("No libraries found.");
    return [];
  }

  const uniqueLocations = Array.from(
    new Set(libraries.map((lib) => `${lib.city_ascii}-${lib.state_id}`))
  );

  return uniqueLocations.map((location) => {
    const [city, stateId] = location.split("-");
    return {
      libraryLocationId: generateSlug(city, stateId),
    };
  });
}
export async function generateMetadata({
  params,
}: {
  params: { libraryLocationId: string };
}) {
  const slugData = parseSlug(params.libraryLocationId);
  if (!slugData) {
    throw new Error("Invalid URL format");
  }
  const { city, stateAbbr } = slugData;

  return getSEOTags({
    title: `Libraries in ${city}, ${stateAbbr}`,
    description: `List of libraries located in ${city}, ${stateAbbr}.`,
    canonicalUrlRelative: `/libraries/${params.libraryLocationId}`,
  });
}

export default async function LibraryLocationPage({
  params,
}: {
  params: { libraryLocationId: string };
}) {
  const slugData = parseSlug(params.libraryLocationId);
  if (!slugData) {
    throw new Error("Invalid URL format");
  }
  const { city, stateAbbr } = slugData;

  const { data: libraries, error } = await supabase
    .from("libraries")
    .select("*")
    .ilike("city_ascii", city)
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
        Libraries in {city}, {stateAbbr}
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
