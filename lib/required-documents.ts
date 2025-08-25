import { apiService } from '@/lib/api'
import type { RequiredDocument } from '@/types'

export async function getRequiredDocumentsByObjectType(
  objectTypeId?: string | number
): Promise<RequiredDocument[]> {
  const docs = await apiService.getRequiredDocuments({
    objectTypeId: objectTypeId ? Number(objectTypeId) : undefined,
  })
  return docs.map((d) => ({
    id: d.id.toString(),
    name: d.name,
    required: d.isRequired,
    uploaded: false,
    description: d.description ?? '',
    category: d.category ?? undefined,
  }))
}
