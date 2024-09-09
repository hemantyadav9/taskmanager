import React from "react";
import "../styles/globals.css";

export const metadata = {
  title: 'Task Management App',
  description: 'A simple task management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}