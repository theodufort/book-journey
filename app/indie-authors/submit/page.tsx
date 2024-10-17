import { useTranslations } from "next-intl";
function Submit() {
  const t = useTranslations("HomePage");
  return (
    <div>
      <h1>{t("title")}</h1>
    </div>
  );
}
export default Submit;
