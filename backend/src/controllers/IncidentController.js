const connection = require('../database/connection');

module.exports = {
  async index(request, response) {
    const { page = 1 } = request.query;
    const limit = 5;

    const [count] = await connection('incidents').count();

    console.log(count)

    const incidents = await connection('incidents')
      .join('ngos', 'ngos.id', '=', 'incidents.ngo_id')
      .limit(limit)
      .offset(( page - 1 ) * limit)
      .select([
        'incidents.*', 
        'ngos.name as ngo_name', 
        'ngos.email', 
        'ngos.whatsapp', 
        'ngos.city', 
        'ngos.st'
      ]);

      response.header('X-Total-Count', count['count(*)']);
      response.header('X-Limit-Offset', limit);

    return response.json(incidents);
  },
  async create(request, response) {
    const { title, description, value } = request.body;
    const ngo_id = request.headers.authorization;

    const [ id ] = await connection('incidents').insert({
      title,
      description,
      value,
      ngo_id
    })

    return response.json({ id });
  },
  async delete(request, response) {
    const { id } = request.params;
    const ngo_id = request.headers.authorization;

    const incident = await connection('incidents')
      .where('id', id)
      .select('ngo_id')
      .first();

    if(incident.ngo_id !== ngo_id) {
      return response.status(401).json({ error: 'Operation denied' })
    }

    await connection('incidents').where('id', id).delete();

    return response.status(204).send();
  }
}