"use client";
import { useState, useEffect } from "react";
import { getSEOTags } from "@/libs/seo";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Link from "next/link";

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
      <h1 className="text-3xl font-bold">Books Like</h1>
      <div className="mb-4"></div>
    </div>
  );
}
