# Powerhouse Banking MVP - Next Build

A React + Vite mock banking app for SEND learners aged 16–19. This build is a teaching-ready frontend MVP using local demo data saved in browser storage.

## Demo logins
- Student: `student@powerhouse.local`
- Teacher: `teacher@powerhouse.local`
- Password: `1234`

## What is working in this build
- Role-based login for student and teacher demo accounts
- Student dashboard, transactions, direct debits, notifications, report-payment page, and transaction detail page
- Teacher dashboard, students list, student detail, transactions manager, and fraud reports pages
- Teacher can add students, transactions, and direct debits
- Teacher can update student details
- Student reports now save and appear on the teacher fraud reports page
- Teacher can move reports through **Reviewing**, **Teaching scenario**, **Teaching scenario complete**, or **Resolved**
- Students can open a single transaction and report it directly from that detail page
- Student list now includes search by name or class group
- Demo data persists in the browser using `localStorage`
- Teacher dashboard includes a **Reset demo data** button

## How to run
```bash
npm install
npm run dev
```

## Current build status
This project is now beyond a static mock-up. It is a working classroom MVP with a fake data layer.

### Build reached in this zip
- Step 1: app shell, auth, protected routes, role routes
- Step 2: full page set for student and teacher journeys
- Step 3A: teacher controls and suspicious payment workflow using local browser storage
- Step 3B: central bank service, transaction detail flow, searchable student list, expanded report-status workflow

## Clear strategy for the next build
To avoid messy rebuilds, the next stages should happen in this order:

### Stage 4A - finish the mock system before Firebase
- Add edit and delete actions for transactions and direct debits
- Add teacher-side filters on reports and transactions
- Add a statement-style printable student account page
- Add clearer student confirmation banners and help prompts
- Add a simple account summary timeline for recent activity

### Stage 4B - prepare Firebase integration
- Add `firebase/` config folder and environment setup
- Replace localStorage service calls with Firestore-backed service functions
- Add real role-based auth records
- Add security-rule plan and collection structure

### Stage 5 - production wiring
- Firebase Auth
- Firestore persistence
- teacher-managed password reset approach
- audit log collection
- deployment configuration

## Accuracy notes
This version is intentionally still a simulation. No real banking features are connected. The structure is now stable enough that future work should mainly be patch edits rather than another full rebuild.
