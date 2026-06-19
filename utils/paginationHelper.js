const env = require('../config/env');

const paginationHelper = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    env.MAX_PAGE_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || env.DEFAULT_PAGE_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

module.exports = paginationHelper;