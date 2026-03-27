import { redirect } from 'next/navigation'

export default function ShowPage({ params }: { params: { id: string } }) {
  redirect(`/shows/${params.id}/foh`)
}
