import { getSEOTags } from "@/libs/seo";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

const supabase = createClientComponentClient<Database>();

export async function generateMetadata({
  params,
}: {
  params: { libraryLocationId: string };
}) {
  const { data: library } = await supabase
    .from("libraries")
    .select("*")
    .eq("slug", params.libraryLocationId)
    .single();

  if (!library) {
    return {};
  }

  return getSEOTags({
    title: `${library.display_name} | Library in ${library.city_ascii}, ${library.state_id}`,
    description: `Information about ${library.display_name} located in ${library.city_ascii}, ${library.state_name}.`,
    canonicalUrlRelative: `/libraries/${library.slug}`,
  });
}

export default async function LibraryPage({
  params,
}: {
  params: { libraryLocationId: string };
}) {
  const { data: library } = await supabase
    .from("libraries")
    .select("*")
    .eq("slug", params.libraryLocationId)
    .single();

  if (!library) {
    return <div>Library not found</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{library.display_name}</h1>
      <p>Location: {library.city_ascii}, {library.state_name}</p>
      <p>County: {library.county_name}</p>
      {library.lat && library.lon && (
        <p>Coordinates: {library.lat}, {library.lon}</p>
      )}
    </div>
  );
}
