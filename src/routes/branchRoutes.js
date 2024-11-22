const express = require('express');
const branchController = require('../controllers/branchController');
const { verifyToken } = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Routes for Branch CRUD
/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: API for managing branches
 */

// Create a branch (only sellers and admins can create)
/**
 * @swagger
 * /branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the branch
 *                 example: Electronics Branch
 *               description:
 *                 type: string
 *                 description: Description of the branch
 *                 example: This branch specializes in electronic products.
 *               imageUrl:
 *                 type: string
 *                 description: URL of the branch's image
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Branch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Bad request
 */
router.post(
  '/branches',
  verifyToken,
  authorizeRole('seller', 'admin'), // Only sellers and admins can create branches
  branchController.createBranch
);

// Get all branches (accessible to everyone)
/**
 * @swagger
 * /branches:
 *   get:
 *     summary: Retrieve all branches
 *     tags: [Branches]
 *     responses:
 *       200:
 *         description: List of all branches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Bad request
 */
router.get('/branches', branchController.getAllBranches);

// Get single branch by ID (accessible to everyone)
/**
 * @swagger
 * /branches/{id}:
 *   get:
 *     summary: Retrieve a branch by ID
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the branch to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Branch retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Branch not found
 */
router.get('/branches/:id', branchController.getBranchById);

// Update a branch (only sellers and admins can update)
/**
 * @swagger
 * /branches/{id}:
 *   put:
 *     summary: Update a branch by ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the branch to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the branch
 *                 example: Updated Electronics Branch
 *               description:
 *                 type: string
 *                 description: Updated description of the branch
 *                 example: Updated branch description.
 *               imageUrl:
 *                 type: string
 *                 description: Updated URL of the branch's image
 *                 example: https://example.com/updated-image.jpg
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Branch not found
 */
router.put(
  '/branches/:id',
  verifyToken,
  authorizeRole('seller', 'admin'), // Only sellers and admins can update branches
  branchController.updateBranch
);

// Delete a branch (only admins can delete)
/**
 * @swagger
 * /branches/{id}:
 *   delete:
 *     summary: Delete a branch by ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the branch to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                   example: Branch deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Branch not found
 */
router.delete(
  '/branches/:id',
  verifyToken,
  authorizeRole('seller','admin'), // Only admins can delete branches
  branchController.deleteBranch
);

module.exports = router;