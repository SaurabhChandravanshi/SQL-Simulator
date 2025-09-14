## Challenge Overview

A web-based SQL query simulator that accepts SQL queries, runs them (simulated), and displays results.

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