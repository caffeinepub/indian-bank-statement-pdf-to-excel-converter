# Specification

## Summary
**Goal:** Add support for an optional HDFC “Reference” transaction value and surface it consistently in the Review table and Excel export.

**Planned changes:**
- Extend the transaction data model to include an optional **Reference** field (used for HDFC statements; safe when empty for other banks).
- Update the Review step transactions table to add a **Reference** column and allow inline editing with persistence in the table state.
- Update Excel (.xlsx) export to include a **Reference** column and export the currently edited values from the Review table.
- Enhance the HDFC template column mapping and extraction diagnostics to detect Reference column labels (e.g., Reference, Ref No, Reference No, UTR, Chq/Ref No) and report it when present.

**User-visible outcome:** In the Review step, users can view and edit a “Reference” value per transaction (when present/needed), and exported Excel files include the same “Reference” column and values.
