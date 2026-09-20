function getPagination(query = {}) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
}

function paginationMeta(total, page, limit) {
  return {
    total: Number(total),
    page,
    limit,
    pages: Math.ceil(Number(total) / limit),
  };
}

module.exports = { getPagination, paginationMeta };
