var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createExpressPortal, microEnv } from './index.js';
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const exposedObject = {
        testNumb: 100499,
        testStr: `Hello world!`,
        testBool: true,
        testObj: {
            foo: 'bar',
        },
        testArr: [68, '419', { bar: 'not foo' }, undefined, true],
        testAsyncMethod: (val) => __awaiter(void 0, void 0, void 0, function* () {
            yield new Promise((resolve) => setTimeout(resolve, 1000));
            console.log(`Server: "testAsyncMethod" is called with "${val}"`);
            return `I'm async!`;
        }),
        testNull: null,
        testMethod: (...args) => {
            console.log(`Server: "testMethod" is called with arg[0]: ${args[0]}`);
            return { message: 'Yaaaay!', ogPayload: args };
        },
        testFailingMethod: (val) => {
            console.log(`Server: "testFailingMethod" is called with "${JSON.stringify(val)}"`);
            throw new Error('random failure');
        },
        testUndefined: undefined,
        testPromise: new Promise((resolve) => setTimeout(() => resolve('Resolved after 15000ms delay'), 15000)),
    };
    let remoteEnv;
    const localEnv = microEnv(exposedObject, { id: 'backend' }, {
        set: ({ key, value, caller, obj }) => {
            caller &&
                remoteEnv &&
                (remoteEnv.face.str = `Set "${key}" to "${value}"`);
            caller && console.log('local env set:', { key, value, caller });
            return (obj[key] = value);
        },
    });
    const port = 8002;
    const portal = createExpressPortal({
        port,
        path: '/portal',
        publicUrl: 'http://localhost:' + port,
        corsOptions: {
            optionsSuccessStatus: 200,
        },
        env: localEnv,
        middleware: {
            guest: (_a) => __awaiter(void 0, [_a], void 0, function* ({ portal, payload }) {
                try {
                    remoteEnv = yield portal('enter', payload.id);
                    console.log('NEW GUEST:', payload, JSON.stringify(remoteEnv, null, 2));
                }
                catch (e) {
                    console.warn(e);
                }
            }),
        },
    });
    portal('open');
    while (true) {
        localEnv.face.testNumb--;
        yield new Promise((r) => setTimeout(r, 5000));
    }
});
run().catch((e) => console.log(e));
//# sourceMappingURL=example.js.map