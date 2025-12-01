# Seed Data Files

This directory contains JSON data files used by database seeders.

## Files

- **cars.json** - Car brands, models, and variants data for seeding car-related tables
- **stateCitiesData.json** - Indian states and cities data with pincodes and coordinates

## Usage

These files are referenced by Sequelize seeders in the `seeders/` directory:
- `seeders/20250220000001-seed-car-brands.js`
- `seeders/20250226000001-seed-car-models.js`
- `seeders/20250303000001-seed-car-variants.js`
- `seeders/20250104000001-seed-cities.js`

## Important

**Do not delete this directory or its files.** They are required for database seeding operations.
