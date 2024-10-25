"use client";

import { categories } from "@/components/CategorySelection";
import { DialogModal } from "@/components/DialogModal";
import Header from "@/components/Header";
import { Database } from "@/types/supabase";

import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";
import { FormEvent, useEffect, useRef, useState } from "react";

export const BooksType = [
    "Novel",
    "Comic Book (BD)",
    "Manga",
    "Audiobook",
    "Ebook",
    "Graphic Novel",
    "Poetry (Collection)",
    "Picture Book / Children's Book",
    "Essay / Collection of Articles",
    "Play (Script)",
    "Practical Book / Guide",
    "Travel Journal / Personal Diary",
    // "Pop-up Book",
    // "Coloring Book",
    // "Catalog / Artbook"
];

export default function Join() {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClientComponentClient<Database>();
    const [user, setUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [error, setError] = useState(null);

    const [authorData, setAuthorData] = useState<AuthorType>({
        author_name: "",
        birth_date: "",
        first_book_published_year: 0,
        personal_favorite_genres: [],
        main_writing_genres: [],
        type_of_books: [],
        picture: "", // TODO upload sur un serv une photo
        website: "",
        books_written: 0,
        social_media_id: null,
        user_id: "0",
    });

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
        };
        getUser();
    }, [])
    console.log("Mon compte: " + user);


    const handleChangeMultipleSelectWritingGenre = (text: String) => {
        setAuthorData((prevData) => {
            const normalizedCategory = String(text); // Conversion en string
            const isAlreadySelected = prevData.main_writing_genres.includes(normalizedCategory);
            const updatedGenres = isAlreadySelected
                ? prevData.main_writing_genres.filter((genre) => genre !== normalizedCategory) // Retirer si présent
                : [...prevData.main_writing_genres, normalizedCategory]; // Ajouter sinon

            return {
                ...prevData,
                main_writing_genres: updatedGenres,
            };
        });
    };

    const handleChangeMultipleSelectFavoriteGenre = (text: String) => {
        setAuthorData((prevData) => {
            const normalizedCategory = String(text); // Conversion en string
            const isAlreadySelected = prevData.personal_favorite_genres.includes(normalizedCategory);
            const updatedGenres = isAlreadySelected
                ? prevData.personal_favorite_genres.filter((genre) => genre !== normalizedCategory) // Retirer si présent
                : [...prevData.personal_favorite_genres, normalizedCategory]; // Ajouter sinon

            return {
                ...prevData,
                personal_favorite_genres: updatedGenres,
            };
        });
    };

    const handleChangeMultipleSelectTypeBooks = (text: String) => {
        setAuthorData((prevData) => {
            const normalizedCategory = String(text); // Conversion en string
            const isAlreadySelected = prevData.type_of_books.includes(normalizedCategory);
            const updatedGenres = isAlreadySelected
                ? prevData.type_of_books.filter((genre) => genre !== normalizedCategory) // Retirer si présent
                : [...prevData.type_of_books, normalizedCategory]; // Ajouter sinon

            return {
                ...prevData,
                type_of_books: updatedGenres,
            };
        });
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
            <section className="max-w-7xl mx-auto px-4 py-5">
                <h2 className="text-center font-extrabold text-4xl md:text-5xl tracking-tight mb-8">
                    Rejoignez notre communauté d'auteurs
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nom d'auteur */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <label className="text-right font-semibold md:w-48">Author name</label>
                        <input
                            id="author_name"
                            name="author_name"
                            className="input input-bordered flex-grow"
                            placeholder="Enter your author name"
                        />
                    </div>

                    {/* Date de naissance */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <label className="text-right font-semibold md:w-48">Date of birth</label>
                        <input
                            id="birth_date"
                            name="birth_date"
                            type="date"
                            className="input input-bordered flex-grow"
                        />
                    </div>

                    {/* Année du premier livre */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <label className="text-right font-semibold md:w-48">Year of first book</label>
                        <input
                            id="first_book_published_year"
                            name="first_book_published_year"
                            type="date"
                            className="input input-bordered flex-grow"
                        />
                    </div>

                    {/* Sélectionner des genre favori */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <label className="text-right font-semibold md:w-48">Favorite genre</label>
                        <div className="flex-grow">
                            <DialogModal className="max-h-[80%]" btnName={`Selected choice (${authorData.personal_favorite_genres.length})`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <label className="col-span-2 font-bold text-lg mb-3">Select your favorite genre</label>
                                    {categories.map(category => (
                                        <label key={category} className="flex items-center mb-2">
                                            <input
                                                id="personal_favorite_genres"
                                                name="personal_favorite_genres"
                                                type="checkbox"
                                                className="checkbox checkbox-primary mr-1"
                                                checked={authorData.personal_favorite_genres.includes(category)}
                                                onChange={() => handleChangeMultipleSelectFavoriteGenre(category)}
                                            />
                                            {category}
                                        </label>
                                    ))}
                                </div>
                            </DialogModal>
                        </div>
                    </div>



                    {/* Sélectionner des catégories */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <label className="text-right font-semibold md:w-48">Main writing genre</label>
                        <div className="flex-grow">
                            <DialogModal className="max-h-[80%]" btnName={`Selected choice (${authorData.main_writing_genres.length})`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <label className="col-span-2 font-bold text-lg mb-3">Select your main writing genre</label>
                                    {categories.map(category => (
                                        <label key={category} className="flex items-center mb-2">
                                            <input
                                                id="main_writing_genres"
                                                name="main_writing_genres"
                                                type="checkbox"
                                                className="checkbox checkbox-primary mr-1"
                                                checked={authorData.main_writing_genres.includes(category)}
                                                onChange={() => handleChangeMultipleSelectWritingGenre(category)}
                                            />
                                            {category}
                                        </label>
                                    ))}
                                </div>
                            </DialogModal>
                        </div>
                    </div>

                    {/* Type de livres */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <label className="text-right font-semibold md:w-48">Type of books</label>
                        <div className="flex-grow">
                            <DialogModal className="max-h-[80%]" btnName={`Selected choice (${authorData.type_of_books.length})`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <label className="col-span-2 font-bold text-lg mb-3">Select your type of books</label>
                                    {BooksType.map(book => (
                                        <label key={book} className="flex items-center mb-2">
                                            <input
                                                id="type_of_books"
                                                name="type_of_books"
                                                type="checkbox"
                                                className="checkbox checkbox-primary mr-1"
                                                checked={authorData.type_of_books.includes(book)}
                                                onChange={() => handleChangeMultipleSelectTypeBooks(book)}
                                            />
                                            <label className="max-w-28 md:max-w-full">
                                                {book}
                                            </label>
                                        </label>
                                    ))}
                                </div>
                            </DialogModal>
                        </div>
                    </div>

                    {/* Photo (URL) */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <label className="text-right font-semibold md:w-48">Photo (URL)</label>
                        <input
                            id="picture"
                            name="picture"
                            type="file"
                            className="file-input  flex-grow"
                            placeholder="Entrez l'URL de la photo"
                        />
                    </div>

                    {/* Site Web */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <label className="text-right font-semibold md:w-48">Website</label>
                        <input
                            id="website"
                            name="website"
                            className="input input-bordered flex-grow"
                            placeholder="Entrez l'URL de votre site web"
                        />
                    </div>

                    {/* Livres écrits */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <label className="text-right font-semibold md:w-48">Books written</label>
                        <input
                            id="books_written"
                            name="books_written"
                            type="number"
                            className="input input-bordered flex-grow"
                            placeholder="Enter the number of books written"
                        />
                    </div>

                    {/* Bouton de soumission */}
                    <div className="flex items-center justify-end col-span-1 md:col-span-2">
                        <button className="btn btn-primary w-full md:w-auto" type="submit" disabled={isLoading}>
                            Save
                        </button>
                    </div>
                </form>
            </section>




        </>
    )
}