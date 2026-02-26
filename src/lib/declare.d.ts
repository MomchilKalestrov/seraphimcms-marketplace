declare global {
    interface IStrippedPlugin {
        name: string;
        iconUrl: string;
        downloadUrl: string;
        version: string;
    };

    interface IPlugin extends IStrippedPlugin {
        description: string;
        author: string;
    };

    interface IAuthor {
        name: string;
        verified: boolean;
        pictureUrl: string;
        plugins: string[];
    };
};

export {};