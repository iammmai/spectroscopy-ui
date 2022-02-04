declare module '@pseuco/ccs-interpreter' {
    const parser: {
        parse: (program: string) => {
            system: unknown;
            warnings: unknown[];
        };
    };
}
