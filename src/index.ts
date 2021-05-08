import WebSocket from "ws";

enum Methods {
    Authorize
}

interface BareMessage {
    i: number;
    m: Methods;
    p: any;
}

interface ErrorMessage {
    i: number;
    e: any;
}

interface ResponseMessage {
    i: number;
    r: any;
}

export default function websocketClient(address: string) {
    const ws = new WebSocket(address);
    const events = new Map<string, (ctx) => any>();
    const responsePromises = new Map<number, any[]>();

    let responseIndex = 1;

    const reply = (p) => {
        return new Promise<void>((resolve, reject) => {
            responsePromises.set(responseIndex, [resolve, reject]);

            ws.send(JSON.stringify({
                i: 1,
                m: 0,
                p: p
            }));

            responseIndex++;

            setTimeout(() => {
                reject();
            }, 5000);
        });
    };

    ws.on('open', () => {
        if (events.has('open')) events.get('open')({
            authorize: (p) => reply(p)
        });
    });

    ws.on('message', data => {
        if (typeof data !== "string") return;

        const message: BareMessage | ResponseMessage | ErrorMessage = JSON.parse(data as any);

        if ("r" in message && responsePromises.has(message.i)) {
            responsePromises.get(message.i)[0]();
        } else if ("e" in message) {
            responsePromises.get(message.i)[1]();
        }
    });

    return {
        on(event: 'open', callback: (ctx) => any) {
            events.set(event, callback);
        }
    }
}
