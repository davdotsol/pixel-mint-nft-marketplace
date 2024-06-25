import { v4 } from 'uuid';
import { Session } from 'next-iron-session';
import { NextApiRequest, NextApiResponse } from 'next';
import { withSession, contractAddress } from './utils';

export default withSession(
  async (req: NextApiRequest & { session: Session }, res: NextApiResponse) => {
    if (req.method === 'GET') {
      const _contractAddress = await contractAddress();
      try {
        const message = { _contractAddress, id: v4() };
        req.session.set('message-session', message);
        await req.session.save();
        res.json(message);
      } catch (error) {
        res.status(422).send({ message: 'Cannot generate a message!' });
      }
    } else {
      res.status(200).json({ message: 'Invalid api route' });
    }
  }
);