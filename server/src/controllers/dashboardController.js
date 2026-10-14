import Issue from '../models/Issue.js';

// @desc    Get dashboard metrics, category breakdown and real activity stream
// @route   GET /api/dashboard/stats
// @access  Public (Used on landing page, citizen dashboard, and admin dashboard)
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalIssues,
      pendingCount,
      inProgressCount,
      resolvedCount,
      highUrgencyCount,
      priorityVotesCount,
      categoryStats,
      urgencyStats,
      recentIssues,
    ] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'Pending' }),
      Issue.countDocuments({ status: 'In Progress' }),
      Issue.countDocuments({ status: 'Resolved' }),
      Issue.countDocuments({ urgency: 'High' }),
      Issue.countDocuments({ upvoteCount: { $gte: 5 } }),
      Issue.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Issue.aggregate([
        { $group: { _id: '$urgency', count: { $sum: 1 } } },
      ]),
      Issue.find()
        .populate('creator', 'name')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    // Format category distribution
    const categories = [
      'Roads',
      'Streetlights',
      'Garbage',
      'Water Supply',
      'Drainage',
      'Public Safety',
      'Other',
    ];

    const categoryMap = {};
    categoryStats.forEach((c) => {
      categoryMap[c._id] = c.count;
    });

    const formattedCategoryBreakdown = categories.map((cat) => ({
      name: cat,
      count: categoryMap[cat] || 0,
    }));

    // Calculate resolution rate percentage
    const resolutionRate =
      totalIssues > 0
        ? Math.round((resolvedCount / totalIssues) * 100)
        : 0;

    // Recent activity stream (status changes across all issues)
    const issuesWithHistory = await Issue.find({
      'statusHistory.0': { $exists: true },
    })
      .select('title issueId statusHistory category')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const activityFeed = [];
    issuesWithHistory.forEach((item) => {
      if (item.statusHistory && item.statusHistory.length > 0) {
        item.statusHistory.forEach((hist) => {
          activityFeed.push({
            id: hist._id,
            issueId: item.issueId,
            issueTitle: item.title,
            category: item.category,
            status: hist.status,
            changedByName: hist.changedByName,
            note: hist.note,
            timestamp: hist.timestamp,
          });
        });
      }
    });

    // Sort activity feed by most recent timestamp
    activityFeed.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.status(200).json({
      success: true,
      stats: {
        total: totalIssues,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        highUrgency: highUrgencyCount,
        communityPriority: priorityVotesCount,
        resolutionRate,
      },
      categoryBreakdown: formattedCategoryBreakdown,
      urgencyBreakdown: urgencyStats.map((u) => ({
        urgency: u._id,
        count: u.count,
      })),
      recentIssues,
      recentActivity: activityFeed.slice(0, 8),
    });
  } catch (err) {
    next(err);
  }
};
