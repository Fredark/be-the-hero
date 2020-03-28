const connection = require('../database/connection');

module.exports = {
  async create(request, response) {
    const { id } = request.body;

    const ong = await connection('ngos')
      .where('id', id)
      .select('name')
      .first();

    if(!ong) {
      return response.status(400).json({ error: 'No NGO found with this id' })
    }

    return response.json(ong);
  }
}