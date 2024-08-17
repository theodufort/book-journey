import Image from "next/image";
interface props {
  item: any;
  showRating: boolean;
}
export const BookAvatarPublic = ({ item, showRating }: props) => {
  return (
    <div className="card shadow-sm">
      <figure className="px-4 pt-4">
        <Image
          src={
            item.data.volumeInfo.imageLinks?.thumbnail ||
            "/default-book-cover.png"
          }
          alt={item.data.volumeInfo.title}
          width={120}
          height={180}
          className="rounded-lg"
        />
      </figure>
      <div className="card-body flex flex-col items-center text-center">
        <h3 className="card-title text-sm">{item.data.volumeInfo.title}</h3>
        <p className="text-xs">{item.data.volumeInfo.authors?.[0]}</p>
        {showRating ? (
          <div className="rating rating-sm h-4/5">
            {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => (
              <input
                key={star}
                type="radio"
                name={`rating-${item.book_id}`}
                className={`mask mask-star-2 h-auto min-h-full  ${
                  star % 1 === 0 ? "mask-half-2" : "mask-half-1"
                } bg-orange-400`}
                checked={item.rating === star}
                readOnly
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
