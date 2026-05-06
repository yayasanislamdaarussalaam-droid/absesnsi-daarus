import { getOfficeToken, regenerateQR } from "@/lib/actions/admin"
import QRCodeClient from "./QRCodeClient"

export default async function QRPage() {
  const token = await getOfficeToken()
  
  return <QRCodeClient initialToken={token} />
}
