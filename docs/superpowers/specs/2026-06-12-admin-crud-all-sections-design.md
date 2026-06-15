# Full CRUD Admin Panel - All Sections Design

**Date:** 2026-06-12  
**Status:** Approved  
**Scope:** Implement full add/edit/delete functionality for all admin sections

## Overview

Extend AdminPanel.tsx to provide complete CRUD (Create, Read, Update, Delete) operations across all 12 admin sections. Follow existing patterns from Products/Orders/Users implementation.

## Target Sections

### Data Sections (Full CRUD)
- **Categories**: name, slug
- **Coupons**: code, discount, status (active/inactive)
- **Banners**: title, image, link
- **Blog**: title, excerpt, published (yes/no)
- **Reviews**: productName, rating, status (approved/pending)
- **Inventory**: productName, stock, lowStockAlert

### Already Complete
- Products: Full CRUD ✓
- Orders: Full CRUD ✓
- Users (Customers): Full CRUD ✓

### Read-Only (Logs/Notifications)
- Messages: Read-only (can delete)
- Subscribers: Read-only
- Dashboard: Statistics only
- WhatsApp: Read-only
- Push Notify: Read-only

## Architecture

### UI Pattern (Consistent Across All)
1. **Table View**
   - Display core fields only
   - Edit icon → opens edit dialog
   - Delete icon → confirm & delete
   - Add button → opens create dialog

2. **Dialogs**
   - Same styling as ProductDialog/OrderDialog/UserDialog
   - Form fields match core fields for section
   - Cancel/Save buttons
   - Toast notifications on success/error

3. **State Management**
   - Zustand store with CRUD functions per section
   - Local state for editing/creating flags
   - Auto-refresh after mutations

### Files Modified
- `src/components/mealicious/AdminPanel.tsx` - Main component (add sections, dialogs, handlers)
- `src/lib/catalog-store.ts` - Add CRUD functions for new sections

### Data Fields Per Section

**Categories**
- name (required, string)
- slug (auto-generated from name)

**Coupons**
- code (required, string, unique)
- discount (required, number)
- status (select: active/inactive)

**Banners**
- title (required, string)
- image (url)
- link (url)

**Blog**
- title (required, string)
- excerpt (required, string)
- published (checkbox: yes/no)

**Reviews**
- productName (required, string)
- rating (required, number 1-5)
- status (select: approved/pending/rejected)

**Inventory**
- productName (required, string)
- stock (required, number)
- lowStockAlert (number, default 10)

## API Integration

Use existing pattern:
- GET `/api/admin/{section}` - fetch all
- POST `/api/admin/{section}` - create
- PATCH `/api/admin/{section}/{id}` - update
- DELETE `/api/admin/{section}/{id}` - delete

All calls use `X-Admin-Stub: admin@mealicious.com:admin123` auth header.

## UI/UX Design

- **Consistent styling**: Orange buttons, same layout as Products/Orders
- **Validation**: Required field checks before submit
- **Feedback**: Toast notifications (success/error)
- **Confirmation**: Delete requires confirmation dialog
- **Auto-refresh**: Table updates after add/edit/delete

## Testing

Manual testing checklist:
- [ ] Add new item → appears in table
- [ ] Edit item → updates in table
- [ ] Delete item → removed from table with confirmation
- [ ] All sections follow same UI pattern
- [ ] Forms show validation errors
- [ ] Toast notifications display

## Success Criteria

1. All 6 data sections have working add/edit/delete
2. UI is consistent across all sections
3. Forms use core fields only (clean, not overwhelming)
4. No breaking changes to existing functionality
5. Admin can manage all business data from panel

## Notes

- Keep implementation focused: only core fields, no advanced options
- Follow existing code patterns (no architectural changes)
- Reuse component patterns from Products/Orders/Users
- Each section gets individual dialogs (not generic component)
