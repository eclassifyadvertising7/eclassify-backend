import locationRepository from '#repositories/locationRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class LocationService {
  async getAllStates() {
    const states = await locationRepository.getAllStates();

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: states
    };
  }

  async getCitiesByStateId(stateId) {
    if (!stateId || isNaN(stateId)) {
      throw new Error('Invalid state ID');
    }

    const state = await locationRepository.getStateById(stateId);
    if (!state) {
      throw new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    const cities = await locationRepository.getCitiesByStateId(stateId);

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: cities
    };
  }

  async getAllCities() {
    const cities = await locationRepository.getAllCities();

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: cities
    };
  }

  async getPopularCities() {
    const cities = await locationRepository.getPopularCities();

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: cities
    };
  }

  async searchCities(options = {}) {
    const { query, stateId, limit } = options;

    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }

    const cities = await locationRepository.searchCities(query.trim(), stateId, limit || 10);

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: cities
    };
  }

  async getAllStatesForAdmin(options = {}) {
    const { page = 1, limit = 50, search = '' } = options;

    const result = await locationRepository.getAllStatesForAdmin({
      page,
      limit,
      search: search.trim()
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: {
        states: result.states,
        pagination: result.pagination
      }
    };
  }

  async createState(stateData, userId) {
    const { name, slug, regionSlug, regionName, displayOrder, isActive } = stateData;

    if (!name || name.trim().length < 2) {
      throw new Error('State name must be at least 2 characters');
    }

    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existingState = await locationRepository.getStateBySlug(generatedSlug);
    if (existingState) {
      throw new Error('State with this slug already exists');
    }

    const newState = await locationRepository.createState({
      name: name.trim(),
      slug: generatedSlug,
      regionSlug: regionSlug || null,
      regionName: regionName || null,
      displayOrder: displayOrder || 0,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      createdBy: userId
    });

    return {
      success: true,
      message: 'State created successfully',
      data: newState
    };
  }

  async updateState(stateId, stateData, userId) {
    if (!stateId || isNaN(stateId)) {
      throw new Error('Invalid state ID');
    }

    const state = await locationRepository.getStateByIdForAdmin(stateId);
    if (!state) {
      throw new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    const { name, slug, regionSlug, regionName, displayOrder, isActive } = stateData;

    const updateData = {};
    if (name !== undefined) {
      if (name.trim().length < 2) {
        throw new Error('State name must be at least 2 characters');
      }
      updateData.name = name.trim();
    }

    if (slug !== undefined) {
      const existingState = await locationRepository.getStateBySlug(slug);
      if (existingState && existingState.id !== stateId) {
        throw new Error('State with this slug already exists');
      }
      updateData.slug = slug;
    }

    if (regionSlug !== undefined) updateData.regionSlug = regionSlug;
    if (regionName !== undefined) updateData.regionName = regionName;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedState = await locationRepository.updateState(stateId, updateData, userId);

    return {
      success: true,
      message: 'State updated successfully',
      data: updatedState
    };
  }

  async deleteState(stateId, userId) {
    if (!stateId || isNaN(stateId)) {
      throw new Error('Invalid state ID');
    }

    const state = await locationRepository.getStateByIdForAdmin(stateId);
    if (!state) {
      throw new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    if (state.isDeleted) {
      throw new Error('State is already deleted');
    }

    await locationRepository.deleteState(stateId, userId);

    return {
      success: true,
      message: 'State deleted successfully',
      data: null
    };
  }

  async getAllCitiesForAdmin() {
    const cities = await locationRepository.getAllCitiesForAdmin();

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: cities
    };
  }

  async getCitiesByStateForAdmin(stateId, options = {}) {
    if (!stateId || isNaN(stateId)) {
      throw new Error('Invalid state ID');
    }

    const { page = 1, limit = 50, search = '' } = options;

    const result = await locationRepository.getCitiesByStateForAdmin(stateId, {
      page,
      limit,
      search: search.trim()
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: {
        cities: result.cities,
        pagination: result.pagination
      }
    };
  }

  async createCity(cityData, userId) {
    const { name, slug, stateId, stateName, district, districtId, pincode, latitude, longitude, displayOrder, isActive, isPopular } = cityData;

    if (!name || name.trim().length < 2) {
      throw new Error('City name must be at least 2 characters');
    }

    if (!stateId || isNaN(stateId)) {
      throw new Error('Valid state ID is required');
    }

    const state = await locationRepository.getStateByIdForAdmin(stateId);
    if (!state) {
      throw new Error('State not found');
    }

    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existingCity = await locationRepository.getCityBySlug(generatedSlug);
    if (existingCity) {
      throw new Error('City with this slug already exists');
    }

    const newCity = await locationRepository.createCity({
      name: name.trim(),
      slug: generatedSlug,
      stateId,
      stateName: stateName || state.name,
      district: district || null,
      districtId: districtId || null,
      pincode: pincode || null,
      latitude: latitude || null,
      longitude: longitude || null,
      displayOrder: displayOrder || 0,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      isPopular: typeof isPopular === 'boolean' ? isPopular : false,
      createdBy: userId
    });

    return {
      success: true,
      message: 'City created successfully',
      data: newCity
    };
  }

  async updateCity(cityId, cityData, userId) {
    if (!cityId || isNaN(cityId)) {
      throw new Error('Invalid city ID');
    }

    const city = await locationRepository.getCityById(cityId);
    if (!city) {
      throw new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    const { name, slug, stateId, stateName, district, districtId, pincode, latitude, longitude, displayOrder, isActive, isPopular } = cityData;

    const updateData = {};
    
    if (name !== undefined) {
      if (name.trim().length < 2) {
        throw new Error('City name must be at least 2 characters');
      }
      updateData.name = name.trim();
    }

    if (slug !== undefined) {
      const existingCity = await locationRepository.getCityBySlug(slug);
      if (existingCity && existingCity.id !== cityId) {
        throw new Error('City with this slug already exists');
      }
      updateData.slug = slug;
    }

    if (stateId !== undefined) {
      if (isNaN(stateId)) {
        throw new Error('Valid state ID is required');
      }
      const state = await locationRepository.getStateByIdForAdmin(stateId);
      if (!state) {
        throw new Error('State not found');
      }
      updateData.stateId = stateId;
      updateData.stateName = state.name;
    }

    if (stateName !== undefined) updateData.stateName = stateName;
    if (district !== undefined) updateData.district = district;
    if (districtId !== undefined) updateData.districtId = districtId;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof isPopular === 'boolean') updateData.isPopular = isPopular;

    const updatedCity = await locationRepository.updateCity(cityId, updateData, userId);

    return {
      success: true,
      message: 'City updated successfully',
      data: updatedCity
    };
  }

  async deleteCity(cityId, userId) {
    if (!cityId || isNaN(cityId)) {
      throw new Error('Invalid city ID');
    }

    const city = await locationRepository.getCityById(cityId);
    if (!city) {
      throw new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    if (city.isDeleted) {
      throw new Error('City is already deleted');
    }

    await locationRepository.deleteCity(cityId, userId);

    return {
      success: true,
      message: 'City deleted successfully',
      data: null
    };
  }

  async toggleCityPopularity(cityId, isPopular, userId) {
    if (!cityId || isNaN(cityId)) {
      throw new Error('Invalid city ID');
    }

    if (typeof isPopular !== 'boolean') {
      throw new Error('isPopular must be a boolean value');
    }

    const updatedCity = await locationRepository.updateCityPopularity(cityId, isPopular, userId);

    if (!updatedCity) {
      throw new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    return {
      success: true,
      message: isPopular ? 'City marked as popular' : 'City unmarked as popular',
      data: {
        id: updatedCity.id,
        name: updatedCity.name,
        slug: updatedCity.slug,
        isPopular: updatedCity.isPopular
      }
    };
  }
}

export default new LocationService();
