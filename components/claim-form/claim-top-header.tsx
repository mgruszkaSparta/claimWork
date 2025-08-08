"use client"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, FileText, AlertTriangle, CheckCircle, Clock, XCircle, BookOpen, Gavel } from 'lucide-react'
import type { ClaimFormData } from "@/types"

interface ClaimTopHeaderProps {
  claimFormData: ClaimFormData
  onClose: () => void
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Nowa":
      return <AlertTriangle className="h-3.5 w-3.5" />
    case "W trakcie":
      return <Clock className="h-3.5 w-3.5" />
    case "Zamknięta":
      return <CheckCircle className="h-3.5 w-3.5" />
    case "Zawieszona":
      return <XCircle className="h-3.5 w-3.5" />
    default:
      return <FileText className="h-3.5 w-3.5" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Nowa":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "W trakcie":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "Zamknięta":
      return "bg-green-100 text-green-800 border-green-200"
    case "Zawieszona":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function ClaimTopHeader({ claimFormData, onClose }: ClaimTopHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4 mb-0 mx-0 w-full">
      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-2">
            <div className="bg-[rgb(26,58,108)] p-1.5 rounded-lg">
              <BookOpen className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-gray-700 mb-1">Nr szkody TU</span>
              <span className="block text-sm text-gray-900 font-semibold truncate">
                {claimFormData.insurerClaimNumber || "Nie określono"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-2">
            <div className="bg-[rgb(26,58,108)] p-1.5 rounded-lg">
              <User className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-gray-700 mb-1">Nazwa klienta</span>
              <span className="block text-sm text-gray-900 font-semibold truncate">
                {claimFormData.client || "Kawczyński Logistics Sp. z o.o."}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-2">
            <div className="bg-[rgb(26,58,108)] p-1.5 rounded-lg">
              <Calendar className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-gray-700 mb-1">Data szkody</span>
              <span className="block text-sm text-gray-900 font-semibold">
                {claimFormData.damageDate || "Nie określono"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-2">
            <div className="bg-[rgb(26,58,108)] p-1.5 rounded-lg">
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-gray-700 mb-1">Nr szkody Sparta</span>
              <span className="block text-sm text-gray-900 font-semibold truncate">
                {claimFormData.spartaNumber || "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-2">
            <div className="bg-[rgb(26,58,108)] p-1.5 rounded-lg">
              <Gavel className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-gray-700 mb-1">Szkodę zarejestrował</span>
              <span className="block text-sm text-gray-900 font-semibold truncate">
                {claimFormData.handler || "Nie określono"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
