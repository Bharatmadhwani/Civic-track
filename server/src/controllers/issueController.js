import Issue from '../models/Issue.js';

// Helper to generate readable civic issue tracking IDs
const generateIssueId = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Issue.countDocuments();
  const serial = String(count + 1).padStart(4, '0');
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  return `CT-${currentYear}-${serial}${randomSuffix}`;
};

// @desc    Create a new community issue report
// @route   POST /api/issues
// @access  Private (Citizen or Admin)
export const createIssue = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      locationAddress,
      locationLandmark,
      locationCity,
      urgency,
      photoUrl: bodyPhotoUrl,
    } = req.body;

    if (!title || !description || !category || !locationAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields: title, description, category, and location address.',
      });
    }

    // Determine photo source: uploaded file takes priority, then fallback to URL if provided
    let photoUrl = '';
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    } else if (bodyPhotoUrl && typeof bodyPhotoUrl === 'string') {
      photoUrl = bodyPhotoUrl.trim();
    }

    const issueId = await generateIssueId();

    const newIssue = await Issue.create({
      issueId,
      title: title.trim(),
      description: description.trim(),
      category,
      location: {
        address: locationAddress.trim(),
        landmark: (locationLandmark || '').trim(),
        city: (locationCity || 'Metro District').trim(),
      },
      photoUrl,
      urgency: urgency || 'Medium',
      status: 'Pending',
      creator: req.user._id,
      upvotes: [],
      upvoteCount: 0,
      statusHistory: [
        {
          status: 'Pending',
          changedBy: req.user._id,
          changedByName: req.user.name,
          note: 'Issue officially reported and submitted for community review.',
          timestamp: new Date(),
        },
      ],
    });

    const populatedIssue = await Issue.findById(newIssue._id).populate(
      'creator',
      'name email role'
    );

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully! Your community tracking ID is ' + issueId,
      issue: populatedIssue,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all community issues with search, filter, sort & pagination
