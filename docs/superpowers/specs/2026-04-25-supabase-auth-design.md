# Supabase Authentication & Flight History Design

**Date:** 2026-04-25  
**Project:** EcoRoute Flight Emissions Calculator  
**Status:** Design Phase

---

## Overview

Integrate Supabase authentication into EcoRoute to enable:
- User account creation and login via email/password
- Persistent flight history storage per user
- Guest mode: full app functionality without account (no history saved)
- Simple login modal in top-right corner
- Flight history sidebar showing past searches

---

## Requirements

- **Authentication:** Supabase Auth with email/password (no OAuth)
- **Data Storage:** Flight history in Supabase PostgreSQL DB
- **Guest Mode:** No restrictions; guests can use app but history not saved
- **UI Pattern:** Login modal (not dedicated page)
- **Login Button Placement:** Top-right corner of header
- **When Logged In:** Show email + logout button
- **Flight History:** Inlogged users can see and click past searches to reload them

---

## Database Schema

### `flights` Table

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | uuid | PK, auto-generated | Unique flight record identifier |
| `user_id` | uuid | FK → `auth.users.id`, NOT NULL | Links to authenticated user |
| `origin_city` | text | NOT NULL | City name (e.g., "Stockholm") |
| `destination_city` | text | NOT NULL | City name (e.g., "New York") |
| `cabin_class` | text | NOT NULL | One of: economy, business, first |
| `emissions_kg` | numeric | NOT NULL | Calculated CO2 emissions |
| `distance_km` | numeric | NOT NULL | Great-circle distance |
| `created_at` | timestamp | NOT NULL, default now() | When search was performed |

### RLS Policies

- **SELECT:** Users can only read their own flights
- **INSERT:** Users can only insert flights for themselves
- **DELETE:** Users can delete their own flights
- Anonymous/unauthenticated users have no access

---

## Architecture

### Context Structure

```
AuthContext
├── user: { id, email } | null
├── isLoading: boolean
├── error: string | null
├── login(email, password): Promise<void>
├── signup(email, password): Promise<void>
└── logout(): Promise<void>

FlightContext (extended)
├── ... (existing state)
├── saveFlightToHistory(flight): Promise<void>
└── flightHistory: Flight[] | null
```

### Component Tree

```
App
├── LoginModal (portal)
├── Header
│   └── AuthButton (top-right)
├── Sidebar
│   ├── CitySelector
│   ├── TravelClassSelector
│   ├── EmissionsCard
│   ├── ComparisonBar
│   └── FlightHistorySidebar (new, visible only if logged in)
└── FlightMap
```

---

## Authentication Flow

### 1. Initial Page Load
1. App checks localStorage for Supabase session token
2. If token exists and valid, AuthContext auto-restores user
3. User sees "Log Out" button + email in top-right
4. If no token, user sees "Log In" button

### 2. Sign Up
1. User clicks "Log In" button → LoginModal opens
2. User fills email + password in "Sign Up" tab
3. Form validates (email format, password strength)
4. On submit: `supabase.auth.signUp({ email, password })`
5. If success: account created, modal closes, session restored
6. If error: show error message in modal

### 3. Log In
1. User fills email + password in "Log In" tab
2. On submit: `supabase.auth.signInWithPassword({ email, password })`
3. Supabase returns session token → stored in localStorage
4. Modal closes, user state updates, header shows email + logout

### 4. Log Out
1. User clicks logout button
2. `supabase.auth.signOut()` clears session
3. AuthContext resets to null user
4. Header reverts to "Log In" button

---

## Flight History Feature

### Saving a Flight
1. User selects origin, destination, cabin class
2. App calculates emissions (existing logic)
3. If user is logged in:
   - `saveFlightToHistory()` is called
   - Flight record inserted to `flights` table via Supabase
   - UI shows confirmation (optional toast)
4. If guest mode:
   - No action taken; calculation only happens client-side

### Loading History
1. When user logs in or page loads with session:
   - Fetch user's flights from DB: `supabase.from('flights').select()`
   - Populate `flightHistory` in FlightContext
