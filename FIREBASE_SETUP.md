# AgroLink AI - Firebase Setup Guide

This document provides a complete guide to setting up your Firebase project with the correct database security rules, indexes, and configuration for both the Web and Mobile apps.

## 1. Prerequisites
- [Firebase CLI](https://firebase.google.com/docs/cli) installed (`npm install -g firebase-tools`).
- A Firebase project created in the [Firebase Console](https://console.firebase.google.com/).
- Google Analytics enabled (optional but recommended).

## 2. Initialization
Run the following command in the root of the project to log in and select your project:
```bash
firebase login
firebase use agrolink-72cdc
```

## 3. Security Rules
The project includes pre-configured security rules for Firestore and Storage.

### Firestore Rules (`firestore.rules`)
- **Profiles**: Publicly readable; writable only by the owner.
- **Products**: Publicly readable; writable by farmers and admins.
- **Orders**: Private to the buyer, the involved farmer, and admins.
- **Equipment**: Publicly readable; writable by owners and admins.

### Storage Rules (`storage.rules`)
- **Profiles/Products**: Publicly readable; writable by authenticated users.
- **KYC Docs**: Private to the user and admins.

## 4. Deployment
To deploy the security rules and hosting configuration, run:
```bash
# Deploy only rules
firebase deploy --only firestore:rules,storage:rules

# Deploy everything (including hosting)
firebase deploy
```

## 5. Firestore Indexes
If you perform complex queries (e.g., filtering products by category and price), you may need to generate indexes. The CLI will provide a link to create them if a query fails, or you can add them to `firestore.indexes.json`.

## 6. Local Development (Emulators)
You can run the Firebase suite locally for testing without affecting production data:
```bash
firebase emulators:start
```
The UI will be available at `http://localhost:4000`.

---

## 7. Seeding the Database
I have created a script to import your `farmer_products_500.csv` data into Firestore.

1. **Get Service Account Key**:
   - Go to [Firebase Console](https://console.firebase.google.com/) > Project Settings > Service accounts.
   - Click **Generate new private key**.
   - Save the file as `serviceAccountKey.json` inside the `backend/` folder.

2. **Run Import Script**:
   ```bash
   cd backend
   node import_to_firestore.js
   ```

---

### ✅ Project Status
- [x] `google-services.json` (Mobile) - **Configured**
- [x] `firebase.ts` (Web/Mobile) - **Initialized**
- [x] `firebase.json` (Manifest) - **Created**
- [x] `firestore.rules` (Security) - **Created**
- [x] `storage.rules` (Security) - **Created**
- [x] `import_to_firestore.js` (Data Setup) - **Created**
- [x] `firebase-tools` (CLI) - **Installed Globally**
