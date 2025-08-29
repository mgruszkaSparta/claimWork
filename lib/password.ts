export function validatePassword(password: string): string | null {
  const errors: string[] = []
  if (password.length < 6) errors.push('Hasło musi mieć co najmniej 6 znaków')
  if (!/[a-z]/.test(password)) errors.push('Hasło musi zawierać małą literę')
  if (!/[A-Z]/.test(password)) errors.push('Hasło musi zawierać wielką literę')
  if (!/[^a-zA-Z0-9]/.test(password)) errors.push('Hasło musi zawierać znak specjalny')
  return errors.length ? errors.join(', ') : null
}
