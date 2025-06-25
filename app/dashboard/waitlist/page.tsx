import { Metadata } from "next"
import WaitlistContainer from "@/components/dashboard/waitlist/WaitlistContainer"

export const metadata: Metadata = {
  title: "Waitlist - ClosetMind",
  description: "Manage your virtual try-on waitlist",
}

export default function WaitlistPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Virtual Try-On Waitlist</h1>
      <WaitlistContainer />
    </div>
  )
}