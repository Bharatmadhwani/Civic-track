import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    changedByName: {
      type: String,
      default: 'System',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const issueSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
      minlength: [15, 'Description must be at least 15 characters'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select an issue category'],
      enum: {
        values: [
          'Roads',
          'Streetlights',
          'Garbage',
          'Water Supply',
          'Drainage',
          'Public Safety',
          'Other',
        ],
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    location: {
      address: {
        type: String,
        required: [true, 'Please specify the location or street address'],
        trim: true,
      },
      landmark: {
        type: String,
        trim: true,
        default: '',
      },
      city: {
        type: String,
        trim: true,
        default: 'Metro District',
      },
    },
    photoUrl: {
      type: String,
      default: '',
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
      index: true,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    upvoteCount: {
      type: Number,
      default: 0,
      index: true,
    },
    statusHistory: [statusHistorySchema],
    resolutionNote: {
      type: String,
      trim: true,
      default: '',
    },
    resolutionProof: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to determine if this issue is high priority based on votes/urgency
issueSchema.virtual('isCommunityPriority').get(function () {
  return this.upvoteCount >= 5 || this.urgency === 'High';
});

// Compound indexes for optimal filtering and sorting
issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ upvoteCount: -1 });
issueSchema.index({
  title: 'text',
  description: 'text',
  'location.address': 'text',
  'location.landmark': 'text',
});

const Issue = mongoose.model('Issue', issueSchema);
export default Issue;
