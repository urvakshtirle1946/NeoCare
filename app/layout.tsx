import '@/styles/globals.css'

import { title } from "process";

export const metadata = {
  title: "Rag_Project",
  description: " ask about hackthon",
}

const Rootlayout = ({ children }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html >
  )
}

export default Rootlayout