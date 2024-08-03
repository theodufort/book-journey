"use client";
import React, { useState, FormEvent } from "react";
import axios from "axios";
import { z } from "zod";
import BookAvatar from "./BookAvatar";

// Define the form data structure
export interface FormData {
  genre: string;
  format: string;
  min_page_count: number;
  max_page_count?: number;
  author: string;
  language: string;
}

// Define the quiz question structure
interface QuizQuestion {
  name: keyof FormData;
  label: string;
  inputType: "input" | "select" | "checkbox";
  dataType?: string;
  min?: number | null;
  max?: number | null;
  options?: { label: string; value: string | number }[];
}

// Define the form fields
const fieldsList: QuizQuestion[] = [
  {
    name: "genre",
    label: "Genre",
    inputType: "select",
    options: [
      { label: "Any", value: "any" },
      { label: "Fiction", value: "fiction" },
      { label: "Non-Fiction", value: "non-fiction" },
      { label: "Mystery", value: "mystery" },
      { label: "Sci-Fi", value: "sci-fi" },
      { label: "Romance", value: "romance" },
    ],
  },
  {
    name: "format",
    label: "Format",
    inputType: "select",
    options: [
      { label: "Physical", value: "physical" },
      { label: "E-Book", value: "ebook" },
      { label: "Audio", value: "audio" },
    ],
  },
  {
    name: "min_page_count",
    label: "Min Page Count",
    inputType: "input",
    dataType: "number",
    min: 1,
    max: null,
  },
  {
    name: "max_page_count",
    label: "Max Page Count",
    inputType: "input",
    dataType: "number",
    min: 1,
    max: null,
  },
  {
    name: "author",
    label: "Author",
    inputType: "input",
    dataType: "text",
  },
  {
    name: "language",
    label: "Language",
    inputType: "select",
    options: [
      { label: "Abkhazian", value: "ab" },
      { label: "Afar", value: "aa" },
      { label: "Afrikaans", value: "af" },
      { label: "Akan", value: "ak" },
      { label: "Albanian", value: "sq" },
      { label: "Amharic", value: "am" },
      { label: "Arabic", value: "ar" },
      { label: "Aragonese", value: "an" },
      { label: "Armenian", value: "hy" },
      { label: "Assamese", value: "as" },
      { label: "Avaric", value: "av" },
      { label: "Avestan", value: "ae" },
      { label: "Aymara", value: "ay" },
      { label: "Azerbaijani", value: "az" },
      { label: "Bambara", value: "bm" },
      { label: "Bashkir", value: "ba" },
      { label: "Basque", value: "eu" },
      { label: "Belarusian", value: "be" },
      { label: "Bengali", value: "bn" },
      { label: "Bislama", value: "bi" },
      { label: "Bosnian", value: "bs" },
      { label: "Breton", value: "br" },
      { label: "Bulgarian", value: "bg" },
      { label: "Burmese", value: "my" },
      { label: "Catalan, Valencian", value: "ca" },
      { label: "Chamorro", value: "ch" },
      { label: "Chechen", value: "ce" },
      { label: "Chichewa", value: "ny" },
      { label: "Chinese", value: "zh" },
      {
        label: "Church Slavonic",
        value: "cu",
      },
      { label: "Chuvash", value: "cv" },
      { label: "Cornish", value: "kw" },
      { label: "Corsican", value: "co" },
      { label: "Cree", value: "cr" },
      { label: "Croatian", value: "hr" },
      { label: "Czech", value: "cs" },
      { label: "Danish", value: "da" },
      { label: "Divehi", value: "dv" },
      { label: "Dutch, Flemish", value: "nl" },
      { label: "Dzongkha", value: "dz" },
      { label: "English", value: "en" },
      { label: "Esperanto", value: "eo" },
      { label: "Estonian", value: "et" },
      { label: "Ewe", value: "ee" },
      { label: "Faroese", value: "fo" },
      { label: "Fijian", value: "fj" },
      { label: "Finnish", value: "fi" },
      { label: "French", value: "fr" },
      { label: "Western Frisian", value: "fy" },
      { label: "Fulah", value: "ff" },
      { label: "Gaelic", value: "gd" },
      { label: "Galician", value: "gl" },
      { label: "Ganda", value: "lg" },
      { label: "Georgian", value: "ka" },
      { label: "German", value: "de" },
      { label: "Greek, Modern", value: "el" },
      { label: "Kalaallisut, Greenlandic", value: "kl" },
      { label: "Guarani", value: "gn" },
      { label: "Gujarati", value: "gu" },
      { label: "Haitian, Haitian Creole", value: "ht" },
      { label: "Hausa", value: "ha" },
      { label: "Hebrew", value: "he" },
      { label: "Herero", value: "hz" },
      { label: "Hindi", value: "hi" },
      { label: "Hiri Motu", value: "ho" },
      { label: "Hungarian", value: "hu" },
      { label: "Icelandic", value: "is" },
      { label: "Ido", value: "io" },
      { label: "Igbo", value: "ig" },
      { label: "Indonesian", value: "id" },
      {
        label: "Interlingua",
        value: "ia",
      },
      { label: "Interlingue, Occidental", value: "ie" },
      { label: "Inuktitut", value: "iu" },
      { label: "Inupiaq", value: "ik" },
      { label: "Irish", value: "ga" },
      { label: "Italian", value: "it" },
      { label: "Japanese", value: "ja" },
      { label: "Javanese", value: "jv" },
      { label: "Kannada", value: "kn" },
      { label: "Kanuri", value: "kr" },
      { label: "Kashmiri", value: "ks" },
      { label: "Kazakh", value: "kk" },
      { label: "Central Khmer", value: "km" },
      { label: "Kikuyu, Gikuyu", value: "ki" },
      { label: "Kinyarwanda", value: "rw" },
      { label: "Kirghiz, Kyrgyz", value: "ky" },
      { label: "Komi", value: "kv" },
      { label: "Kongo", value: "kg" },
      { label: "Korean", value: "ko" },
      { label: "Kurdish", value: "ku" },
      { label: "Kuanyama, Kwanyama", value: "kj" },
      { label: "Latin", value: "la" },
      { label: "Luxembourgish", value: "lb" },
      { label: "Macedonian", value: "mk" },
      { label: "Malagasy", value: "mg" },
      { label: "Malay", value: "ms" },
      { label: "Malayalam", value: "ml" },
      { label: "Maltese", value: "mt" },
      { label: "Manx", value: "gv" },
      { label: "Maori", value: "mi" },
      { label: "Marathi", value: "mr" },
      { label: "Marshallese", value: "mh" },
      { label: "Mongolian", value: "mn" },
      { label: "Nauru", value: "na" },
      { label: "Navajo, Navaho", value: "nv" },
      { label: "North Ndebele", value: "nd" },
      { label: "Nepali", value: "ne" },
      { label: "Ndonga", value: "ng" },
      { label: "Norwegian Bokmål", value: "nb" },
      { label: "Norwegian Nynorsk", value: "nn" },
      { label: "Norwegian", value: "no" },
      { label: "Sichuan Yi, Nuosu", value: "ii" },
      { label: "South Ndebele", value: "nr" },
      { label: "Occitan", value: "oc" },
      { label: "Ojibwa", value: "oj" },
      {
        label: "Church Slavic",
        value: "cu",
      },
      { label: "Oriya", value: "or" },
      { label: "Oromo", value: "om" },
      { label: "Ossetian, Ossetic", value: "os" },
      { label: "Pali", value: "pi" },
      { label: "Panjabi, Punjabi", value: "pa" },
      { label: "Persian", value: "fa" },
      { label: "Polish", value: "pl" },
      { label: "Portuguese", value: "pt" },
      { label: "Pushto, Pashto", value: "ps" },
      { label: "Quechua", value: "qu" },
      { label: "Romansh", value: "rm" },
      { label: "Romanian", value: "ro" },
      { label: "Rundi", value: "rn" },
      { label: "Russian", value: "ru" },
      { label: "Samoan", value: "sm" },
      { label: "Sango", value: "sg" },
      { label: "Sanskrit", value: "sa" },
      { label: "Sardinian", value: "sc" },
      { label: "Serbian", value: "sr" },
      { label: "Shona", value: "sn" },
      { label: "Sindhi", value: "sd" },
      { label: "Sinhala, Sinhalese", value: "si" },
      { label: "Slovak", value: "sk" },
      { label: "Slovenian", value: "sl" },
      { label: "Somali", value: "so" },
      { label: "Sotho, Southern", value: "st" },
      { label: "South Ndebele", value: "nr" },
      { label: "Spanish, Castilian", value: "es" },
      { label: "Sundanese", value: "su" },
      { label: "Swahili", value: "sw" },
      { label: "Swati", value: "ss" },
      { label: "Swedish", value: "sv" },
      { label: "Tagalog", value: "tl" },
      { label: "Tahitian", value: "ty" },
      { label: "Tajik", value: "tg" },
      { label: "Tamil", value: "ta" },
      { label: "Tatar", value: "tt" },
      { label: "Telugu", value: "te" },
      { label: "Thai", value: "th" },
      { label: "Tibetan", value: "bo" },
      { label: "Tigrinya", value: "ti" },
      { label: "Tonga", value: "to" },
      { label: "Tsonga", value: "ts" },
      { label: "Tswana", value: "tn" },
      { label: "Turkish", value: "tr" },
      { label: "Turkmen", value: "tk" },
      { label: "Twi", value: "tw" },
      { label: "Uighur, Uyghur", value: "ug" },
      { label: "Ukrainian", value: "uk" },
      { label: "Urdu", value: "ur" },
      { label: "Uzbek", value: "uz" },
      { label: "Venda", value: "ve" },
      { label: "Vietnamese", value: "vi" },
      { label: "Volapük", value: "vo" },
      { label: "Walloon", value: "wa" },
      { label: "Welsh", value: "cy" },
      { label: "Western Frisian", value: "fy" },
      { label: "Wolof", value: "wo" },
      { label: "Xhosa", value: "xh" },
      { label: "Yiddish", value: "yi" },
      { label: "Yoruba", value: "yo" },
      { label: "Zhuang, Chuang", value: "za" },
      { label: "Zulu", value: "zu" },
    ],
  },
];

