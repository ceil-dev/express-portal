import { createExpressPortal, MicroEnv, microEnv } from './index.js';

const run = async () => {
  const exposedObject = {
    // fetch: async (props: any) => {
    //   const res = await fetch(props?.url);

    //   const { url, type, ok, status, statusText, headers: headersObject } = res;

    //   const headers = Array.from<[string, unknown]>(headersObject).reduce(
    //     (res, [k, v]) => {
    //       res[k] = v;
    //       return res;
    //     },
    //     {}
    //   );

    //   return {
    //     url,
    //     type,
    //     ok,
    //     status,
    //     statusText,
    //     headers,
    //     text: await res.text(),
    //   };
    // },
    testNumb: 100499,
    testStr: `Hello world!`,
    testBool: true,
    testObj: {
      foo: 'bar',
    },
    testArr: [68, '419', { bar: 'not foo' }, undefined, true],
    testAsyncMethod: async (val: unknown) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Server: "testAsyncMethod" is called with "${val}"`);

      return `I'm async!`;
    },
    testNull: null,
    testMethod: (...args) => {
      console.log(`Server: "testMethod" is called with arg[0]: ${args[0]}`);
      return { message: 'Yaaaay!', ogPayload: args };
    },
    testFailingMethod: (val) => {
      console.log(
        `Server: "testFailingMethod" is called with "${JSON.stringify(val)}"`
      );
      throw new Error('random failure');
    },
    testUndefined: undefined,
    testPromise: new Promise((resolve) =>
      setTimeout(() => resolve('Resolved after 15000ms delay'), 15000)
    ),
  };

  let remoteEnv: MicroEnv;

  const localEnv = microEnv(
    exposedObject,
    { id: 'backend' },
    {
      set: ({ key, value, caller, obj }) => {
        caller &&
          remoteEnv &&
          (remoteEnv.face.str = `Set "${key}" to "${value}"`);
        caller && console.log('local env set:', { key, value, caller });
        return (obj[key] = value);
      },
    }
  );

  const port = 8002;

  const portal = createExpressPortal({
    port,
    path: '/portal',
    publicUrl: 'http://localhost:' + port,
    corsOptions: {
      // Consider adding CORS options, e.g:
      // origin: ['http://localhost:3000', 'https://portals.technology'], // portals.technology - to use with Portals App for Web
      optionsSuccessStatus: 200,
    },
    env: localEnv,
    middleware: {
      // debug: (args) => console.log(...args),
      guest: async ({ portal, payload }) => {
        try {
          remoteEnv = await portal('enter', payload.id); // entering guest environment

          console.log(
            'NEW GUEST:',
            payload,
            JSON.stringify(remoteEnv, null, 2)
          );
        } catch (e) {
          console.warn(e);
        }
      },
    },
  });

  portal('open');

  while (true) {
    localEnv.face.testNumb--;

    await new Promise((r) => setTimeout(r, 5000));
  }
};

run().catch((e) => console.log(e));
