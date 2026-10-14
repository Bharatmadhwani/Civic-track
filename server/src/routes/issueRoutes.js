import express from 'express';
import {
  createIssue,
  getIssues,
  getIssueById,
  toggleUpvote,
  updateIssueStatus,
  deleteIssue,
} from '../controllers/issueController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/authMiddleware.js';
import { upload } from '../config/upload.js';

const router = express.Router();

// Public issue feed (optionalAuth so logged-in users get hasUpvoted flag)
router.get('/', optionalAuth, getIssues);

// Get single issue
router.get('/:id', optionalAuth, getIssueById);

// Submit an issue (with optional single photo file upload)
router.post('/', protect, upload.single('photo'), createIssue);

// Upvote / remove upvote
router.post('/:id/upvote', protect, toggleUpvote);

// Update status (Admin Only, with optional resolution proof upload)
router.patch(
  '/:id/status',
  protect,
  adminOnly,
  upload.single('resolutionProof'),
  updateIssueStatus
);

// Delete / moderate issue
router.delete('/:id', protect, deleteIssue);

export default router;
