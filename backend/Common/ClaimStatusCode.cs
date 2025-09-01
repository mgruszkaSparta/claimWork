namespace AutomotiveClaimsApi.Common
{
    public enum ClaimStatusCode
    {
        ToAssign = 1,
        New = 2,
        Registered = 3,
        InLiquidation = 5,
        PartiallyLiquidated = 6,
        Recourse = 8,
        Appeal = 9,
        Closed = 10
    }
}
