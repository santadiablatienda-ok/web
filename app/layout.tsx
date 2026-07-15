import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SANTA DIABLA · Moda & Actitud',
  description: 'Calzado de carácter. Botas, borcegos, zapatillas e importados. Envíos a todo el país.',
  keywords: 'santa diabla, calzado, botas, borcegos, zapatillas, importados, moda, actitud',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
