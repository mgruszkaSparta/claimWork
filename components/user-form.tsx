'use client'

import { useEffect, useState, FormEvent } from 'react'
import { apiService } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface UserFormProps {
  userId?: string
}

export default function UserForm({ userId }: UserFormProps) {
  const isEdit = !!userId
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (isEdit && userId) {
      apiService.getUser(userId).then((u) => {
        setUserName(u.userName)
        setEmail(u.email ?? '')
      })
    }
  }, [isEdit, userId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isEdit && userId) {
      await apiService.updateUser(userId, { userName, email })
    } else {
      await apiService.register(userName, email, password)
    }
    router.push('/')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 p-4">
      <div>
        <Label htmlFor="userName">Nazwa użytkownika</Label>
        <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {!isEdit && (
        <div>
          <Label htmlFor="password">Hasło</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
      )}
      <Button type="submit">{isEdit ? 'Zapisz' : 'Utwórz'} użytkownika</Button>
    </form>
  )
}

