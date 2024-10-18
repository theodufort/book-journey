"use client";

import { categories } from "@/components/CategorySelection";
import Header from "@/components/Header";
import { Database } from "@/types/supabase";

import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";
import { FormEvent, useState } from "react";

export default function Join() {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClientComponentClient<Database>();
    const [user, setUser] = useState<User | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
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

    const categories2 = [
        { text: 'Books', value: 1 },
        { text: 'Movies, Music & Games', value: 2 },
        { text: 'Electronics & Computers', value: 3 },
        { text: 'Home, Garden & Tools', value: 4 },
        { text: 'Health & Beauty', value: 5 },
        { text: 'Toys, Kids & Baby', value: 6 },
        { text: 'Clothing & Jewelry', value: 7 },
        { text: 'Sports & Outdoors', value: 8 },
        { text: 'Automotive & Industrial', value: 9 }
    ];

    const handleChangeMultipleSelect = (value: number) => {
        if (selectedCategories.includes(value)) {
            setSelectedCategories(selectedCategories.filter(category => category !== value));
        } else {
            setSelectedCategories([...selectedCategories, value]);
        }
    };

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
                        <label className="text-right w-48">Nom d'auteur</label>
                        <input
                            id="author_name"
                            name="author_name"
                            className="border p-1 rounded w-3/4"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-3 justify-center">
                        <label className="text-right w-48">Date de naissance</label>
                        <input
                            id="birth_date"
                            name="birth_date"
                            type="date"
                            className="border p-1 rounded w-3/4"
                        />
                    </div>

                    <div className="flex items-center gap-3 justify-center">
                        <label className="text-right w-48">Année du premier livre</label>
                        <input
                            id="first_book_published_year"
                            name="first_book_published_year"
                            type="date"
                            className="border p-1 rounded w-3/4"
                        />
                    </div>

                    <div className="flex items-center gap-3 justify-center">
                        <label className="text-right w-48">Genres favoris</label>
                        <input
                            id="personal_favorite_genres"
                            name="personal_favorite_genres"
                            className="border p-1 rounded w-3/4"
                        />
                    </div>

                    <div className="flex items-center gap-3 justify-center">
                        <label className="text-right w-48">Genres d'écriture principaux</label>
                        <input
                            id="main_writing_genres"
                            name="main_writing_genres"
                            className="border p-1 rounded w-3/4"
                        />
                    </div>
                    <div className="relative">
                        <button onClick={() => setIsOpen(!isOpen)} className="btn">
                            Sélectionner des catégories ({selectedCategories.length})
                        </button>
                        {isOpen && (
                            <div className="absolute z-10 bg-white border border-gray-300 mt-1 p-2 rounded shadow-md">
                                {categories2.map(category => (
                                    <label key={category.value} className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={selectedCategories.includes(category.value)}
                                            onChange={() => handleChangeMultipleSelect(category.value)}
                                        />
                                        {category.text}
                                    </label>
                                ))}
                                <button onClick={() => setIsOpen(false)} className="btn mt-2">
                                    Fermer
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 justify-center">
                        <label className="text-right w-48">Type de livres</label>
                        <input
                            id="type_of_books"
                            name="type_of_books"
                            className="border p-1 rounded w-3/4"
                        />
                    </div>

                    <div className="flex items-center gap-3 justify-center">
                        <label className="text-right w-48">Photo (URL)</label>
                        <input
                            id="picture"
                            name="picture"
                            className="border p-1 rounded w-3/4"
                        />
                    </div>

                    <div className="flex items-center gap-3 justify-center">
                        <label className="text-right w-48">Site Web</label>
                        <input
                            id="website"
                            name="website"
                            className="border p-1 rounded w-3/4"
                        />
                    </div>

                    <div className="flex items-center gap-3 justify-center">
                        <label className="text-right w-48">Livres écrits</label>
                        <input
                            id="books_written"
                            name="books_written"
                            type="number"
                            className="border p-1 rounded w-3/4"
                        />
                    </div>
                    <div className="flex items-center gap-3 justify-end col-span-2">
                        <button className="btn btn-primary" type="submit" disabled={isLoading}>Press me</button>
                    </div>
                </form>
            </section>
        </>
    )
}