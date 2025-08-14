'use client'

import { useEffect, useState, FormEvent } from 'react'
import { apiService } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface UserFormProps {
  userId?: string
}

export default function UserForm({ userId }: UserFormProps) {
  const isEdit = !!userId
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [role, setRole] = useState('user')
  const [isActive, setIsActive] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (isEdit && userId) {
      apiService.getUser(userId).then((u) => {
        setUserName(u.userName)
        setEmail(u.email ?? '')
        setFirstName(u.firstName ?? '')
        setLastName(u.lastName ?? '')
        setPhoneNumber(u.phoneNumber ?? '')
        setRole(u.roles[0] ?? 'user')
        setIsActive(u.isActive)
      })
    }
  }, [isEdit, userId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isEdit && userId) {
      await apiService.updateUser(userId, {
        userName,
        email,
        firstName,
        lastName,
        phoneNumber,
        roles: [role],
        isActive,
      })
    } else {
      await apiService.createUser({
        userName,
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        roles: [role],
        isActive,
      })
    }
    router.push('/settings/users')
  }

  const handleDelete = async () => {
    if (userId) {
      await apiService.deleteUser(userId)
      router.push('/settings/users')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 p-4">
      <div>
        <Label htmlFor="userName">Nazwa użytkownika</Label>
        <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Imię</Label>
          <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="lastName">Nazwisko</Label>
          <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      </div>
      {!isEdit && (
        <div>
          <Label htmlFor="password">Hasło</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      )}
      <div>
        <Label>Rola</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Rola" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Użytkownik</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="active" checked={isActive} onCheckedChange={(c) => setIsActive(!!c)} />
        <Label htmlFor="active">Aktywny</Label>
      </div>
      <div className="flex gap-2">
        <Button type="submit">{isEdit ? 'Zapisz' : 'Utwórz'} użytkownika</Button>
        {isEdit && (
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Usuń
          </Button>
        )}
      </div>
    </form>
  )
}

