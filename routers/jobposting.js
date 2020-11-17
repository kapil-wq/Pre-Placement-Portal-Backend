const express = require('express');
const JobPosting = require('../models/jobposting');
const { isAuthenticated } = require('../middleware/checkauthlevel');
const router = new express.Router();

router.post('/add', isAuthenticated, async (req, res) => {
  const jobPosting = new JobPosting({
    ...req.body,
    publisher: req.user._id,
  });
  try {
    await jobPosting.save();
    res.status(201).json('Data uploaded');
  } catch (e) {
    res.status(400).send();
  }
});

router.get('/retrieve', isAuthenticated, async (req, res) => {
  try {
    const { skip, limit, ...filterOptions } = req.query
    var postings = JobPosting.find({ ...filterOptions })
      .populate({
        path: 'publisher',
        select: 'firstname lastname',
      })
      .sort({ createdAt: 'desc' })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const numOfPostings = JobPosting.find({
      ...filterOptions
    }).countDocuments();  
    
    Promise.all([postings, numOfPostings]).then(response => {
      res.status(200).send({postings: response[0], numOfPostings: response[1]});
    })

  } catch (err) {
    console.log(err)
    res.status(500).send();
  }
});

router.get('/details/:id', isAuthenticated, async (req, res) => {
  try {
  const id = req.params.id;
  const jobPosting = await JobPosting.findById(id)
    .populate({
      path: 'publisher',
      select: 'firstname lastname',
    })
  if(jobPosting !== null)  
  res.status(200).json(jobPosting);
  else
  res.status(400).json('Not found')
} catch (e) {
  console.log(e)  
  res.status(400).json('Not Found');
}  
})

router.delete('/remove/:id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await JobPosting.deleteOne({ _id: id });
    
    if (result.deletedCount === 1) {      
      res.status(200).json('Deletion successful');
    } else {
      res.status(500).json('No such file exists');
    }
  } catch (err) {
    console.log(err)
    res.status(500).send();
  }
  });

module.exports = router;