module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (process.env.NODE_ENV === 'dev') {
    console.error(err);
  } else {
    console.error(err.message);
    err.message = 'Internal server error';
  }
  err.status = err.status || 500;
  res.status(err.status).json(err);
};