2. FlightHistorySidebar displays list:
   - Each item shows: origin → destination, cabin class, date
   - Sorted by `created_at` DESC (newest first)
   - Click to reload that flight's parameters into the current search
   - "Clear history" button to batch-delete all user flights

### UI Interactions
- History sidebar appears only when logged in
- If no flights saved, show "No flights saved yet"
- Each history item is clickable → restores origin, destination, cabin class
- Clear history asks for confirmation before deleting

---

## Component Specifications

### LoginModal
- **Trigger:** "Log In" button in top-right header
- **Layout:** Centered modal, dark overlay backdrop
- **Tabs:** "Log In" | "Sign Up"
- **Fields:**
  - Email input (type="email", required)
  - Password input (type="password", required)
  - For Sign Up: optional password strength indicator
- **Buttons:** Submit, Cancel (close modal)
- **Validation:**
  - Email: basic RFC validation
  - Password: at least 6 characters (Supabase default)
- **Error Handling:** Display error messages from Supabase inline
- **Loading State:** Disable buttons while request in flight

### FlightHistorySidebar
- **Placement:** Below ComparisonBar in main sidebar, above/at bottom
- **Visibility:** Only rendered if user is logged in
- **Header:** "Your Flight History" with count badge
- **List:** 
  - Max 10–20 items shown (scrollable if more)
  - Each item: "NYC → LHR (Economy) · Apr 25"
  - Hover effect: highlight row, show click cursor
  - Click: dispatch action to reload that flight's parameters
- **Empty State:** "No flights saved yet"
- **Actions:**
  - "Clear All History" button (with confirmation modal)

### Header Updates
- Top-right corner (before About / Affiliate buttons)
- **When logged out:**
  - Button: "Log In" → opens LoginModal on click
- **When logged in:**
  - Text: user's email
  - Button: "Log Out" → calls logout, updates UI
  - Optional: small user icon

---

## Data Flow: Complete Example

1. **User loads app (guest):** 
   - No session in localStorage
   - AuthContext.user = null
   - Header shows "Log In"
   - FlightHistorySidebar not rendered

2. **User signs up:**
   - Clicks "Log In" → LoginModal opens
   - Enters email & password, submits
   - Supabase creates account, returns session
   - Session stored in localStorage
   - AuthContext updates: user = { id, email }
   - Modal closes
   - Header shows email + "Log Out"
   - FlightHistorySidebar renders (empty)

3. **User searches flights (logged in):**
   - Selects origin, destination, cabin class
   - App calculates emissions
   - `saveFlightToHistory()` sends record to DB
   - FlightContext.flightHistory refetches from DB
   - FlightHistorySidebar updates with new entry

4. **User clicks past flight in history:**
   - Dispatches action in FlightContext
   - Origin, destination, cabin class restored
   - Emissions recalculated automatically
   - Map updates

5. **User logs out:**
   - Clicks "Log Out"
   - Session cleared from localStorage
   - AuthContext resets
   - FlightHistorySidebar disappears
   - Header reverts to "Log In"

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Sign up: email already exists | Show error: "This email is already registered" |
| Sign up: weak password | Show error: "Password must be at least 6 characters" |
| Log in: wrong credentials | Show error: "Invalid email or password" |
| Log in: network error | Show error: "Connection failed. Please try again" |
| Save flight: user deleted mid-session | Gracefully fail, show toast: "Failed to save. Please log in again" |
| Load history: network error | Show error state in sidebar, retry button |

---

## Testing Strategy

- **Unit:** Auth functions (login, signup, logout)
- **Integration:** SaveFlightToHistory with DB
- **E2E:** Full flow: signup → search → history click → logout
- **RLS:** Verify one user cannot see another's flights

---

## Rollout Plan

1. Implement AuthContext & LoginModal
2. Wire up Supabase Auth
3. Create `flights` table & RLS policies
4. Implement FlightHistorySidebar
5. Hook `saveFlightToHistory()` into existing flow
6. Test end-to-end
7. Deploy to staging, then production

---

## Notes

- Supabase Realtime not used (Approach 1 keeps it simple)
- No OAuth; email/password only per requirements
- Guest mode imposes no restrictions; users choose to create account
- No limits on flight history size per requirements
