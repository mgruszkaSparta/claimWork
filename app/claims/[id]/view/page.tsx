'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ArrowLeft, Edit } from 'lucide-react';
import type { Claim, Note, UploadedFile } from '@/types';
import { transformApiClaimToFrontend } from '@/hooks/use-claims';
import { dictionaryService, type DictionaryItemDto } from '@/lib/dictionary-service';
import CommunicationClaimSummary from '@/components/claim-form/communication-claim-summary';
import { PropertyClaimSummary } from '@/components/claim-form/property-claim-summary';
import { TransportClaimSummary } from '@/components/claim-form/transport-claim-summary';

export default function ViewClaimPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [claimStatuses, setClaimStatuses] = useState<DictionaryItemDto[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [notes] = useState<Note[]>([]);
  const [riskTypes, setRiskTypes] = useState<{ value: string; label: string }[]>([]);

  const id = params.id as string;

  const loadClaimData = useCallback(async () => {
    if (!id) {
      setLoadError('Brak ID szkody');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setLoadError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/claims/${id}`, {
        method: 'GET',
        credentials: 'omit',
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setClaim(transformApiClaimToFrontend(data));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nie udało się załadować szkody';
      setLoadError(message);
      toast({ title: 'Błąd', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadClaimData();
  }, [loadClaimData]);

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const res = await dictionaryService.getClaimStatuses();
        setClaimStatuses(res.items);
      } catch (err) {
        console.error('Error loading claim statuses:', err);
      }
    };
    loadStatuses();
  }, []);

  useEffect(() => {
    if (!claim?.objectTypeId) return;
    const loadRiskTypes = async () => {
      try {
        const res = await dictionaryService.getRiskTypes(String(claim.objectTypeId));
        setRiskTypes(
          (res.items || []).map((item) => ({
            value: String(item.id),
            label: item.name,
          })),
        );
      } catch (err) {
        console.error('Error loading risk types:', err);
      }
    };
    loadRiskTypes();
  }, [claim?.objectTypeId]);

  const claimStatusMap = useMemo(() => {
    const map: Record<number, { name: string; color?: string }> = {};
    claimStatuses.forEach((s) => {
      const idNum = typeof s.id === 'string' ? parseInt(s.id) : s.id;
      map[idNum] = { name: s.name, color: s.color };
    });
    return map;
  }, [claimStatuses]);

  const getStatusBadge = (statusId?: number) => {
    const statusInfo = statusId ? claimStatusMap[statusId] : undefined;
    const color =
      statusInfo?.color || 'bg-gray-100 text-gray-800 border-gray-200';
    return <Badge className={color}>{statusInfo?.name || 'Brak'}</Badge>;
  };

  const renderClaimFolder = () => {
    if (!claim) return null;
    const commonProps = {
      claimFormData: claim,
      notes,
      uploadedFiles,
      setUploadedFiles,
      eventId: claim.eventId,
      claimStatuses,
      riskTypes,
    };
    switch (String(claim.objectTypeId)) {
      case '2':
        return <PropertyClaimSummary {...commonProps} />;
      case '3':
        return <TransportClaimSummary {...commonProps} />;
      default:
        return <CommunicationClaimSummary {...commonProps} />;
    }
  };

  const handleClose = () => router.push('/claims');
  const handleEdit = () => router.push(`/claims/${id}/edit`);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#1a3a6c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Ładowanie szkody...</p>
        </div>
      </div>
    );
  }

  if (loadError || !claim) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Błąd ładowania
          </h2>
          <p className="text-gray-600 mb-4">
            {loadError || 'Nie znaleziono szkody'}
          </p>
          <div className="flex space-x-3 justify-center">
            <Button onClick={loadClaimData} variant="outline">
              Spróbuj ponownie
            </Button>
            <Button onClick={handleClose}>Powrót do listy</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Szkoda {claim.spartaNumber || claim.claimNumber}
              </h1>
              <p className="text-sm text-gray-500">
                {claim.brand} {claim.model} • {claim.owner}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(claim.claimStatusId)}
            <Button
              onClick={handleEdit}
              className="bg-[#1a3a6c] hover:bg-[#1a3a6c]/90"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edytuj
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">{renderClaimFolder()}</div>
      </div>

      <Toaster />
    </div>
  );
}

