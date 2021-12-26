import { CronJob } from 'cron';
import { GM } from './gm/gm';
import { parseMetadata } from './utils';

export class ScriptCat {


    public Run(script: string, options?: ScriptCat.RunOptions): Promise<string> {
        const meta = parseMetadata(script);
        if (!meta) {
            throw new Error('parse metadata');
        }
        const func = this.compile(script);
        const ctx = this.compileContext(meta);

        if (meta['background']) {
            return this.runOnce(ctx, func);
        }
        //TODO: 定时脚本的管理
        return new Promise(resolve => {
            if (!meta['crontab']) {
                throw new Error('not support');
            }
            const unit = meta['crontab'][0].split(' ');
            if (unit.length == 5) {
                unit.unshift('0');
            }
            new CronJob(unit.join(' '), () => {
                void this.runOnce(ctx, func);
            }, null, true);
        });
    }

    public RunOnce(script: string, options?: ScriptCat.RunOptions): Promise<string> {
        const meta = parseMetadata(script);
        if (!meta) {
            throw new Error('parse metadata');
        }
        const func = this.compile(script);
        const ctx = this.compileContext(meta);
        return this.runOnce(ctx, func);
    }

    protected runOnce(context: ScriptCat.RunContext, func: ScriptCat.RunFunc): Promise<string> {
        return new Promise((resolve, reject) => {
            const result = func.apply(context, [context]);
            if (!(result instanceof Promise)) {
                return resolve(this.resultToString(result));
            }
            void result.then(result => {
                resolve(this.resultToString(result));
            }).catch(err => {
                reject(err);
            });
        });
    }

    protected resultToString(result: any): string {
        if (typeof result == 'string') {
            return result;
        }
        return JSON.stringify(result);
    }

    protected compile(script: string): ScriptCat.RunFunc {
        const func = <ScriptCat.RunFunc>new Function('context', 'with (context) return (()=>{\n' + script + '\n})(context)');

        return func
    }

    // 编译上下文this
    protected compileContext(meta: ScriptCat.Metadata): ScriptCat.RunContext {
        const ret: ScriptCat.RunContext = {};
        if (meta['grant']) {
            for (let i = 0; i < meta['grant'].length; i++) {
                const func = GM.GmFunc(meta['grant'][i]);
                if (func) {
                    ret[meta['grant'][i]] = func;
                }
            }
        }
        return ret;
    }

}
