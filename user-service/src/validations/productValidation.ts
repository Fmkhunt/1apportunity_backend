import Joi from 'joi';

export const productValidation = {
  createProduct: Joi.object({
    name: Joi.string()
      .required()
      .min(1)
      .max(100)
      .messages({
        'string.empty': 'Product name is required',
        'string.min': 'Product name must be at least 1 character long',
        'string.max': 'Product name cannot exceed 100 characters',
        'any.required': 'Product name is required'
      }),
    description: Joi.string()
      .optional()
      .max(1000)
      .messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
    price: Joi.number()
      .required()
      .min(0)
      .messages({
        'number.base': 'Price must be a number',
        'number.min': 'Price cannot be negative',
        'any.required': 'Product price is required'
      }),
    category: Joi.string()
      .optional()
      .max(50)
      .messages({
        'string.max': 'Category cannot exceed 50 characters'
      }),
    brand: Joi.string()
      .optional()
      .max(50)
      .messages({
        'string.max': 'Brand cannot exceed 50 characters'
      }),
    sku: Joi.string()
      .optional()
      .max(50)
      .messages({
        'string.max': 'SKU cannot exceed 50 characters'
      }),
    stock_quantity: Joi.number()
      .required()
      .min(0)
      .integer()
      .messages({
        'number.base': 'Stock quantity must be a number',
        'number.min': 'Stock quantity cannot be negative',
        'number.integer': 'Stock quantity must be an integer',
        'any.required': 'Stock quantity is required'
      }),
    images: Joi.array()
      .items(Joi.string())
      .optional()
      .messages({
        'array.base': 'Images must be an array'
      }),
    is_active: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'is_active must be a boolean'
      })
  }),

  updateProduct: Joi.object({
    name: Joi.string()
      .optional()
      .min(1)
      .max(100)
      .messages({
        'string.empty': 'Product name cannot be empty',
        'string.min': 'Product name must be at least 1 character long',
        'string.max': 'Product name cannot exceed 100 characters'
      }),
    description: Joi.string()
      .optional()
      .max(1000)
      .messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
    price: Joi.number()
      .optional()
      .min(0)
      .messages({
        'number.base': 'Price must be a number',
        'number.min': 'Price cannot be negative'
      }),
    category: Joi.string()
      .optional()
      .max(50)
      .messages({
        'string.max': 'Category cannot exceed 50 characters'
      }),
    brand: Joi.string()
      .optional()
      .max(50)
      .messages({
        'string.max': 'Brand cannot exceed 50 characters'
      }),
    sku: Joi.string()
      .optional()
      .max(50)
      .messages({
        'string.max': 'SKU cannot exceed 50 characters'
      }),
    stock_quantity: Joi.number()
      .optional()
      .min(0)
      .integer()
      .messages({
        'number.base': 'Stock quantity must be a number',
        'number.min': 'Stock quantity cannot be negative',
        'number.integer': 'Stock quantity must be an integer'
      }),
    images: Joi.array()
      .items(Joi.string())
      .optional()
      .messages({
        'array.base': 'Images must be an array'
      }),
    is_active: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'is_active must be a boolean'
      })
  }),

  updateStockQuantity: Joi.object({
    quantity: Joi.number()
      .required()
      .min(0)
      .integer()
      .messages({
        'number.base': 'Quantity must be a number',
        'number.min': 'Quantity cannot be negative',
        'number.integer': 'Quantity must be an integer',
        'any.required': 'Quantity is required'
      })
  }),

  getProducts: Joi.object({
    page: Joi.number()
      .optional()
      .min(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be at least 1'
      }),
    limit: Joi.number()
      .optional()
      .min(1)
      .max(100)
      .messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      }),
    category: Joi.string()
      .optional()
      .max(50)
      .messages({
        'string.max': 'Category cannot exceed 50 characters'
      }),
    brand: Joi.string()
      .optional()
      .max(50)
      .messages({
        'string.max': 'Brand cannot exceed 50 characters'
      }),
    search: Joi.string()
      .optional()
      .max(100)
      .messages({
        'string.max': 'Search term cannot exceed 100 characters'
      }),
    minPrice: Joi.number()
      .optional()
      .min(0)
      .messages({
        'number.base': 'Min price must be a number',
        'number.min': 'Min price cannot be negative'
      }),
    maxPrice: Joi.number()
      .optional()
      .min(0)
      .messages({
        'number.base': 'Max price must be a number',
        'number.min': 'Max price cannot be negative'
      }),
    isActive: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'isActive must be a boolean'
      })
  }),

  getProductsByCategory: Joi.object({
    page: Joi.number()
      .optional()
      .min(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be at least 1'
      }),
    limit: Joi.number()
      .optional()
      .min(1)
      .max(100)
      .messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      })
  }),

  getProductsByBrand: Joi.object({
    page: Joi.number()
      .optional()
      .min(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be at least 1'
      }),
    limit: Joi.number()
      .optional()
      .min(1)
      .max(100)
      .messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      })
  })
};