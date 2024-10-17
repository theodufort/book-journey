"use client";

import Header from "@/components/Header";
import { Database } from "@/types/supabase";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";
import { FormEvent, useState } from "react";

export default function Join() {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClientComponentClient<Database>();
    const [user, setUser] = useState<User | null>(null);

    const [error, setError] = useState(null);

    // TODO Vérifier si le type des champs est bon
    const [authorData, setAuthorData] = useState<AuthorType>({
        author_name: "",
        birth_date: "",
        first_book_published_year: 0, 
        personal_favorite_genres: "",
        main_writing_genres: "",
        type_of_books: "",
        picture: "",
        website: "",
        books_written: 0,
        social_media_id: null,
        user_id: "0", 
      });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        setIsLoading(true);

        try {
            //TODO vérifier si [authorData] est suffisant pour l'ajout
            //const { data, error } = await supabase.from("Author").insert([authorData]);
      
            if (error) throw error;
            alert("Auteur ajouté avec succès !");
          } catch (error) {
            console.error("Erreur lors de l'insertion :", error.message);
          }
    }

    return (
        <>
            <Header />
            <section className="max-w-7xl mx-auto px-8 py-5">
                <h2 className="text-center font-extrabold text-4xl md:text-5xl tracking-tight mb-8">
                    Join our author community
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-3 justify-center">
                        <label className="content-center text-right w-48">Nom d'auteur</label>
                        <input id="Name" className="border p-1 rounded w-3/4" />
                    </div>
                    <div className="flex items-center gap-3 justify-center">
                        <label className="content-center text-right w-48">Description</label>
                        <input id="Description" className="border p-1 rounded w-3/4" />
                    </div>
                    <div className="flex items-center gap-3 justify-center">
                        <label className="content-center text-right w-48">Age</label>
                        <input id="Description" className="border p-1 rounded w-3/4" />
                    </div>




                    <div className="flex items-center gap-3 justify-end col-span-2">
                        <button className="btn btn-primary" type="submit" disabled={isLoading}>Press me</button>
                    </div>
                </form>
            </section>
        </>
    )
}