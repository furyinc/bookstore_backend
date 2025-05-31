// const mongoose = require('mongoose');
// const validator = require('validator');

// const bookSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true,
//     maxlength: [120, 'Title cannot exceed 120 characters'],
//     index: true
//   },
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     trim: true,
//     minlength: [30, 'Description should be at least 30 characters']
//   },
//   price: {
//     type: Number,
//     required: true,
//     min: [0, 'Price cannot be negative'],
//     set: v => parseFloat(v.toFixed(2))
//   },
//   stock: {
//     type: Number,
//     min: [0, 'Stock cannot be negative'],
//     default: 0
//   },
//   images: [{
//     url: {
//       type: String,
//       validate: {
//         validator: v => validator.isURL(v, { protocols: ['http','https'] }),
//         message: 'Invalid image URL'
//       }
//     },
//     publicId: {
//       type: String,
//       index: true
//     },
//     isPrimary: {
//       type: Boolean,
//       default: false
//     }
//   }],
//   imageUrl: { 
//     type: String,
//     default: '',
//     validate: {
//       validator: function(v) {
//         return v === '' || validator.isURL(v);
//       },
//       message: 'Invalid fallback image URL'
//     }
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Auto-update timestamps
// bookSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// // Text index for search
// bookSchema.index({
//   title: 'text',
//   description: 'text'
// });

// module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);






const mongoose = require('mongoose');
const validator = require('validator');

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    validate: {
      validator: v => validator.isURL(v, { protocols: ['http', 'https'], require_protocol: true }),
      message: 'Invalid image URL'
    },
    required: [true, 'Image URL is required']
  },
  publicId: {
    type: String,
    index: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [30, 'Description should be at least 30 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    set: v => (typeof v === 'number' ? parseFloat(v.toFixed(2)) : v)
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  // images: {
  //   type: [imageSchema],
  //   default: []
  // },
  // imageUrl: {
  //   type: String,
  //   default: '',
  //   validate: {
  //     validator: v => v === '' || validator.isURL(v, { protocols: ['http', 'https'], require_protocol: true }),
  //     message: 'Invalid fallback image URL'
  //   }
  // },

  images: [{
    url: {
      type: String,
      validate: {
        validator: function(v) {
          // Allow both http(s) URLs and relative paths
          return validator.isURL(v, { 
            protocols: ['http','https'],
            require_protocol: false, // ← This is key
            allow_underscores: true
          }) || v.startsWith('/'); // Allow relative paths
        },
        message: 'Invalid image URL - must be http(s) or start with /'
      }
    },
    // ... rest of image schema
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update updatedAt before save
bookSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Full-text index for search
bookSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);
