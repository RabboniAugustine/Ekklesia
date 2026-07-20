# Church Management System - Supabase Setup

This version keeps the original Figma-generated design foundation and adds the first real module: Attendance Check-In with Supabase.

## 1. Install dependencies

```bash
npm install
```

## 2. Create a Supabase project

Create a project in Supabase, then open SQL Editor and run:

```text
supabase/schema.sql
```

After the script runs, open the `churches` table and copy the church `id`.

## 3. Create local environment file

Copy `.env.example` to `.env.local`.

```bash
cp .env.example .env.local
```

Fill it in:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CHURCH_ID=the_church_id_from_the_churches_table
```

Use the Supabase anon/public key only. Do not put service-role keys in the frontend.

## 4. Run the app

```bash
npm run dev
```

Open the app and click `Attendance` in the sidebar.

## What changed

Added:

```text
src/app/modules/attendance/Attendance.tsx
src/app/services/supabaseClient.ts
src/app/services/attendanceService.ts
src/app/services/memberService.ts
supabase/schema.sql
.env.example
```

Updated:

```text
src/app/App.tsx
package.json
```

## Current build strategy

We are not deleting every mock-data section at once. The safest path is:

1. Supabase connection
2. Attendance module
3. Members module connected to Supabase
4. Dashboard connected to real attendance/member counts
5. Events, finance, ministries, communication, and reports one by one

## Important production note

The included RLS policies are temporary starter policies for early testing. Before using real church data in production, replace them with authenticated role-based policies.
