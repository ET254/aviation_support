export declare const config: {
    nodeEnv: string;
    port: number;
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    corsOrigin: string;
    logging: {
        level: string;
    };
    upload: {
        maxFileSize: number;
        allowedMimeTypes: string[];
    };
    email: {
        host: string | undefined;
        port: number;
        user: string | undefined;
        pass: string | undefined;
    };
};
//# sourceMappingURL=index.d.ts.map