# Future CSV/Excel Import Contract

Monthly schedule imports are intentionally out of scope for v1, but the service layer is shaped so imports can reuse the same validation and audit trail as manual operator entry.

Expected columns:

- title
- originCountry
- originPort
- destinationCountry
- destinationPort
- tradeLane
- cargoType
- containerType
- vesselName
- voyageNumber
- etd
- eta
- scheduleMonth
- validFrom
- validTo
- oceanFreight
- thc
- currency
- freeTimeNotes
- remarks
- status

Import behavior for a later version:

- Validate rows with the same DTO rules used by the API.
- Stage invalid rows for review instead of partially importing a file.
- Create audit log entries per imported or updated service.
- Default imported rows to `DRAFT` unless the operator explicitly publishes them.
