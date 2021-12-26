
declare namespace ScriptCat {
    interface RunOptions {
        cookie?: string
    }

    type Metadata = { [key: string]: string[] };

    interface ExecutorOptions {
        cookie?: string
    }

    type RunContext = { [key: string]: any };
    type RunFunc = (context: any) => any;
}