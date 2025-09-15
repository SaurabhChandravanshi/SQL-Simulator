## Challenge Overview

A web-based SQL query simulator that accepts SQL queries, runs them (simulated), and displays results.

### Live Links
- **Deployed App**: https://sql-simulator-atlan.netlify.app
- **GitHub Repository**: https://github.com/SaurabhChandravanshi/SQL-Simulator
- **Walkthrough Video**: https://vimeo.com/1118689262?share=copy

## Features Implemented

### Core Requirements
- **SQL Query Input**: Textarea-based editor with syntax-friendly interface
- **Query Execution**: Simulated SQL execution with predefined results
- **Results Display**: Responsive table showing query results
- **Multiple Queries**: 3+ predefined queries with corresponding datasets
- **No Backend**: Pure frontend implementation as requested

### Advanced Features
- **Multi-tab Interface**: Create, switch, and manage multiple query tabs
- **Local Persistence**: Tabs and queries persist across browser sessions
- **Virtualized Results**: Smooth rendering of large datasets (800+ rows)
- **Real Data Integration**: Northwind CSV datasets from GitHub
- **Responsive Design**: Mobile-first approach with horizontal scrolling
- **Dark Mode**: Consistent dark theme throughout
- **Search & Discovery**: Searchable predefined query library

### Power-user Additions
- **Keyboard shortcuts**: Run (Cmd/Ctrl+Enter), New (Cmd/Ctrl+N), Close (Cmd/Ctrl+W), Clear (Cmd/Ctrl+L)
- **Column sorting**: Click headers to sort asc/desc with visual indicator
- **Column visibility (dropdown)**: Choose which columns are shown via a compact menu
- **Per-column filters**: Text filters under headers; debounced client-side filtering
- **Export CSV**: One click export of the current (visible) result set
- **Loading skeleton**: Lightweight skeleton while a query is being resolved
- **Command palette (Cmd/Ctrl+K)**: Quick actions (Run, New, Clear, Close)
- **Query history (per tab)**: Back/Forward through previous runs; snapshots are taken on Run
- **Quick aggregations**: Sum/Avg/Min/Max for numeric columns (skips identifiers like id/postal/zip)
 - **Debounced history snapshots**: Also snapshots after ~3s of idle typing (not only on Run)
 - **Saved queries**: Save current query and reopen later from the sidebar (with delete)
 - **URL state sharing**: Active tab and current query are encoded in the URL for easy sharing

## Ideation & Thought Process

### Mandatory (Must-have) features
- Query input area (simple, reliable textarea)
- Run action that produces a result set
- Results table that is readable and scrollable
- Multiple queries with corresponding datasets (predefined list)
- Ability to clear results and reset editor

### Value-add (Nice-to-have) features
- Multi-tab workflow for parallel tasks
- Local persistence of tabs/queries
- Northwind CSV integration to simulate realistic data sizes
- Virtualized table for smooth scrolling across hundreds/thousands of rows
- Searchable predefined queries library
- Mobile-responsive layout, pinned header, horizontal scroll without page overflow
- Keyboard-friendly controls and accessible labels

### Day-in-the-life (Analyst UX) assumptions
- Frequent context switching between multiple queries → tabs are essential
- Need to quickly duplicate/start new queries → prominent “New Query” in header and empty state
- Fast feedback loop → virtualized rendering and minimal UI latency
- Occasional large data tables → stable scroll performance and sticky headers
- Easy recovery after reload/crashes → local persistence

### What changed after first pass
After dogfooding the app as an analyst would, a few gaps became obvious: finding actions fast, organizing exploratory steps, and inspecting data quickly. That led to three pragmatic additions: a command palette, per-tab query history, and quick aggregations. These keep cognitive load low while staying within the brief (no backend or real SQL engine).

### Why these choices
- Textarea over heavy editors: keeps bundle small, faster TTI, brief does not require syntax/engine
- CSV over in-memory mocks: showcases realistic columns, types, and scale with zero backend
- TanStack Table + Virtual: proven, composable primitives with fine control over render cost
- Zustand: tiny, explicit store perfect for local state and persistence
- App Router + static rendering: minimal server surface and optimal initial load

## Evaluation Alignment

- **Core vs advanced planning**: must-haves implemented first (editor, run, results, multi-queries), then value-adds (tabs, persistence, virtualization, search)
- **User needs**: quick new/close tabs, persistent state, fast scrolling, readable table on small screens
- **Feature selection rationale**: prefer small, reliable primitives; avoid unnecessary complexity (no custom editors, no backend)
- **Value vs complexity**: each add-on (tabs, persistence, virtualization) directly improves daily usability with minimal cost
- **Layout planning**: header actions, sidebar discovery, tabs above editor, results below; avoids overflow via min-h-0, sticky thead, responsive min-widths
- **Anticipated actions**: new, run, clear, copy, switch tabs, search queries; each is a one-click, visible control
- **Code quality/readability**: enterprise-style `src/` modules, typed utilities, small components, clear naming
- **Load time**: static app, fonts via Next, small deps; no editor/monaco bloat, no backend calls on load
- **Snappiness**: virtualized rows, memoized columns, avoid deep state; table renders remain under frame budget
- **Fundamentals**: TypeScript, linting, accessible labels, responsive CSS, clean state transitions

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Table Logic**: @tanstack/react-table
- **Virtualization**: @tanstack/react-virtual
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **CSV Parsing**: Papa Parse
- **Data Source**: Northwind CSV datasets

