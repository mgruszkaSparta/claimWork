'use client'

import { useEffect, useState, FormEvent } from 'react'
import { apiService, type ClientDto } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { FormHeader } from '@/components/ui/form-header'
import { API_BASE_URL } from '@/lib/api'
import { User } from 'lucide-react'
import { validatePassword } from '@/lib/password'

interface UserFormProps {
  userId?: string
}

export default function UserForm({ userId }: UserFormProps) {
  const isEdit = !!userId
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState(true)
  const [roles, setRoles] = useState<string[]>([])
  const [roleValue, setRoleValue] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [originalEmail, setOriginalEmail] = useState('')
  const [fullAccess, setFullAccess] = useState(false)
  const [clients, setClients] = useState<ClientDto[]>([])
  const [clientIds, setClientIds] = useState<number[]>([])

  useEffect(() => {
    apiService.getClients().then(setClients)
    if (isEdit && userId) {
      apiService.getUser(userId).then((u) => {
        setUserName(u.userName)
        setFirstName(u.firstName ?? '')
        setLastName(u.lastName ?? '')
        setEmail(u.email ?? '')
        setPhone(u.phone ?? '')
        setStatus(u.status !== 'inactive')
        setRoles(u.roles ?? [])
        setOriginalEmail(u.email ?? '')
        setFullAccess(u.fullAccess ?? false)
        setClientIds(u.clientIds ? Array.from(u.clientIds) : [])
      })
    }
  }, [isEdit, userId])

  const handleRoleSelect = (value: string) => {
    if (value && !roles.includes(value)) {
      setRoles([...roles, value])
    }
    setRoleValue('')
  }

  const handleEmailBlur = async () => {
    if (!email || email === originalEmail) return
    const unique = await apiService.checkEmail(email)
    setErrors((prev) => {
      const newErrors = { ...prev }
      if (unique) {
        delete newErrors.email
      } else {
        newErrors.email = 'Email jest już używany'
      }
      return newErrors
    })
  }

  const validate = async () => {
    const newErrors: Record<string, string> = {}
    if (!userName.trim()) newErrors.userName = 'Nazwa użytkownika jest wymagana'
    if (!firstName.trim()) newErrors.firstName = 'Imię jest wymagane'
    if (!lastName.trim()) newErrors.lastName = 'Nazwisko jest wymagane'
    if (!email.trim()) newErrors.email = 'Email jest wymagany'
    if (!isEdit) {
      if (!password.trim()) newErrors.password = 'Hasło jest wymagane'
      else {
        const pwdError = validatePassword(password)
        if (pwdError) newErrors.password = pwdError
      }
    }
    if (!phone.trim()) newErrors.phone = 'Telefon jest wymagany'
    if (roles.length === 0) newErrors.roles = 'Wybierz co najmniej jedną rolę'
    if (!fullAccess && clientIds.length === 0) newErrors.clientIds = 'Wybierz co najmniej jednego klienta'
    if (email && email !== originalEmail) {
      const unique = await apiService.checkEmail(email)
      if (!unique) newErrors.email = 'Email jest już używany'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!(await validate())) return
    const payload = {
      userName,
      firstName,
      lastName,
      email,
      phone,
      roles,
      status: status ? 'active' : 'inactive',
      fullAccess,
      clientIds,
    }
    if (isEdit && userId) {
      await apiService.updateUser(userId, payload)
    } else {
      await apiService.register({ ...payload, password })
    }
    router.push('/')
  }

  return (
    <div className="max-w-md">
      <FormHeader icon={User} title={isEdit ? 'Edytuj użytkownika' : 'Nowy użytkownik'} />
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div>
          <Label htmlFor="userName">Nazwa użytkownika</Label>
          <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} />
          {errors.userName && <p className="text-sm text-red-500">{errors.userName}</p>}
        </div>
      <div>
        <Label htmlFor="firstName">Imię</Label>
        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
      </div>
      <div>
        <Label htmlFor="lastName">Nazwisko</Label>
        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleEmailBlur}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>
      {!isEdit && (
        <div>
          <Label htmlFor="password">Hasło</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>
      )}
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="status">Status</Label>
        <Switch id="status" checked={status} onCheckedChange={setStatus} />
        <span>{status ? 'Aktywowany' : 'Zablokowany'}</span>
      </div>
      <div>
        <Label htmlFor="roles">Role</Label>
        <SearchableSelect
          apiEndpoint={`${API_BASE_URL}/roles`}
          value={roleValue}
          onValueChange={handleRoleSelect}
          placeholder="Wybierz rolę..."
        />
        {errors.roles && <p className="text-sm text-red-500">{errors.roles}</p>}
        {roles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {roles.map((r) => (
              <Badge key={r}>{r}</Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="fullAccess"
          checked={fullAccess}
          onCheckedChange={(checked) => setFullAccess(checked === true)}
        />
        <Label htmlFor="fullAccess">Pełny dostęp</Label>
      </div>
      {!fullAccess && (
        <div>
          <Label>Klienci</Label>
          <div className="max-h-48 overflow-auto border rounded">
            <table className="w-full text-sm">
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="p-2">
                      <Checkbox
                        checked={clientIds.includes(c.id)}
                        onCheckedChange={(checked) =>
                          setClientIds((prev) =>
                            checked === true ? [...prev, c.id] : prev.filter((id) => id !== c.id),
                          )
                        }
                      />
                    </td>
                    <td className="p-2">{c.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errors.clientIds && <p className="text-sm text-red-500">{errors.clientIds}</p>}
        </div>
      )}
        <Button type="submit">{isEdit ? 'Zapisz' : 'Utwórz'} użytkownika</Button>
      </form>
    </div>
  )
}

