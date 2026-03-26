import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ApiKeyProvider } from "@/context/ApiKeyContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ApiKeyModal from "@/components/ApiKeyModal";

export const metadata = {
  title: "PixelMuse | AI Fashion Studio",
  description:
    "Upload your photo and generate a stunning full-body virtual model using AI. Try on outfits, transfer styles, and build your wardrobe. Powered by Google Gemini.",
  keywords: ["virtual try-on", "AI fashion", "model generator", "style transfer", "Gemini AI", "PixelMuse"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ApiKeyProvider>
            <ApiKeyModal />
            <div className="saas-layout">
              <Sidebar />
              <div className="saas-main">
                <Header />
                <main className="saas-content">
                  {children}
                </main>
              </div>
            </div>
          </ApiKeyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
