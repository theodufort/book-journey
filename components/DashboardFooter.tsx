import Image from "next/image";
export const DashboardFooter = () => (
  <footer className="fixed bottom-0 left-0 right-0 bg-base-300 text-center py-2 text-xs z-10">
    <div className="flex items-center justify-center">
      <p className="mr-2">
        Download the app from any browser by clicking the icon in the address
        bar:
      </p>
      <Image src={"/pwa.png"} width={20} height={20} alt="PWA icon" />
    </div>
  </footer>
);
