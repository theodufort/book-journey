import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getAuthorDetails(authorKey: string) {
  try {
    const response = await axios.get(
      `https://openlibrary.org${authorKey}.json`
    );
    if (response.status === 200) {
      const authorData = response.data;
      return {
        key: authorData.key,
        name: authorData.name,
        birth_date: authorData.birth_date,
        death_date: authorData.death_date,
        bio: authorData.bio?.value || authorData.bio,
      };
    }
  } catch (error) {
    console.error(`Error fetching author details for ${authorKey}:`, error);
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });

  // Check if the book exists in the cache
  const { data: cachedBook, error: cacheError } = await supabase
    .from("books")
    .select("data")
    .eq("isbn_13", `v2:${id}`)
    .single();

  if (cacheError && cacheError.code !== "PGRST116") {
    console.error("Error checking cache:", cacheError);
  }

  if (cachedBook) {
    return NextResponse.json(cachedBook.data);
  }

  // If not in cache, fetch from Open Library API
  try {
    // Step 1: Call /isbn/[isbn]
    const isbnResponse = await axios.get(
      `https://openlibrary.org/isbn/${id}.json`
    );

    if (isbnResponse.status !== 200) {
      throw new Error(
        `Open Library API responded with status ${isbnResponse.status}`
      );
    }

    const isbnData = isbnResponse.data;

    // Step 2: Get the corresponding /books/[key]
    const bookKey = isbnData.key;
    const bookResponse = await axios.get(
      `https://openlibrary.org${bookKey}.json`
    );

    if (bookResponse.status !== 200) {
      throw new Error(
        `Open Library API responded with status ${bookResponse.status}`
      );
    }

    const bookData = bookResponse.data;

    // Step 3: If a works key exists, ping /works/[workkey]
    let worksData = null;
    if (bookData.works && bookData.works.length > 0) {
      const worksKey = bookData.works[0].key;
      const worksResponse = await axios.get(
        `https://openlibrary.org${worksKey}.json`
      );

      if (worksResponse.status === 200) {
        worksData = worksResponse.data;
      } else {
        console.error(`Error fetching works data: ${worksResponse.status}`);
      }
    }

    // Combine data from all sources
    const combinedData = {
      ...isbnData,
      ...bookData,
      works: worksData,
    };

    // Transform the Open Library data to match our previous API structure
    const transformedBookData = {
      id: combinedData.key,
      volumeInfo: {
        title: combinedData.title,
        subtitle: combinedData.subtitle || null,
        authors: await (async () => {
          if (combinedData.authors && Array.isArray(combinedData.authors)) {
            const authorDetails = await Promise.all(
              combinedData.authors.map(async (author: any) => {
                if (typeof author === "string") return { name: author };
                if (author.key) {
                  const details = await getAuthorDetails(author.key);
                  return details || { name: author.name || "Unknown Author" };
                }
                return { name: author.name || "Unknown Author" };
              })
            );
            return authorDetails.filter(Boolean);
          }
          if (combinedData.author_name) {
            const authorSearchResponse = await axios.get(
              `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(
                combinedData.author_name[0]
              )}`
            );
            if (
              authorSearchResponse.status === 200 &&
              authorSearchResponse.data.docs.length > 0
            ) {
              const authorKey = authorSearchResponse.data.docs[0].key;
              const details = await getAuthorDetails(authorKey);
              return details
                ? [details]
                : [{ name: combinedData.author_name[0] }];
            }
            return combinedData.author_name.map((name: string) => ({ name }));
          }
          return [{ name: "Unknown Author" }];
        })(),
        publishedDate:
          combinedData.publish_date ||
          combinedData.first_publish_date ||
          "Unknown",
        description: combinedData.description
          ? typeof combinedData.description === "string"
            ? combinedData.description
            : combinedData.description?.value || ""
          : combinedData.works?.description?.value ||
            "No description available",
        industryIdentifiers: [
          { type: "ISBN_13", identifier: id },
          ...(combinedData.isbn_10
            ? [{ type: "ISBN_10", identifier: combinedData.isbn_10[0] }]
            : []),
        ],
        imageLinks: {
          thumbnail: combinedData.cover_i
            ? `https://covers.openlibrary.org/b/id/${combinedData.cover_i}-M.jpg`
            : null,
          small: combinedData.cover_i
            ? `https://covers.openlibrary.org/b/id/${combinedData.cover_i}-S.jpg`
            : null,
          medium: combinedData.cover_i
            ? `https://covers.openlibrary.org/b/id/${combinedData.cover_i}-M.jpg`
            : null,
          large: combinedData.cover_i
            ? `https://covers.openlibrary.org/b/id/${combinedData.cover_i}-L.jpg`
            : null,
        },
        pageCount: combinedData.number_of_pages || 0,
        categories: combinedData.subjects || combinedData.works?.subjects || [],
        language: combinedData.language
          ? typeof combinedData.language === "string"
            ? combinedData.language
            : combinedData.language.key
                ?.split("/")
                .pop()
                ?.slice(0, 3)
                .toLowerCase()
          : "und",
        publisher:
          combinedData.publishers && combinedData.publishers.length > 0
            ? combinedData.publishers[0].name || combinedData.publishers[0]
            : "Unknown Publisher",
        publishPlace:
          combinedData.publish_places && combinedData.publish_places.length > 0
            ? combinedData.publish_places[0].name ||
              combinedData.publish_places[0]
            : "Unknown",
        physicalFormat: combinedData.physical_format || null,
        pagination: combinedData.pagination || null,
        weight: combinedData.weight || null,
        identifiers: {
          goodreads: combinedData.identifiers?.goodreads || [],
          lccn: combinedData.lccn || [],
          oclc: combinedData.oclc_numbers || [],
          isbn_10: combinedData.isbn_10 || [],
          isbn_13: combinedData.isbn_13 || [],
        },
        classifications: {
          lc_classifications: combinedData.lc_classifications || [],
          dewey_decimal_class: combinedData.dewey_decimal_class || [],
        },
        subjects: combinedData.subjects
          ? combinedData.subjects.map(
              (subject: string | { name: string; url: string }) =>
                typeof subject === "string"
                  ? {
                      name: subject,
                      url: `https://openlibrary.org/subjects/${encodeURIComponent(
                        subject.toLowerCase().replace(/\s+/g, "_")
                      )}`,
                    }
                  : subject
            )
          : [],
        subject_places: combinedData.subject_places
          ? combinedData.subject_places.map(
              (place: string | { name: string; url: string }) =>
                typeof place === "string"
                  ? {
                      name: place,
                      url: `https://openlibrary.org/subjects/place:${encodeURIComponent(
                        place.toLowerCase().replace(/\s+/g, "_")
                      )}`,
                    }
                  : place
            )
          : [],
        subject_people: combinedData.subject_people
          ? combinedData.subject_people.map(
              (person: string | { name: string; url: string }) =>
                typeof person === "string"
                  ? {
                      name: person,
                      url: `https://openlibrary.org/subjects/person:${encodeURIComponent(
                        person.toLowerCase().replace(/\s+/g, "_")
                      )}`,
                    }
                  : person
            )
          : [],
        subject_times: combinedData.subject_times
          ? combinedData.subject_times.map(
              (time: string | { name: string; url: string }) =>
                typeof time === "string"
                  ? {
                      name: time,
                      url: `https://openlibrary.org/subjects/time:${encodeURIComponent(
                        time.toLowerCase().replace(/\s+/g, "_")
                      )}`,
                    }
                  : time
            )
          : [],
        excerpts: combinedData.excerpts || [],
        links: combinedData.links
          ? combinedData.links.map((link: any) => ({
              url: link.url,
              title: link.title,
            }))
          : [],
        ebooks: combinedData.ebooks
          ? combinedData.ebooks.map((ebook: any) => ({
              preview_url: ebook.preview_url,
            }))
          : [],
        works: worksData
          ? {
              key: worksData.key,
              title: worksData.title,
              description: worksData.description || null,
              subjects: worksData.subjects || [],
              subjectPlaces: worksData.subject_places || [],
              subjectTimes: worksData.subject_times || [],
            }
          : null,
      },
    };

    // Cache the book data
    const { error: insertError } = await supabase
      .from("books")
      .insert({ isbn_13: `v2:${id}`, data: transformedBookData });

    if (insertError) {
      console.error("Error caching book data:", insertError);
    }

    return NextResponse.json(transformedBookData);
  } catch (error) {
    console.error("Error fetching book details:", error);
    return NextResponse.json(
      { error: "Failed to fetch book details" },
      { status: 500 }
    );
  }
}
