import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
interface props {
  isbn: string;
}
export default function BookSharebutton({ isbn }: props) {
  const t = useTranslations("BookShareButton");
  const copylink = () => {
    navigator.clipboard.writeText(
      process.env.NEXT_PUBLIC_BASE_URL + `/books/${isbn}`
    );
    toast.success(t("message"));
  };
  return (
    <button className="btn btn-secondary" onClick={copylink}>
      {/* {t("label")} */}🔗
    </button>
  );
}