## Deployment

- Hosting: Netlify
- Build command: `npm run build`
- Publish directory: handled by Netlify Next.js runtime
- Config: `netlify.toml` checked in at repo root

## Performance

- Initial load is fully static (App Router pages are prerendered)
- Large datasets are rendered with row virtualization for smooth scrolling
- Fonts are loaded via Next Font (optimized)

### How page load time was measured
- Open DevTools → Performance panel
- Record page load on a throttled network (Fast 3G) and CPU (4x slowdown)
- Capture First Contentful Paint and Time To Interactive

You can also run the built-in measurement helper used during development:
```bash
npm run build && npm start
# Then use DevTools Performance or Lighthouse to record metrics
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── QuerySidebar.tsx    # Predefined queries with search
│   ├── Tabs.tsx            # Tab management
│   ├── QueryEditor.tsx     # SQL input with toolbar
│   ├── ResultsTable.tsx    # Virtualized results table
│   └── Toolbar.tsx         # Action buttons
├── data/               # Data layer
│   └── queries.ts          # Northwind queries & CSV loader
├── store/              # State management
│   └── queryStore.ts       # Zustand store for tabs/queries
├── lib/                # Utilities
│   ├── persistence.ts      # localStorage helpers
│   ├── measure.ts          # Performance utilities
│   └── csv.ts              # CSV parsing logic
└── types/              # TypeScript definitions
    └── index.ts            # Shared types

app/
├── layout.tsx          # Root layout with dark mode
├── page.tsx            # Main application page
└── globals.css         # Global styles
```

## How to Run Locally

```bash
git clone https://github.com/SaurabhChandravanshi/SQL-Simulator.git
cd SQL-Simulator
npm install
npm run dev
```

## Using It Efficiently

- Shortcuts: Run (Cmd/Ctrl+Enter), New (Cmd/Ctrl+N), Close (Cmd/Ctrl+W), Clear (Cmd/Ctrl+L), Open palette (Cmd/Ctrl+K)
- Command palette: hit Cmd/Ctrl+K, then type or click Run/New/Clear/Close
- History: Back/Forward buttons in the editor toolbar navigate snapshots captured when you press Run
- Debounced history: If you pause typing for ~3 seconds, a snapshot is created automatically
- Columns: use the Columns dropdown to toggle visibility; filters appear under headers
- Export: use Export CSV in the results toolbar to download what you see
- URL sharing: the current tab and query sync to the URL; copy the link to share the current state
- Saved: save the current query from the sidebar and reopen it later (you can delete saved items)

## Notes for Reviewers

- No backend or query engine is used; results are simulated per brief
- Multiple predefined queries are available in the sidebar; click to open as tabs
- The editor is a simple textarea by design (no syntax validation required)
- “Clear” clears both the editor and results; “New Query” in header and empty state
- Table is mobile-friendly with horizontal scroll and header pinned via z-index
 - Aggregations are shown only for clearly numeric fields and skip identifier-like columns (id/code/postal/zip/phone/fax)
 - Query history records on Run to keep snapshots meaningful and cheap; can be extended to debounce-on-idle if preferred

## Walkthrough Video

Please see the short walkthrough video (under 3 minutes) demonstrating:
- Creating tabs, writing queries, running and clearing
- Loading Northwind data and virtualized scrolling

Link: https://vimeo.com/1118689262?share=copy

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn


## Libraries & Dependencies

### Core Libraries
- **@tanstack/react-table**: Table logic with sorting, filtering, and column management
- **@tanstack/react-virtual**: Row virtualization for smooth rendering of large datasets (800+ rows)
- **zustand**: Lightweight state management for tabs, queries, and results
- **papaparse**: CSV parsing to load Northwind datasets from GitHub
- **lucide-react**: Consistent icon set for UI actions (Run, Clear, Copy, etc.)

### Utility Libraries
- **clsx**: Conditional CSS class names for dynamic styling
- **class-variance-authority**: Type-safe component variants for consistent UI

### Package.json
```json
{
  "@tanstack/react-table": "^8.0.0",
  "@tanstack/react-virtual": "^3.0.0", 
  "zustand": "^4.0.0",
  "lucide-react": "^0.400.0",
  "papaparse": "^5.4.0",
  "clsx": "^2.0.0",
  "class-variance-authority": "^0.7.0"
}
```