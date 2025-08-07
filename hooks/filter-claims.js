export function filterClaims(claims, searchTerm, filters) {
  const lowerCaseSearchTerm = searchTerm.toLowerCase()

  return claims.filter((claim) => {
    const matchesSearch =
      claim.vehicleNumber?.toLowerCase().includes(lowerCaseSearchTerm) ||
      claim.claimNumber?.toLowerCase().includes(lowerCaseSearchTerm) ||
      claim.spartaNumber?.toLowerCase().includes(lowerCaseSearchTerm) ||
      claim.client?.toLowerCase().includes(lowerCaseSearchTerm) ||
      claim.liquidator?.toLowerCase().includes(lowerCaseSearchTerm) ||
      claim.brand?.toLowerCase().includes(lowerCaseSearchTerm)

    const matchesStatus =
      filters.statuses.length === 0 ||
      (claim.status ? filters.statuses.includes(claim.status) : false)

    const matchesClient =
      !filters.client || claim.client?.toLowerCase() === filters.client.toLowerCase()

    const matchesHandler =
      !filters.handler ||
      claim.liquidator?.toLowerCase() === filters.handler.toLowerCase()

    return matchesSearch && matchesStatus && matchesClient && matchesHandler
  })
}
