import dataRequestRepository from '#repositories/dataRequestRepository.js';
import CarBrand from '#models/CarBrand.js';
import CarModel from '#models/CarModel.js';
import CarVariant from '#models/CarVariant.js';
import State from '#models/State.js';
import City from '#models/City.js';
import sequelize from '#config/database.js';

class DataRequestService {
  async createRequest(userId, requestData) {
    const { requestType, brandName, modelName, variantName, stateName, cityName, additionalDetails } = requestData;

    // Validation
    if (!requestType || !['brand', 'model', 'variant', 'state', 'city'].includes(requestType)) {
      throw new Error('Invalid request type. Must be: brand, model, variant, state, or city');
    }

    // Car data validation
    if (['brand', 'model', 'variant'].includes(requestType)) {
      if (!brandName || brandName.trim().length < 2) {
        throw new Error('Brand name is required and must be at least 2 characters');
      }

      if (requestType === 'model' && (!modelName || modelName.trim().length < 2)) {
        throw new Error('Model name is required for model requests');
      }

      if (requestType === 'variant') {
        if (!modelName || modelName.trim().length < 2) {
          throw new Error('Model name is required for variant requests');
        }
        if (!variantName || variantName.trim().length < 2) {
          throw new Error('Variant name is required for variant requests');
        }
      }
    }

    // Location validation
    if (requestType === 'state') {
      if (!stateName || stateName.trim().length < 2) {
        throw new Error('State name is required and must be at least 2 characters');
      }
    }

    if (requestType === 'city') {
      if (!stateName || stateName.trim().length < 2) {
        throw new Error('State name is required for city requests');
      }
      if (!cityName || cityName.trim().length < 2) {
        throw new Error('City name is required and must be at least 2 characters');
      }
    }

    // Check for duplicate pending request
    const duplicate = await dataRequestRepository.checkDuplicate({
      brandName: brandName?.trim(),
      modelName: modelName?.trim(),
      variantName: variantName?.trim(),
      stateName: stateName?.trim(),
      cityName: cityName?.trim(),
      requestType
    });

    if (duplicate) {
      throw new Error('A similar request is already pending review');
    }

    // Create request
    const request = await dataRequestRepository.create({
      userId,
      requestType,
      brandName: brandName?.trim() || null,
      modelName: modelName?.trim() || null,
      variantName: variantName?.trim() || null,
      stateName: stateName?.trim() || null,
      cityName: cityName?.trim() || null,
      additionalDetails: additionalDetails?.trim() || null,
      status: 'pending'
    });

    return {
      success: true,
      message: 'Data request submitted successfully',
      data: request
    };
  }

  async getUserRequests(userId, filters) {
    const result = await dataRequestRepository.findAllWithFilters({
      userId,
      ...filters
    });

    return {
      success: true,
      message: 'User requests retrieved successfully',
      data: result
    };
  }

  async getAllRequests(filters) {
    // Validate date format if provided
    if (filters.startDate && isNaN(Date.parse(filters.startDate))) {
      throw new Error('Invalid startDate format. Use ISO 8601 format (YYYY-MM-DD)');
    }
    if (filters.endDate && isNaN(Date.parse(filters.endDate))) {
      throw new Error('Invalid endDate format. Use ISO 8601 format (YYYY-MM-DD)');
    }

    const result = await dataRequestRepository.findAllWithFilters(filters);

    return {
      success: true,
      message: 'Requests retrieved successfully',
      data: result
    };
  }

