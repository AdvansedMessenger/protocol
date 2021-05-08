export default function websocketClient(address: string): {
    on(event: 'open', callback: (ctx: any) => any): void;
};
