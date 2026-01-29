declare module 'midtrans-client' {
    export class Snap {
        constructor(options: {
            isProduction: boolean;
            serverKey: string;
            clientKey: string;
        });
        createTransaction(parameter: any): Promise<any>;
        createTransactionToken(parameter: any): Promise<string>;
        createTransactionRedirectUrl(parameter: any): Promise<string>;
    }

    export class CoreApi {
        constructor(options: {
            isProduction: boolean;
            serverKey: string;
            clientKey: string;
        });
        transaction: {
            notification(parameter: any): Promise<any>;
        };
        charge(parameter: any): Promise<any>;
        capture(parameter: any): Promise<any>;
        itemDetails: any;
    }
}
