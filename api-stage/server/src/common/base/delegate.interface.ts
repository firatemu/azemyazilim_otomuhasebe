export interface Delegate {
    findUnique(args: any): Promise<any>;
    findFirst(args: any): Promise<any>;
    findMany(args: any): Promise<any>;
    create(args: any): Promise<any>;
    update(args: any): Promise<any>;
    delete(args: any): Promise<any>;
    count(args: any): Promise<number>;
    // Add other common methods if needed
}
