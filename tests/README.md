# Car Data Transformation Utility

This utility transforms car JSON data keys from the old format to the new snake_case format.

## Usage

1. **Place your data file:**
   ```
   tests/cars.json
   ```

2. **Run the transformation:**
   ```bash
   node tests/transform-car-keys.js
   ```

3. **Output:**
   - Transformed data will be saved to `tests/cars-transformed.json`
   - Original file remains unchanged

## Key Transformations

The script applies the following key mappings:

| Old Key | New Key |
|---------|---------|
| Ex-Showroom_Price | ex_showroom_price |
| Displacement | displacement_cc |
| Cylinders | cylinder_count |
| Valves_Per_Cylinder | valves_per_cylinder |
| Drivetrain | drivetrain_type |
| Emission_Norm | emission_standard |
| Fuel_System | fuel_injection_type |
| Height/Length/Width | height_mm/length_mm/width_mm |
| Doors | door_count |
| City_Mileage | mileage_city |
| Highway_Mileage | mileage_highway |
| ARAI_Certified_Mileage | mileage_arai |
| Gears | gear_count |
| Front_Brakes | front_brake_type |
| Rear_Brakes | rear_brake_type |
| Front_Suspension | front_suspension_type |
| Rear_Suspension | rear_suspension_type |
| Front_Tyre_&_Rim | front_tyre_size |
| Rear_Tyre_&_Rim | rear_tyre_size |
| Power | max_power |
| Torque | max_torque |
| Odometer | odometer_type |
| Speedometer | speedometer_type |
| Type | transmission_type |
| Wheelbase | wheel_base |
| Wheels_Size | wheel_size |

...and more (see script for complete mapping)

## Features

- ✅ Handles nested objects and arrays
- ✅ Preserves data structure
- ✅ Non-destructive (creates new file)
- ✅ Provides transformation statistics
- ✅ Error handling with clear messages
