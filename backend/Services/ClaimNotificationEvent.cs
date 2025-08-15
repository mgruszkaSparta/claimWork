namespace AutomotiveClaimsApi.Services
{
    public enum ClaimNotificationEvent
    {
        ClaimCreated,
        ClaimUpdated,
        StatusChanged,
        DocumentAdded,
        RequiredDocumentAdded,
        DecisionAdded,
        RecourseAdded,
        SettlementAdded,
        SettlementAppealAdded,
        SettlementAppealReminder30Days,
        SettlementAppealReminder60Days
    }
}
