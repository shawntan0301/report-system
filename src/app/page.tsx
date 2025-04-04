import { HydrateClient } from "~/trpc/server";
import HomeButtons from "./_components/home-buttons";
// import '@/styles/globals.css'

export default async function Home() {
  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col items-center justify-center gap-20 bg-gradient-to-b from-[white] to-[#f7faff] py-12 text-black">
        <div className="w-full">
          <div className="container mx-auto">
            <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-40">
              <div className="flex flex-col gap-4">
                <h1 className="font-regular max-w-2xl text-center text-5xl tracking-tighter md:text-7xl">
                  Submit Report System
                </h1>
                <p className="text-muted-foreground max-w-2xl text-center text-lg leading-relaxed tracking-tight md:text-xl">
                  Submit your report and get our administratiors to review
                </p>
              </div>
              <HomeButtons />
            </div>
          </div>
        </div>
        {/* <Component {...pageProps} /> */}
      </div>
    </HydrateClient>
  );
}
