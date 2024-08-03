import Image from "next/image";
interface props {
  item: any;
}
export const BookAvatarNoDetails = ({ item }: props) => {
  return (
    <div className="card shadow-sm">
      <figure className="px-4 pt-4">
        <Image
          src={
            item.volumeInfo.imageLinks?.thumbnail || "/default-book-cover.png"
          }
          alt={item.volumeInfo.title}
          width={120}
          height={180}
          className="rounded-lg"
        />
      </figure>
      <div className="card-body items-center text-center p-4">
        <h3 className="card-title text-sm">{item.volumeInfo.title}</h3>
        <p className="text-xs">{item.volumeInfo.authors?.[0]}</p>
      </div>
    </div>
  );
};
