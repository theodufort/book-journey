import Link from "next/link";
import Image from "next/image";

interface props {
  name: string;
  image: string;
}
// This is the author avatar that appears in the article page and in <CardArticle /> component
const Avatar = ({ name, image }: props) => {
  return (
    <Link
      href={`/blog/author/${name}`}
      title={`Posts by ${name}`}
      className="inline-flex items-center gap-2 group"
      rel="author"
    >
      <span itemProp="author">
        <Image
          src={image}
          alt={`Avatar of ${name}`}
          className="w-7 h-7 rounded-full object-cover object-center"
          width={28}
          height={28}
        />
      </span>
      <span className="group-hover:underline">{name}</span>
    </Link>
  );
};

export default Avatar;
