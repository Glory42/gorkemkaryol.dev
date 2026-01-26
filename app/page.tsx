import Homebar from "@/components/Homebar";

const routes = [
    "/me",
    "/experience",
    "/projects",
    "/interests",
    "/cool",
];

export default function Home() {
  return (
    <>
        <div className="flex flex-col justify-center items-center h-screen px-4 ">
            <div className="flex flex-col items-center">
                <div className="mt-4 text-5xl">Görkem Karyol</div>
            </div>
            <Homebar routes={routes}/>
        </div>
    </>
  );
}
