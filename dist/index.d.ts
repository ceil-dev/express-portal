import cors from 'cors';
import { MicroEnv, microEnv, Middleware } from '@ceil-dev/portals';
type Props = {
    port: number;
    path: string;
    corsOptions: cors.CorsOptions;
    env: MicroEnv;
    middleware?: Middleware;
    publicUrl?: string;
};
export declare const createExpressPortal: ({ port, path, corsOptions, env, middleware, publicUrl, }: Props) => import("@ceil-dev/portals").PortalMethod;
export { MicroEnv, microEnv };
