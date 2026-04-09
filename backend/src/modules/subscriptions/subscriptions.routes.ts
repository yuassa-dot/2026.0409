import { Router } from 'express'
import SubscriptionsController from './subscriptions.controller'

const router = Router()

/**
 * Subscription endpoints
 */

// Create subscription
router.post('/', (req, res) => SubscriptionsController.create(req, res))

// Get all subscriptions
router.get('/', (req, res) => SubscriptionsController.getAll(req, res))

// Get active subscriptions
router.get('/active', (req, res) => SubscriptionsController.getActive(req, res))

// Get subscription by ID
router.get('/:id', (req, res) => SubscriptionsController.getById(req, res))

// Get subscription by email
router.get('/email/:email', (req, res) => SubscriptionsController.getByEmail(req, res))

// Get subscriptions by symbol
router.get('/symbol/:symbol', (req, res) =>
  SubscriptionsController.getBySymbol(req, res)
)

// Update subscription
router.put('/:id', (req, res) => SubscriptionsController.update(req, res))

// Delete subscription
router.delete('/:id', (req, res) => SubscriptionsController.delete(req, res))

// Enable subscription
router.patch('/:id/enable', (req, res) => SubscriptionsController.enable(req, res))

// Disable subscription
router.patch('/:id/disable', (req, res) =>
  SubscriptionsController.disable(req, res)
)

export default router
