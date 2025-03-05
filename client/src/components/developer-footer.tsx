import { Link } from "wouter";

export function DeveloperFooter() {
  return (
    <footer className="absolute bottom-0 w-full py-4 text-center text-sm text-muted-foreground">
      Software developed by{" "}
      <a 
        href="https://www.instagram.com/that_infamous_guy?igsh=dWFvMmtyOGIzaXkx&utm_source=qr"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        Nik_Boi
      </a>
    </footer>
  );
}