// @route   GET /api/issues
// @access  Public (Optional Auth for upvote status)
export const getIssues = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      urgency,
      sort = 'newest',
      page = 1,
      limit = 12,
      myIssues,
      myUpvotes,
    } = req.query;

    const query = {};

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by Status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by Urgency
    if (urgency && urgency !== 'All') {
      query.urgency = urgency;
    }

    // Filter issues submitted by the current user
    if (myIssues === 'true' && req.user) {
      query.creator = req.user._id;
    }

    // Filter issues upvoted by the current user
    if (myUpvotes === 'true' && req.user) {
      query.upvotes = req.user._id;
    }

    // Search by title, description, or address
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'location.address': searchRegex },
        { 'location.landmark': searchRegex },
        { issueId: searchRegex },
      ];
    }

    // Sorting
    let sortQuery = { createdAt: -1 }; // default: newest
    if (sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    } else if (sort === 'upvotes') {
      sortQuery = { upvoteCount: -1, createdAt: -1 };
    } else if (sort === 'priority') {
      sortQuery = { urgency: 1, upvoteCount: -1, createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const total = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .populate('creator', 'name email role')
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Map issues to include hasUpvoted flag for current user
    const currentUserId = req.user ? req.user._id.toString() : null;
    const transformedIssues = issues.map((issue) => {
      const hasUpvoted = currentUserId
        ? issue.upvotes.some((id) => id.toString() === currentUserId)
        : false;
      return {
        ...issue,
        hasUpvoted,
        isCommunityPriority: issue.upvoteCount >= 5 || issue.urgency === 'High',
      };
    });

    res.status(200).json({
      success: true,
      count: transformedIssues.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      issues: transformedIssues,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single issue details by ID or issueId
// @route   GET /api/issues/:id
// @access  Public (Optional Auth for upvote status)
export const getIssueById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Search by ObjectId or readable issueId
    let issue;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      issue = await Issue.findById(id)
        .populate('creator', 'name email role')
        .populate('statusHistory.changedBy', 'name role')
        .lean();
    } else {
      issue = await Issue.findOne({ issueId: id })
        .populate('creator', 'name email role')
        .populate('statusHistory.changedBy', 'name role')
        .lean();
    }

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue report not found.',
      });
    }

    const currentUserId = req.user ? req.user._id.toString() : null;
    const hasUpvoted = currentUserId
      ? issue.upvotes.some((uid) => uid.toString() === currentUserId)
      : false;

    res.status(200).json({
      success: true,
      issue: {
        ...issue,
        hasUpvoted,
        isCommunityPriority: issue.upvoteCount >= 5 || issue.urgency === 'High',
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle upvote for an issue
// @route   POST /api/issues/:id/upvote
// @access  Private (Authenticated Citizens & Admins)
export const toggleUpvote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue report not found.',
      });
    }

    const alreadyUpvoted = issue.upvotes.some(
      (uid) => uid.toString() === userId.toString()
    );

    if (alreadyUpvoted) {
      // Remove upvote atomically
      await Issue.findByIdAndUpdate(id, {
        $pull: { upvotes: userId },
      });
    } else {
      // Add upvote atomically
      await Issue.findByIdAndUpdate(id, {
        $addToSet: { upvotes: userId },
      });
    }

    const updated = await Issue.findById(id);
    updated.upvoteCount = updated.upvotes.length;
    await updated.save();

    return res.status(200).json({
      success: true,
      message: alreadyUpvoted
        ? 'Upvote removed.'
        : 'Issue upvoted! Thank you for supporting community awareness.',
      hasUpvoted: !alreadyUpvoted,
      upvoteCount: updated.upvoteCount,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update issue status, add resolution notes and history (ADMIN ONLY)
// @route   PATCH /api/issues/:id/status
// @access  Private (Admin Only)
export const updateIssueStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note, resolutionNote, resolutionProof: bodyProof } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue report not found.',
      });
    }

    const previousStatus = issue.status;

    // Detect if rolling back to an earlier status
    const statusOrder = { Pending: 0, 'In Progress': 1, Resolved: 2 };
    const isRollback = statusOrder[status] < statusOrder[previousStatus];

    // If rolling back to an earlier status, require explanation note
    if (isRollback && (!note || !note.trim())) {
      return res.status(400).json({
        success: false,
        message: `Returning an issue from "${previousStatus}" to "${status}" requires an explanatory audit note.`,
      });
    }

    // Handle resolution proof upload if present
    let resolutionProof = issue.resolutionProof || '';
    if (req.file) {
      resolutionProof = `/uploads/${req.file.filename}`;
    } else if (bodyProof && typeof bodyProof === 'string') {
      resolutionProof = bodyProof.trim();
    }

    // Build status history record
    const historyEntry = {
      status,
      changedBy: req.user._id,
      changedByName: req.user.name,
      note: (
        note ||
        (isRollback
          ? `Status reopened/returned from ${previousStatus} to ${status}`
          : `Status transitioned from ${previousStatus} to ${status}`)
      ).trim(),
      timestamp: new Date(),
    };

    issue.status = status;
    issue.statusHistory.push(historyEntry);

    if (status === 'Resolved') {
      if (resolutionNote) {
        issue.resolutionNote = resolutionNote.trim();
      }
      if (resolutionProof) {
        issue.resolutionProof = resolutionProof;
      }
    }

    await issue.save();

    const updatedIssue = await Issue.findById(id)
      .populate('creator', 'name email role')
      .populate('statusHistory.changedBy', 'name role');

    res.status(200).json({
      success: true,
      message: `Issue status successfully updated to "${status}".`,
      issue: updatedIssue,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete or moderate an issue
// @route   DELETE /api/issues/:id
// @access  Private (Admin or Creator if still Pending)
export const deleteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    const isCreator = issue.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Allow deletion by admin or creator only if still pending
    if (!isAdmin && (!isCreator || issue.status !== 'Pending')) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. Only administrators or the original reporter of a pending issue can delete reports.',
      });
    }

    await Issue.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Issue successfully removed.',
    });
  } catch (err) {
    next(err);
  }
};
