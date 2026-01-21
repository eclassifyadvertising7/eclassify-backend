# Property Form Field Configuration

Dynamic field visibility based on property type selection.

---

## Property Type Groups

### **Group 1: Residential** (`apartment`, `house`)

**Fields:**
- Area (sq ft) * - Required
- Carpet Area (sq ft)
- Unit Type * - Required (1rk, 1bhk, 2bhk, 3bhk, 4bhk, studio, penthouse, 1bed, 1room, custom)
- Bathrooms *
- Balconies
- Furnished Status *
- Floor Number
- Total Floors
- Property Age
- Facing Direction
- Parking Spaces

**Amenities (JSONB - Flexible):** Swimming Pool, Gym, Parking, Security, Lift, Power Backup, Garden, Playground, Club House, Intercom, Gas Pipeline, Water Supply, Maintenance Staff, Visitor Parking, CCTV, Fire Safety, Waste Disposal, Internet/Wi-Fi, Air Conditioning, Modular Kitchen

---

### **Group 2: Commercial** (`office`, `shop`)

**Fields:**
- Area (sq ft) *
- Carpet Area (sq ft)
- Washrooms
- Furnished Status *
- Floor Number
- Total Floors
- Property Age
- Facing Direction
- Parking Spaces

**Hidden:** Unit Type, Balconies

**Amenities (JSONB - Flexible):** Parking, Security, Lift, Power Backup, Intercom, CCTV, Fire Safety, Waste Disposal, Internet/Wi-Fi, Air Conditioning, Water Supply, Maintenance Staff

---

### **Group 3: Shared Living** (`pg`, `hostel`)

**Fields:**
- Area (sq ft) *
- Bathrooms *
- Furnished Status *
- Floor Number
- Total Floors
- Property Age
- Food Included (Yes/No/Optional) - **NEW**
- Gender Preference (Male/Female/Any) - **NEW**

**Hidden:** Unit Type, Balconies, Carpet Area, Facing Direction

**Amenities (JSONB - Flexible):** Wi-Fi, Power Backup, Security, Parking, Laundry, Gym, Common Kitchen, TV/Entertainment, Study Room, CCTV, Water Supply, Maintenance Staff, Visitor Parking, Intercom

---

### **Group 4: Plot** (`plot`)

**Fields:**
- Area (sq ft) *
- Plot Length (ft) - **NEW**
- Plot Width (ft) - **NEW**
- Facing Direction
- Boundary Wall (Yes/No) - **NEW**
- Corner Plot (Yes/No) - **NEW**
- Gated Community (Yes/No) - **NEW**

**Hidden:** Unit Type, Bathrooms, Balconies, Furnished, Floor Number, Total Floors, Carpet Area, Property Age, Parking Spaces

**Amenities (JSONB - Flexible):** Water Supply, Electricity, Drainage, Street Lights, Gated Security, Park/Garden Nearby, Paved Road, Corner Location

---

### **Group 5: Warehouse** (`warehouse`)

**Fields:**
- Area (sq ft) *
- Covered Area (sq ft) - **NEW**
- Open Area (sq ft) - **NEW**
- Ceiling Height (ft) - **NEW**
- Loading Docks (number) - **NEW**
- Floor Number
- Property Age
- Parking Spaces

**Hidden:** Unit Type, Bathrooms, Balconies, Furnished, Facing Direction, Carpet Area, Total Floors

**Amenities (JSONB - Flexible):** Power Backup, Security, CCTV, Fire Safety, Parking, Water Supply, Drainage, Office Space, Restroom Facilities, Loading Bay, Goods Lift

---

## New Fields Required

### **PG/Hostel:**
- `foodIncluded` - ENUM('yes', 'no', 'optional')
- `genderPreference` - ENUM('male', 'female', 'any')

### **Plot:**
- `plotLength` - INT (feet)
- `plotWidth` - INT (feet)
- `boundaryWall` - BOOLEAN
- `cornerPlot` - BOOLEAN
- `gatedCommunity` - BOOLEAN

### **Warehouse:**
- `coveredAreaSqft` - INT
- `openAreaSqft` - INT
- `ceilingHeightFt` - DECIMAL(5,2)
- `loadingDocks` - INT

---

## Existing Fields Usage

All existing fields in property_listings table will be reused where applicable:
- `areaSqft`, `carpetAreaSqft`, `unitType`, `bathrooms`, `balconies`
- `furnished`, `floorNumber`, `totalFloors`, `ageYears`, `facing`
- `parkingSpaces`, `amenities` (JSONB - Flexible, no changes needed)

**Note:** `bedrooms` column is deprecated - bedroom count is now derived from `unitType` (e.g., 2bhk = 2 bedrooms)

---

**Action Required:** Verify backend `property_listings` table has columns for new fields or add migration.
