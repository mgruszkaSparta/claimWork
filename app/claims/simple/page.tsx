"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import SimpleClaimForm from "@/components/claim-form/simple-claim-form"

export default function SimpleClaimPage() {
  return (
    <div className="p-4">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Dodaj prostą szkodę</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleClaimForm />
        </CardContent>
      </Card>
    </div>
  )
}

