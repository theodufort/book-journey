import Image from "next/image";
export const DashboardFooter = () => (
  <footer className="fixed bottom-0 left-0 right-0 bg-base-300 text-center py-1 text-xs">
    <div className="align-middle m-auto grid grid-cols-2 grid-rows-2">
      <p>
        Download the app from any browser by clicking the icon in the address
        bar:{" "}
      </p>
      <Image src={"/pwa.png"} width={40} height={40} alt={""} />
    </div>
  </footer>
);
