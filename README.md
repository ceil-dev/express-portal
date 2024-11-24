# Express Portal
_Create Portals via Express server_

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Example](#example)
5. [License](#license)

---

## Overview

Create Portals using Express server.

---

## Installation

```bash
# Clone the repository
npm install @ceil-dev/express-portal
```

---

### Usage

```javascript
import { createExpressPortal } from '@ceil-dev/express-portal';
```

---

### Example

```typescript
import { createExpressPortal, MicroEnv, microEnv } from '@ceil-dev/express-portal';

///////////////////

const run = async () => {
  const exposedObject = {
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

  // Now you should see Portals App (http://ceil.dev/apps#portals) URL along with a QR code in the console. Open it to explore and interact with the exposed environment.
  // Also you enter this portal from another environment using Fetch Ether (`import { createFetchEther } from '@ceil-dev/portals'`)
};

run().catch((e) => console.log(e));
```

---

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
