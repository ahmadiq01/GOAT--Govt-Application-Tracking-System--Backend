# GOAT Backend API Documentation

## New API Endpoints

### Application Types API

#### GET /api/application-types
Retrieve all active application types.

**Response:**
```json
{
  "success": true,
  "message": "Application types retrieved successfully",
  "data": [
    {
      "_id": "...",
      "name": "Revenue matters",
      "description": "Applications related to revenue and taxation matters"
    },
    {
      "_id": "...",
      "name": "Income Certificate",
      "description": "Applications for income certificate issuance"
    }
    // ... more application types
  ]
}
```

### Officers API

#### GET /api/officers
Retrieve all active officers.

**Response:**
```json
{
  "success": true,
  "message": "Officers retrieved successfully",
  "data": [
    {
      "_id": "...",
      "name": "DC Office",
      "office": "dc office",
      "designation": "Deputy Commissioner Office"
    },
    {
      "_id": "...",
      "name": "AC Office",
      "office": "ac office",
      "designation": "Assistant Commissioner Office"
    }
    // ... more officers
  ]
}
```

## Seeding Data

### Run Individual Seeders

To seed application types only:
```bash
node utils/seedApplicationTypes.js
```

To seed officers only:
```bash
node utils/seedOfficers.js
```

### Run Combined Seeder

To seed both application types and officers:
```bash
node utils/seedAll.js
```

## Database Models

### ApplicationType Model
- `name` (String, required, unique): Name of the application type
- `description` (String): Description of the application type
- `isActive` (Boolean, default: true): Status of the application type
- `timestamps`: Created and updated timestamps

### Officer Model
- `name` (String, required): Name of the officer/office
- `office` (String, required): Office name
- `designation` (String): Designation/title
- `isActive` (Boolean, default: true): Status of the officer
- `timestamps`: Created and updated timestamps

## Seeded Data

### Application Types (15 types)
1. Revenue matters
2. Income Certificate
3. Record correction
4. Issuance of Fard
5. Demarcation
6. Registry
7. Sharja-e-Kishtwar
8. Khasra Girdwari
9. Domicile
10. Birth Certificate
11. Death Certificate
12. Driving license
13. Cleanliness
14. General Complaints
15. Others

### Officers (14 officers)
1. DC Office
2. AC Office
3. Saholat Center
4. Dispatch Branch
5. ADC (G) Bannu
6. ADC (F) Bannu
7. AC Bannu
8. AC SDW
9. AAC-I
10. AAC-II
11. AAC-III
12. AAC-IV
13. AAC-Revenue
14. Supdtt Branch 