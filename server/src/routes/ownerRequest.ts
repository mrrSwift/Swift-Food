// apps/server/src/routes/ownerRequest.ts
import { Hono } from 'hono';
import * as ctrl from '../controllers/ownerRequestController';
import { protect, authorize } from '../middleware/auth';

const requestRouter = new Hono();

// Public
requestRouter.post('/', ctrl.submitRequest);

// Admin only
requestRouter.get('/', protect, authorize('admin'), ctrl.getRequests);
requestRouter.patch('/:id/accept', protect, authorize('admin'), ctrl.acceptRequest);
requestRouter.patch('/:id/decline', protect, authorize('admin'), ctrl.declineRequest);

export default requestRouter;