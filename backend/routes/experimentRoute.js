import express from 'express';
import { 
  createUserExperiment, 
  getUserExperiments,
  deleteExperiments,        
  deleteSingleExperiment    
} from '../controllers/experimentController.js';

const router = express.Router();


router.post('/', createUserExperiment);           
router.get('/:userId', getUserExperiments);       


router.delete('/', deleteExperiments);                     // DELETE /api/add-experiment (bulk delete)
router.delete('/:experimentId', deleteSingleExperiment);   // DELETE /api/add-experiment/:experimentId (single delete)

export default router;