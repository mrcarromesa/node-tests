import User from '../models/User';

class UserController {
  async store(req, res) {
    const { body } = req;

    const { email } = body;

    const checkEmail = await User.findOne({ where: { email } });

    if (checkEmail) {
      return res.status(400).json({ error: 'Duplicated E-mail' });
    }

    const id = await User.create(body);

    return res.json(id);
  }
}

export default new UserController();