// Define the schema for validation
const schema = z.object({
  genre: z.string().nonempty("Genre is required").default("any"),
  format: z.string().nonempty("Format is required").default("physical"),
  min_page_count: z
    .number()
    .min(1, "Minimum page count must be at least 1")
    .default(1)
    .optional(),
  max_page_count: z
    .number()
    .min(1, "Maximum page count must be at least 1")
    .default(9999999)
    .optional(),
  author: z.string().optional(),
  language: z.string().nonempty("Language is required").default("en"),
});

const BookFinder = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [booksLoaded, setBooksLoaded] = useState(false);
  const [bookSuggestions, setBookSuggestions] = useState([]);
  const [formData, setFormData] = useState<FormData>({
    genre: schema.shape.genre._def.defaultValue(),
    format: schema.shape.format._def.defaultValue(),
    min_page_count: undefined,
    max_page_count: undefined,
    author: "",
    language: schema.shape.language._def.defaultValue(),
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      schema.parse(formData);
      setError(null);

      // Submit form data to the backend
      const response = await axios.post("/api/bf", formData);
      for (let i = 0; i < response.data.items.length; i++) {
        bookSuggestions.push(response.data.items[i]);
      }
      setBooksLoaded(true);
      setShowDialog(true);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setError(error.errors.map((err) => err.message).join(", "));
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleInputChange = (name: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <section
      id="quiz"
      className="max-w-7xl bg-base-100 gap-16 lg:gap-20 px-8 py-10 lg:py-20 text-black"
    >
      <h2 className="font-extrabold inline-block mb-6 text-4xl lg:text-6xl tracking-tight">
        Find a book to read in 1 minute!
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {fieldsList.map((field) => (
            <div key={field.name} className="flex">
              <label className="w-auto font-extrabold md:text-xl justify-start mr-2 my-auto">
                {field.label}
                {": "}
              </label>
              <div className="flex ml-auto mr-0 justify-end min-h-10">
                {field.inputType === "select" ? (
                  <select
                    className="border-black border-2 rounded-lg w-max max-w-full select select-bordered h-auto"
                    name={field.name}
                    value={formData[field.name] as string | number}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.inputType === "input" ? (
                  <input
                    className="border-black border-2 rounded-lg w-4/5 input input-bordered h-auto"
                    type={field.dataType}
                    name={field.name}
                    value={
                      field.dataType == "number"
                        ? (formData[field.name] as number)
                        : (formData[field.name] as string)
                    }
                    onChange={(e) =>
                      handleInputChange(
                        field.name,
                        field.dataType == "number"
                          ? e.target.valueAsNumber
                          : e.target.value
                      )
                    }
                  />
                ) : field.inputType === "checkbox" ? (
                  <input
                    type="checkbox"
                    className="checkbox h-auto"
                    name={field.name}
                    checked={formData[field.name] as any}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.checked)
                    }
                  />
                ) : null}
              </div>
            </div>
          ))}
          {error && <p>{error}</p>}
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-wide mx-auto flex my-5"
        >
          Find Books
        </button>
      </form>

      <dialog className="modal" open={showDialog}>
        <div className="modal-box w-11/12 max-w-5xl">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                setShowDialog(false);
              }}
            >
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg pb-5">
            Here are some books we found for you...
          </h3>
          {booksLoaded ? (
            bookSuggestions.length != 0 ? (
              <div className="grid grid-cols-3 gap-5">
                {bookSuggestions.map((x, index) => {
                  if (index > 2)
                    return (
                      <div key={index}>
                        <BookAvatar vol={x} isBlurred={true} allowAdd={false} />
                      </div>
                    );
                  else
                    return (
                      <div key={index}>
                        <BookAvatar
                          vol={x}
                          isBlurred={false}
                          allowAdd={false}
                        />
                      </div>
                    );
                })}
              </div>
            ) : (
              <div className="text-center">
                <h2 className="font-bold text-lg pb-5">No Results</h2>
              </div>
            )
          ) : null}
        </div>
      </dialog>
    </section>
  );
};

export default BookFinder;
