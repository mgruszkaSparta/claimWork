import UserForm from '@/components/user-form'

export default function EditUserPage({ params }: { params: { id: string } }) {
  return <UserForm userId={params.id} />
}

