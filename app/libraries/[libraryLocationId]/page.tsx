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
  const [state, city] = params.libraryLocationId.split('-').map(part => part.replace(/-/g, ' '));

  return getSEOTags({
    title: `Libraries in ${city}, ${state}`,
    description: `List of libraries located in ${city}, ${state}.`,
    canonicalUrlRelative: `/libraries/${params.libraryLocationId}`,
  });
}

export default async function LibraryLocationPage({
  params,
}: {
  params: { libraryLocationId: string };
}) {
  const [state, city] = params.libraryLocationId.split('-').map(part => part.replace(/-/g, ' '));

  const { data: libraries, error } = await supabase
    .from("libraries")
    .select("*")
    .eq("state_name", state)
    .eq("city_ascii", city)
    .order("display_name", { ascending: true });

  if (error) {
    console.error(error);
    return <div>Error loading libraries. Please try again later.</div>;
  }

  if (!libraries || libraries.length === 0) {
    return <div>No libraries found in this location.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Libraries in {city}, {state}</h1>
      <ul className="space-y-2">
        {libraries.map((library) => (
          <li key={library.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{library.display_name}</h2>
            <p>County: {library.county_name}</p>
            {library.lat && library.lon && (
              <p>Coordinates: {library.lat}, {library.lon}</p>
            )}
          </li>
        ))}
      </ul>
      <Link href="/libraries" className="text-blue-600 hover:underline">
        Back to Libraries Directory
      </Link>
    </div>
  );
}
