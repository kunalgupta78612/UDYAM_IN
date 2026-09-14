/**
 * Global API Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`[API Error] ${err.stack || err.message}`);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
