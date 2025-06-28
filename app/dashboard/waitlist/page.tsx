import { Metadata } from "next"
import WaitlistContainer from "@/components/dashboard/waitlist/WaitlistContainer"

export const metadata: Metadata = {
  title: "Waitlist - TryStyle",
  description: "Manage your virtual try-on waitlist",
}

export default function WaitlistPage() {
  return (
    <div className="space-y-4 md:space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Virtual Try-On Waitlist</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Save and organize items you want to try on later</p>
      </div>
      <div className="px-4 md:px-6">
        <WaitlistContainer />
      </div>
    </div>
  )
}