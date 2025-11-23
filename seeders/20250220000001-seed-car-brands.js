import { Sequelize } from 'sequelize';

/**
 * Seeder for car_brands table
 * 
 * Grammar corrections applied:
 * - "dodge" → "Dodge"
 * - "force motors" → "Force Motors"
 * - "ford" → "Ford"
 * - "hummer" → "Hummer"
 * - "icml" → "ICML"
 * - "kia" → "Kia"
 * - "mazda" → "Mazda"
 * - "Mercedes Benz" → "Mercedes-Benz"
 * - "mini" → "Mini"
 * - "opel" → "Opel"
 * - "premier" → "Premier"
 * - "volvo" → "Volvo"
 * - "Vinfast" → "VinFast"
 */

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const carBrands = [
  { name: 'Ambassador', country: 'India', popular: false, order: 100 },
  { name: 'Ashok Leyland', country: 'India', popular: false, order: 101 },
  { name: 'Aston Martin', country: 'United Kingdom', popular: false, order: 102 },
  { name: 'Audi', country: 'Germany', popular: false, order: 103 },
  { name: 'BYD', country: 'China', popular: false, order: 104 },
  { name: 'Bentley', country: 'United Kingdom', popular: false, order: 105 },
  { name: 'BMW', country: 'Germany', popular: false, order: 106 },
  { name: 'Bugatti', country: 'France', popular: false, order: 107 },
  { name: 'Cadillac', country: 'USA', popular: false, order: 108 },
  { name: 'Chevrolet', country: 'USA', popular: false, order: 109 },
  { name: 'Chrysler', country: 'USA', popular: false, order: 110 },
  { name: 'Citroen', country: 'France', popular: false, order: 111 },
  { name: 'DC', country: 'India', popular: false, order: 112 },
  { name: 'Daewoo', country: 'South Korea', popular: false, order: 113 },
  { name: 'Datsun', country: 'Japan', popular: false, order: 114 },
  { name: 'Dodge', country: 'USA', popular: false, order: 115 },
  { name: 'Eicher Polaris', country: 'India', popular: false, order: 116 },
  { name: 'Ferrari', country: 'Italy', popular: false, order: 117 },
  { name: 'Fiat', country: 'Italy', popular: false, order: 118 },
  { name: 'Force Motors', country: 'India', popular: false, order: 119 },
  { name: 'Ford', country: 'USA', popular: false, order: 120 },
  { name: 'Honda', country: 'Japan', popular: true, order: 5 },
  { name: 'Hummer', country: 'USA', popular: false, order: 121 },
  { name: 'Hyundai', country: 'South Korea', popular: true, order: 1 },
  { name: 'ICML', country: 'India', popular: false, order: 122 },
  { name: 'Isuzu', country: 'Japan', popular: false, order: 123 },
  { name: 'Jaguar', country: 'United Kingdom', popular: false, order: 124 },
  { name: 'Jeep', country: 'USA', popular: false, order: 125 },
  { name: 'Kia', country: 'South Korea', popular: false, order: 126 },
  { name: 'Lamborghini', country: 'Italy', popular: false, order: 127 },
  { name: 'Land Rover', country: 'United Kingdom', popular: false, order: 128 },
  { name: 'Lexus', country: 'Japan', popular: false, order: 129 },
  { name: 'Lotus', country: 'United Kingdom', popular: false, order: 130 },
  { name: 'MG', country: 'United Kingdom', popular: false, order: 131 },
  { name: 'Mahindra', country: 'India', popular: true, order: 3 },
  { name: 'Mahindra Renault', country: 'India', popular: false, order: 132 },
  { name: 'Maruti Suzuki', country: 'India', popular: true, order: 0 },
  { name: 'Maserati', country: 'Italy', popular: false, order: 133 },
  { name: 'Maybach', country: 'Germany', popular: false, order: 134 },
  { name: 'Mazda', country: 'Japan', popular: false, order: 135 },
  { name: 'McLaren', country: 'United Kingdom', popular: false, order: 136 },
  { name: 'Mercedes-Benz', country: 'Germany', popular: false, order: 137 },
  { name: 'Mini', country: 'United Kingdom', popular: false, order: 138 },
  { name: 'Mitsubishi', country: 'Japan', popular: false, order: 139 },
  { name: 'Nissan', country: 'Japan', popular: false, order: 140 },
  { name: 'Opel', country: 'Germany', popular: false, order: 141 },
  { name: 'Porsche', country: 'Germany', popular: false, order: 142 },
  { name: 'Premier', country: 'India', popular: false, order: 143 },
  { name: 'Renault', country: 'France', popular: false, order: 144 },
  { name: 'Rolls-Royce', country: 'United Kingdom', popular: false, order: 145 },
  { name: 'Skoda', country: 'Czech Republic', popular: false, order: 146 },
  { name: 'SsangYong', country: 'South Korea', popular: false, order: 147 },
  { name: 'Tata', country: 'India', popular: true, order: 2 },
  { name: 'Tesla', country: 'USA', popular: false, order: 148 },
  { name: 'Toyota', country: 'Japan', popular: true, order: 4 },
  { name: 'VinFast', country: 'Vietnam', popular: false, order: 149 },
  { name: 'Volkswagen', country: 'Germany', popular: false, order: 150 },
  { name: 'Volvo', country: 'Sweden', popular: false, order: 151 },
  { name: 'Bajaj', country: 'India', popular: false, order: 152 }
];

export default {
  up: async (queryInterface) => {
    const brands = carBrands.map((brand) => ({
      name: brand.name,
      slug: generateSlug(brand.name),
      country_of_origin: brand.country,
      display_order: brand.order,
      is_popular: brand.popular,
      is_active: true,
      is_featured: false,
      total_models: 0,
      total_listings: 0,
      total_views: 0,
      created_by: null,
      updated_by: null,
      deleted_by: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    }));

    await queryInterface.bulkInsert('car_brands', brands);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('car_brands', null, {});
  }
};
