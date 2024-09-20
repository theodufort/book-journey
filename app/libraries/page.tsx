"use client";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

const supabase = createClientComponentClient<Database>();

export default function LibrariesDirectory() {
  const [libraries, setLibraries] = useState<any[]>([]);
  const [counties, setCounties] = useState<string[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLibraries() {
      const { data, error } = await supabase
        .from("libraries")
        .select("state_name, state_id, city_ascii, county_name")
        .order("state_name", { ascending: true })
        .order("city_ascii", { ascending: true });

      if (error) {
        console.error(error);
        setError("Error loading libraries. Please try again later.");
      } else {
        setLibraries(data || []);
        const uniqueCounties = Array.from(
          new Set(data?.map((lib) => lib.county_name) || [])
        );
        setCounties(uniqueCounties.sort());
      }
    }

    fetchLibraries();
  }, []);

  const filteredLibraries = selectedCounty
    ? libraries.filter((lib) => lib.county_name === selectedCounty)
    : libraries;

  const uniqueLocations = Array.from(
    new Set(
      filteredLibraries.map(
        (lib) => `${lib.state_name}-${lib.state_id}-${lib.city_ascii}`
      )
    )
  ).map((location) => {
    const [state, stateId, city] = location.split("-");
    return { state, stateId, city };
  });

  const locationsByState = uniqueLocations.reduce((acc, location) => {
    if (!acc[location.state]) {
      acc[location.state] = { stateId: location.stateId, cities: [] };
    }
    acc[location.state].cities.push(location.city);
    return acc;
  }, {} as Record<string, { stateId: string; cities: string[] }>);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Libraries Directory</h1>
      <div className="mb-4">
        <label htmlFor="county-filter" className="mr-2">
          Filter by county:
        </label>
        <select
          id="county-filter"
          value={selectedCounty}
          onChange={(e) => setSelectedCounty(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Counties</option>
          {counties.map((county) => (
            <option key={county} value={county}>
              {county}
            </option>
          ))}
        </select>
      </div>
      {Object.entries(locationsByState).map(([state, { stateId, cities }]) => (
        <div key={state} className="space-y-4">
          <h2 className="text-2xl font-semibold">{state}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {cities.map((city) => (
              <li key={`${state}-${city}`}>
                <Link
                  href={`/libraries/libraries-in-${encodeURIComponent(
                    city.toLowerCase().replace(/\s+/g, "-")
                  )}-${stateId.toLowerCase()}`}
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
