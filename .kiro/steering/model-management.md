# Model Management Guidelines

## Critical Rule: Always Register Models in Index

**🚨 MANDATORY: Every new Sequelize model MUST be added to `src/models/index.js` immediately after creation.**

Failure to do this will cause runtime errors like:
```
Cannot read properties of undefined (reading 'count')
Cannot read properties of undefined (reading 'findAll')
```

## Step-by-Step Process

### 1. Create Your Model File

Create your model in `src/models/YourModel.js`:

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const YourModel = sequelize.define('YourModel', {
  // ... model definition
}, {
  tableName: 'your_table',
  underscored: true,
  timestamps: true,
  paranoid: true
});

// Define associations
YourModel.associate = (models) => {
  // Define relationships here
};

export default YourModel;
```

### 2. Add to Models Index (MANDATORY)

**Immediately** add your model to `src/models/index.js`:

```javascript
// 1. Add import at the top
import YourModel from './YourModel.js';

// 2. Add to models object
const models = {
  // ... existing models
  YourModel,
  // ... rest of models
};

// 3. Add associations call
// YourModel associations
YourModel.associate(models);
```

### 3. Use Models from Index Only

**Always import models from the index, never directly:**

```javascript
// ✅ Correct - Import from index
import models from '#models/index.js';
const { YourModel, User, Listing } = models;

// ❌ Wrong - Direct import
import YourModel from '#models/YourModel.js';
```

## Model Registration Checklist

When creating a new model, ensure you complete ALL steps:

- [ ] Create model file in `src/models/`
- [ ] Add import to `src/models/index.js`
- [ ] Add model to the `models` object
- [ ] Add `YourModel.associate(models)` call
- [ ] Test that model methods work (`.count()`, `.findAll()`, etc.)

## Common Patterns

### Standard Model Structure

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const ModelName = sequelize.define('ModelName', {
  id: {
    type: DataTypes.BIGINT, // or INTEGER for small tables
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  // ... other fields
  createdBy: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'created_by'
  },
  updatedBy: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'updated_by'
  },
  deletedBy: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'deleted_by'
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at'
  }
}, {
  sequelize,
  tableName: 'table_name',
  timestamps: true,
  underscored: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

ModelName.associate = (models) => {
  // Define associations here
};

export default ModelName;
```

### Index Registration Template

```javascript
// In src/models/index.js

// 1. Import
import ModelName from './ModelName.js';

// 2. Add to models object
const models = {
  // ... existing models (alphabetical order preferred)
  ModelName,
  // ... rest of models
};

// 3. Add associations (group by feature/domain)
// ModelName associations
ModelName.associate(models);
```

## Repository/Service Usage

Always destructure models from the index:

```javascript
// In repositories
import models from '#models/index.js';
const { ModelName, User, Listing } = models;

class ModelNameRepository {
  async count() {
    return await ModelName.count(); // This will work
  }
}
```

## Troubleshooting

### Error: "Cannot read properties of undefined"

**Cause:** Model not registered in index.js
**Solution:** Add the model to `src/models/index.js` following the steps above

### Error: "Model.associate is not a function"

**Cause:** Missing `associate` method or not called in index.js
**Solution:** 
1. Add `associate` method to your model
2. Add `ModelName.associate(models)` call in index.js

### Error: Circular dependency

**Cause:** Direct model imports instead of using index
**Solution:** Always import from `#models/index.js`

## Best Practices

1. **Alphabetical Order:** Keep models in alphabetical order in the index file
2. **Group Associations:** Group association calls by feature/domain
3. **Consistent Naming:** Use PascalCase for model names
4. **Immediate Registration:** Add to index.js immediately after creating model file
5. **Test After Creation:** Always test basic operations (count, findAll) after registration

## Example: Adding UserSearch Model

```javascript
// 1. Create src/models/UserSearch.js
const UserSearch = sequelize.define('UserSearch', {
  // ... definition
});

UserSearch.associate = (models) => {
  UserSearch.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

export default UserSearch;

// 2. Update src/models/index.js
import UserSearch from './UserSearch.js';

const models = {
  // ... existing models
  UserSearch,
  // ... rest
};

// UserSearch associations
UserSearch.associate(models);

// 3. Use in repository
import models from '#models/index.js';
const { UserSearch } = models;

const count = await UserSearch.count(); // Works!
```

## Critical Reminder

**Every model file created must be registered in the index. No exceptions.**

This prevents runtime errors and ensures proper model relationships work correctly.