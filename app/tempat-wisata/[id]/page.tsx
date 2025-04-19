import DetailTempatWisataClient from "./DetailTempatWisataClient"

export default function Page({ params }: { params: { id: string } }) {
  return <DetailTempatWisataClient id={params.id} />
}
