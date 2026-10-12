import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "react-hot-toast";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://reduanulhoque.web.app"),
  title: "MD REDUANUL HOQUE - Portfolio",
  description: "Computer Science and Engineering student portfolio. Exploring modern web technologies, algorithms, and deep thinking.",
  icons: {
    icon: "/icon.png?v=2",
    shortcut: "/icon.png?v=2",
    apple: "/icon.png?v=2",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MD REDUANUL HOQUE - Portfolio",
    description: "Computer Science and Engineering student portfolio. Exploring modern web technologies, algorithms, and deep thinking.",
    url: "https://reduanulhoque.web.app",
    siteName: "MD REDUANUL HOQUE - Portfolio",
    type: "website",
    images: [
      {
        url: "/Formal.jpg",
        width: 800,
        height: 1000,
        alt: "MD Reduanul Hoque",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MD REDUANUL HOQUE - Portfolio",
    description: "Computer Science and Engineering student portfolio. Exploring modern web technologies, algorithms, and deep thinking.",
    images: ["/Formal.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "MD Reduanul Hoque",
  url: "https://reduanulhoque.web.app",
  image: "https://reduanulhoque.web.app/Formal.jpg",
  jobTitle: "Computer Science & Engineering Student and Educator",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "United International University",
  },
  sameAs: [
    "https://github.com/mdreduanulhoque",
    "https://www.linkedin.com/in/md-reduanul-hoque-/",
    "https://www.facebook.com/reduan.sadik.9",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lora.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="bottom-right" toastOptions={{
              className: 'font-mono text-sm dark:bg-slate-900 dark:text-slate-100 border dark:border-slate-800',
            }} />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
