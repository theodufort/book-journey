import { createAffLink } from "@/libs/amazon-aff";
import { useTranslations } from "next-intl";
interface props {
  title: string;
}
export default function ViewSellers({ title }: props) {
  const t = useTranslations("BookAvatar");
  return (
    <div className="dropdown md:dropdown-end dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-primary p-2">
        {t("view_sellers")}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow"
      >
        <li>
          <a
            href={`https://www.anrdoezrs.net/click-101259626-15734439?url=https://booksamillion.com/search2?query=${title}`}
            target="_blank"
          >
            Books a Million
          </a>
        </li>
        <li>
          <a
            href={`https://www.jdoqocy.com/click-101259626-15736645?url=https%3A%2F%2Fwww.2ndandcharles.com%2Fbook%2Fbrowse%2Fkeyword%2F${title}`}
            target="_blank"
          >
            2ND and Charles
          </a>
        </li>
        <li>
          <a
            href={`https://www.tkqlhce.com/click-101259626-15734795?url=https%3A%2F%2Fwww.barnesandnoble.com%2Fb%2F${title}%2F_%2FN-1p38`}
            target="_blank"
          >
            Barnes and Nobles
          </a>
        </li>
        <li>
          <a
            href={`https://www.tkqlhce.com/click-101259626-15733690?url=https%3A%2F%2Fwww.audiobooks.com%2Fsearch%2Fbook%2F${title}`}
            target="_blank"
          >
            Audiobooks.com
          </a>
        </li>
        <li>
          <a href={createAffLink(title)} target="_blank">
            Amazon
          </a>
        </li>
      </ul>
    </div>
  );
}
