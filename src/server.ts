// adds userId to session for typescript 
declare module 'express-session' {
    interface SessionData {
        userId: string;
    }
}

import { bootstrap }  from './app.js';

export const init = (async () => {
    try {
        const { url } = await bootstrap();
        console.log(`server started at ${url}`);
    } catch (e) {
        console.error(e);
    }
})();

