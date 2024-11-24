import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import qrCode from 'qrcode-terminal';
import {
  MicroEnv,
  microEnv,
  Middleware,
  createServerPortal,
} from '@ceil-dev/portals';

type Props = {
  port: number;
  path: string;
  corsOptions: cors.CorsOptions;
  env: MicroEnv;
  middleware?: Middleware;
  publicUrl?: string;
};

export const createExpressPortal = ({
  port,
  path,
  corsOptions,
  env,
  middleware = undefined,
  publicUrl,
}: Props) => {
  const portal = createServerPortal(env, middleware);

  const app = express();

  app.use(bodyParser.text());

  app.listen(port, () => {
    console.log(`Express portal listening on port ${port}`);

    if (publicUrl) {
      const portalLink = publicUrl + path;

      const payload = JSON.stringify([
        'portal',
        env.descriptor.id,
        'http',
        { endpoint: portalLink },
      ]);

      const shareLink =
        'https://prt.ls/' +
        Buffer.from(payload).toString('base64').replace(/=+$/, '');

      console.log(`Portals App share link:\n${shareLink}`);
      qrCode.generate(shareLink, { small: true });
    }
  });

  const extraHandlers = corsOptions ? [cors(corsOptions)] : [];

  app.post(path, ...extraHandlers, async (req, res) => {
    const reply = await portal('receive', req.body);

    res.send(reply);
  });

  return portal;
};

export { MicroEnv, microEnv };
