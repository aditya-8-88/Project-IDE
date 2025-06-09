import express from 'express';
const router = express.Router();

router.get('/ping', (_, res) => {
  res.send({ msg: 'pong' });
});

// Add more endpoints here: /projects, /login, etc.

export default router;
