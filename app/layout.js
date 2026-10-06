import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { getUser } from "@/lib/auth";
import "./globals.css";

// "latin-ext" covers names such as Gorō and Kondō
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
});

export const metadata = {
  title: { default: "Movie Browser", template: "%s | Movie Browser" },
  description: "Browse Studio Ghibli movies",
};

export default async function RootLayout({ children }) {
  // Read on the server, then handed to the navbar as a prop
  const user = await getUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}
    >
      <body>
        <Navbar user={user} />
        {children}
        <footer>Movie data from the Studio Ghibli API</footer>
      </body>
    </html>
  );
}