  async getRequestById(requestId) {
    const request = await dataRequestRepository.findById(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    return {
      success: true,
      message: 'Request retrieved successfully',
      data: request
    };
  }

  async approveRequest(requestId, reviewerId, approvalData) {
    const { createData } = approvalData;

    if (!createData) {
      throw new Error('Creation data is required for approval');
    }

    const request = await dataRequestRepository.findById(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'pending') {
      throw new Error(`Request is already ${request.status}`);
    }

    const transaction = await sequelize.transaction();

    try {
      let createdBrandId = null;
      let createdModelId = null;
      let createdVariantId = null;
      let createdStateId = null;
      let createdCityId = null;

      // Handle car data requests
      if (request.requestType === 'brand') {
        const slug = this._generateSlug(createData.name || request.brandName);
        
        const brand = await CarBrand.create({
          name: createData.name || request.brandName,
          slug,
          nameLocal: createData.nameLocal || null,
          description: createData.description || null,
          countryOfOrigin: createData.countryOfOrigin || null,
          isActive: true,
          createdBy: reviewerId
        }, { transaction });

        createdBrandId = brand.id;

        // If model data is also provided, create model
        if (createData.model) {
          const modelSlug = this._generateSlug(`${brand.name}-${createData.model.name}`);
          
          const model = await CarModel.create({
            brandId: brand.id,
            name: createData.model.name,
            slug: modelSlug,
            launchYear: createData.model.launchYear || null,
            isActive: true,
            createdBy: reviewerId
          }, { transaction });

          createdModelId = model.id;

          // If variant data is also provided within model, create variant
          if (createData.model.variant) {
            const variantSlug = this._generateSlug(
              `${brand.name}-${model.name}-${createData.model.variant.variantName}`
            );
            
            const variant = await CarVariant.create({
              brandId: brand.id,
              modelId: model.id,
              variantName: createData.model.variant.variantName,
              slug: variantSlug,
              fullName: `${brand.name} ${model.name} ${createData.model.variant.variantName}`,
              modelYear: createData.model.variant.modelYear || null,
              bodyType: createData.model.variant.bodyType || null,
              fuelType: createData.model.variant.fuelType || null,
              transmissionType: createData.model.variant.transmissionType || null,
              seatingCapacity: createData.model.variant.seatingCapacity || null,
              isActive: true,
              createdBy: reviewerId
            }, { transaction });

            createdVariantId = variant.id;
          }
        }
      }

      if (request.requestType === 'model') {
        let brand = await CarBrand.findOne({
          where: { name: { [sequelize.Sequelize.Op.iLike]: request.brandName } }
        });

        if (!brand) {
          const brandSlug = this._generateSlug(request.brandName);
          brand = await CarBrand.create({
            name: request.brandName,
            slug: brandSlug,
            isActive: true,
            createdBy: reviewerId
          }, { transaction });
        }

        const modelSlug = this._generateSlug(`${brand.name}-${createData.name || request.modelName}`);
        
        const model = await CarModel.create({
          brandId: brand.id,
          name: createData.name || request.modelName,
          slug: modelSlug,
          launchYear: createData.launchYear || null,
          isActive: true,
          createdBy: reviewerId
        }, { transaction });

        createdModelId = model.id;
        createdBrandId = brand.id;

        // If variant data is also provided, create variant
        if (createData.variant) {
          const variantSlug = this._generateSlug(
            `${brand.name}-${model.name}-${createData.variant.variantName}`
          );
          
          const variant = await CarVariant.create({
            brandId: brand.id,
            modelId: model.id,
            variantName: createData.variant.variantName,
            slug: variantSlug,
            fullName: `${brand.name} ${model.name} ${createData.variant.variantName}`,
            modelYear: createData.variant.modelYear || null,
            bodyType: createData.variant.bodyType || null,
            fuelType: createData.variant.fuelType || null,
            transmissionType: createData.variant.transmissionType || null,
            seatingCapacity: createData.variant.seatingCapacity || null,
            isActive: true,
            createdBy: reviewerId
          }, { transaction });

          createdVariantId = variant.id;
        }
      }

      if (request.requestType === 'variant') {
        let brand = await CarBrand.findOne({
          where: { name: { [sequelize.Sequelize.Op.iLike]: request.brandName } }
        });

        if (!brand) {
          const brandSlug = this._generateSlug(request.brandName);
          brand = await CarBrand.create({
            name: request.brandName,
            slug: brandSlug,
            isActive: true,
            createdBy: reviewerId
          }, { transaction });
        }

        let model = await CarModel.findOne({
          where: {
            brandId: brand.id,
            name: { [sequelize.Sequelize.Op.iLike]: request.modelName }
          }
        });

        if (!model) {
          const modelSlug = this._generateSlug(`${brand.name}-${request.modelName}`);
          model = await CarModel.create({
            brandId: brand.id,
            name: request.modelName,
            slug: modelSlug,
            isActive: true,
            createdBy: reviewerId
          }, { transaction });
        }

        const variantSlug = this._generateSlug(
          `${brand.name}-${model.name}-${createData.variantName || request.variantName}`
        );
        
        const variant = await CarVariant.create({
          brandId: brand.id,
          modelId: model.id,
          variantName: createData.variantName || request.variantName,
          slug: variantSlug,
          fullName: `${brand.name} ${model.name} ${createData.variantName || request.variantName}`,
          modelYear: createData.modelYear || null,
          bodyType: createData.bodyType || null,
          fuelType: createData.fuelType || null,
          transmissionType: createData.transmissionType || null,
          seatingCapacity: createData.seatingCapacity || null,
          isActive: true,
          createdBy: reviewerId
        }, { transaction });

        createdVariantId = variant.id;
        createdModelId = model.id;
        createdBrandId = brand.id;
      }

      // Handle location requests
      if (request.requestType === 'state') {
        const slug = this._generateSlug(createData.name || request.stateName);
        
        const state = await State.create({
          name: createData.name || request.stateName,
          slug,
          regionSlug: createData.regionSlug || null,
          regionName: createData.regionName || null,
          isActive: true,
          createdBy: reviewerId
        }, { transaction });

        createdStateId = state.id;
      }

      if (request.requestType === 'city') {
        let state = await State.findOne({
          where: { name: { [sequelize.Sequelize.Op.iLike]: request.stateName } }
        });

        if (!state) {
          const stateSlug = this._generateSlug(request.stateName);
          state = await State.create({
            name: request.stateName,
            slug: stateSlug,
            isActive: true,
            createdBy: reviewerId
          }, { transaction });
        }

        const citySlug = this._generateSlug(createData.name || request.cityName);
        
        const city = await City.create({
          name: createData.name || request.cityName,
          slug: citySlug,
          stateId: state.id,
          stateName: state.name,
          latitude: createData.latitude || null,
          longitude: createData.longitude || null,
          isActive: true,
          createdBy: reviewerId
        }, { transaction });

        createdCityId = city.id;
        createdStateId = state.id;
      }

      // Update request status within transaction
      await dataRequestRepository.update(requestId, {
        status: 'approved',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        createdBrandId,
        createdModelId,
        createdVariantId,
        createdStateId,
        createdCityId
      }, { transaction });

      await transaction.commit();

      const updatedRequest = await dataRequestRepository.findById(requestId);

      return {
        success: true,
        message: 'Request approved and data created successfully',
        data: updatedRequest
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async rejectRequest(requestId, reviewerId, rejectionData) {
    const { rejectionReason } = rejectionData;

    if (!rejectionReason || rejectionReason.trim().length < 10) {
      throw new Error('Rejection reason is required and must be at least 10 characters');
    }

    const request = await dataRequestRepository.findById(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'pending') {
      throw new Error(`Request is already ${request.status}`);
    }

    const updatedRequest = await dataRequestRepository.update(requestId, {
      status: 'rejected',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: rejectionReason.trim()
    });

    return {
      success: true,
      message: 'Request rejected successfully',
      data: updatedRequest
    };
  }

  async updateRequest(requestId, updateData, reviewerId) {
    const request = await dataRequestRepository.findById(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'pending') {
      throw new Error(`Cannot edit request that is already ${request.status}`);
    }

    const { requestType, brandName, modelName, variantName, stateName, cityName, additionalDetails } = updateData;

    // Validation based on request type
    if (requestType && !['brand', 'model', 'variant', 'state', 'city'].includes(requestType)) {
      throw new Error('Invalid request type. Must be: brand, model, variant, state, or city');
    }

    const finalRequestType = requestType || request.requestType;

    // Car data validation
    if (['brand', 'model', 'variant'].includes(finalRequestType)) {
      const finalBrandName = brandName !== undefined ? brandName : request.brandName;
      if (!finalBrandName || finalBrandName.trim().length < 2) {
        throw new Error('Brand name is required and must be at least 2 characters');
      }

      if (finalRequestType === 'model') {
        const finalModelName = modelName !== undefined ? modelName : request.modelName;
        if (!finalModelName || finalModelName.trim().length < 2) {
          throw new Error('Model name is required for model requests');
        }
      }

      if (finalRequestType === 'variant') {
        const finalModelName = modelName !== undefined ? modelName : request.modelName;
        const finalVariantName = variantName !== undefined ? variantName : request.variantName;
        
        if (!finalModelName || finalModelName.trim().length < 2) {
          throw new Error('Model name is required for variant requests');
        }
        if (!finalVariantName || finalVariantName.trim().length < 2) {
          throw new Error('Variant name is required for variant requests');
        }
      }
    }

    // Location validation
    if (finalRequestType === 'state') {
      const finalStateName = stateName !== undefined ? stateName : request.stateName;
      if (!finalStateName || finalStateName.trim().length < 2) {
        throw new Error('State name is required and must be at least 2 characters');
      }
    }

    if (finalRequestType === 'city') {
      const finalStateName = stateName !== undefined ? stateName : request.stateName;
      const finalCityName = cityName !== undefined ? cityName : request.cityName;
      
      if (!finalStateName || finalStateName.trim().length < 2) {
        throw new Error('State name is required for city requests');
      }
      if (!finalCityName || finalCityName.trim().length < 2) {
        throw new Error('City name is required and must be at least 2 characters');
      }
    }

    // Check for duplicate pending request (excluding current request)
    const duplicateCheckData = {
      brandName: brandName !== undefined ? brandName?.trim() : request.brandName,
      modelName: modelName !== undefined ? modelName?.trim() : request.modelName,
      variantName: variantName !== undefined ? variantName?.trim() : request.variantName,
      stateName: stateName !== undefined ? stateName?.trim() : request.stateName,
      cityName: cityName !== undefined ? cityName?.trim() : request.cityName,
      requestType: finalRequestType,
      excludeId: requestId
    };

    const duplicate = await dataRequestRepository.checkDuplicate(duplicateCheckData);

    if (duplicate) {
      throw new Error('A similar request is already pending review');
    }

    // Prepare update data
    const updateFields = {};
    
    if (requestType !== undefined) updateFields.requestType = requestType;
    if (brandName !== undefined) updateFields.brandName = brandName?.trim() || null;
    if (modelName !== undefined) updateFields.modelName = modelName?.trim() || null;
    if (variantName !== undefined) updateFields.variantName = variantName?.trim() || null;
    if (stateName !== undefined) updateFields.stateName = stateName?.trim() || null;
    if (cityName !== undefined) updateFields.cityName = cityName?.trim() || null;
    if (additionalDetails !== undefined) updateFields.additionalDetails = additionalDetails?.trim() || null;

    const updatedRequest = await dataRequestRepository.update(requestId, updateFields);

    return {
      success: true,
      message: 'Request updated successfully',
      data: updatedRequest
    };
  }

  async getStatistics() {
    const stats = await dataRequestRepository.getStatistics();

    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    };
  }

  _generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export default new DataRequestService();
