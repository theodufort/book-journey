import { getSEOTags } from "@/libs/seo";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Link from "next/link";

const supabase = createClientComponentClient<Database>();

function getFullStateName(stateAbbr: string): string {
  const stateMap = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
  };
  return stateMap[stateAbbr as keyof typeof stateMap] || stateAbbr;
}

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
  const cityName = city.replace(/-/g, ' ');
  const stateName = getFullStateName(stateAbbr.toUpperCase());

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
  const cityName = city.replace(/-/g, ' ');
  const stateName = getFullStateName(stateAbbr.toUpperCase());

  const { data: libraries, error } = await supabase
    .from("libraries")
    .select("*")
    .eq("state_name", stateName)
    .eq("city_ascii", cityName)
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
