import { Volume } from "@/interfaces/GoogleAPI";
import React from "react";

interface props {
  vol: Volume;
}
const BookAvatar = ({ vol }: props) => {
  console.log("yo");
  console.log(vol);
  return (
    <div className="card lg:card-side bg-base-100 shadow-xl">
      <figure>
        <img src={vol.volumeInfo.imageLinks.smallThumbnail} />
      </figure>
      <div className="card-body">
        <h3 className="card-title">{vol.volumeInfo.title}</h3>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">View</button>
        </div>
      </div>
    </div>
  );
};

export default BookAvatar;
