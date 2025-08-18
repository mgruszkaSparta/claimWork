# Vacation Module Proposal

## Overview
This document proposes a vacation module for claim handlers.

## Roles & Permissions
- **Claim handler (likwidator)** – can create vacation requests and view only their own submissions.
- **Manager (admin)** – can view and manage all vacation requests.

## User Flow
1. **Claim handler requests vacation**
   - Opens vacation module.
   - Sets `startDate` and `endDate`.
   - Chooses `substitute` and one or more `managers` from user list.
   - Clicks **Save**.
2. **Manager approval**
   - Selected managers receive high-priority notifications about the request.
   - Any manager can review pending requests in the vacation module.
   - Can **Approve** or **Reject** each request.
3. **Automatic claim reassignment**
   - Upon approval, all open claims of the claim handler are re-assigned to the selected substitute.
4. **Claims list update**
   - In the claims list, a button appears: `Show claims of {original handler}`.
   - Clicking the button shows all claims temporarily assigned to the substitute.
5. **Automatic return after vacation**
   - When the vacation `EndDate` passes, all reassigned claims automatically return to the original claim handler.

## Backend
- Add `VacationRequest` entity with fields:
- `Id`, `ClaimHandlerId`, `ManagerIds`, `SubstituteId`.
  - `StartDate`, `EndDate`, `Status` (Pending, Approved, Rejected).
- Endpoints:
  - `POST /api/vacations` – create request (handler).
  - `GET /api/vacations/pending` – manager list.
  - `PUT /api/vacations/{id}/approve`.
  - `PUT /api/vacations/{id}/reject`.
- Service logic:
  - On approval, assign open claims from handler to substitute and store original handler for tracking.
  - On `EndDate`, automatically restore claims to the original handler.

## Frontend
- Vacation form for handlers with date pickers and user selectors.
- Manager dashboard listing pending requests with approve/reject actions.
- Claims list button `Show claims of ...` when a handler is on vacation, showing claims reassigned to the substitute.

## Notifications
- Send high-priority email or in-app notification to all selected managers when a request is created.
- Optionally notify the handler and substitute upon approval or rejection.

## Data Model Diagram
```
VacationRequest
---------------
Id: Guid
ClaimHandlerId: string
SubstituteId: string
ManagerIds: List<string>
StartDate: DateTime
EndDate: DateTime
Status: enum (Pending, Approved, Rejected)
```

## Future Enhancements
- Support overlapping requests and calendar view.
- Allow handlers to see status of their requests.
- Audit trail for approvals.
<!--
settlements
8
Pobierz zaznaczone
UPLOAD

recourses
7
Pobierz zaznaczone
UPLOAD

appeals
11
Pobierz zaznaczone
UPLOAD

decisions
13
Pobierz zaznaczone
UPLOAD
-->
