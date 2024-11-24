var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import qrCode from 'qrcode-terminal';
import { microEnv, createServerPortal, } from '@ceil-dev/portals';
export const createExpressPortal = ({ port, path, corsOptions, env, middleware = undefined, publicUrl, }) => {
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
            const shareLink = 'https://prt.ls/' +
                Buffer.from(payload).toString('base64').replace(/=+$/, '');
            console.log(`Portals App share link:\n${shareLink}`);
            qrCode.generate(shareLink, { small: true });
        }
    });
    const extraHandlers = corsOptions ? [cors(corsOptions)] : [];
    app.post(path, ...extraHandlers, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const reply = yield portal('receive', req.body);
        res.send(reply);
    }));
    return portal;
};
export { microEnv };
//# sourceMappingURL=index.js.map