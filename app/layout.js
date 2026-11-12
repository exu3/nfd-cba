import "./globals.css";

export const metadata = {
  title: "NFD Source Protection — Cost/Benefit",
  description: "Risk-weighted cost/benefit of source protection alternatives for the Norwich Fire District well",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
