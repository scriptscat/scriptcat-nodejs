import { CronJob } from 'cron';
import { GMContext } from './gm/gm';
import { parseMetadata } from './utils';
import { Cookie, CookieJar } from 'tough-cookie';
import { configure, getLogger } from 'log4js';

export class ScriptCat {


    public Run(script: string, options?: ScriptCat.RunOptions): Promise<string> {
        const meta = parseMetadata(script);
        if (!meta) {
            throw new Error('parse metadata');
        }
        const gmContext = this.buildGmCtx(options);
        const func = this.compile(script);
        const ctx = this.compileContext(gmContext, meta);
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
        const gmContext = this.buildGmCtx(options);
        const func = this.compile(script);
        const ctx = this.compileContext(gmContext, meta);
        return this.runOnce(ctx, func);
    }

    public cookieJar(cookie: ScriptCat.ExportCookies[]): CookieJar {
        const jar = new CookieJar();
        for (let i = 0; i < cookie.length; i++) {
            const cookies = cookie[i].cookies;
            if (!cookies) {
                continue;
            }
            for (let n = 0; n < cookies.length; n++) {
                const cookie = cookies[n];
                let u = (cookie.secure ? 'https://' : 'http://');
                if (cookie.domain.startsWith('.')) {
                    cookie.domain = cookie.domain.substring(1);
                    u += 'www.' + cookie.domain;
                } else {
                    u += cookie.domain;
                }
                u += '/';
                const c = new Cookie({
                    key: cookie.name,
                    value: cookie.value,
                    expires: cookie.expirationDate ? new Date(cookie.expirationDate * 1000) : undefined,
                    maxAge: cookie.expirationDate ? undefined : 'Infinity',
                    // maxAge,extensions,creation,creationIndex,pathIsDefault,lastAccessed,sameSite
                    domain: cookie.domain,
                    path: cookie.path,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    hostOnly: cookie.hostOnly,
                });
                jar.setCookieSync(c, u);
            }
        }
        return jar;
    }

    protected buildGmCtx(options?: ScriptCat.RunOptions): GMContext {
        let jar: CookieJar | undefined;
        if (options && options.cookies) {
            jar = this.cookieJar(options.cookies);
        }
        configure({
            appenders: { console: { type: 'console' } },
            categories: { default: { appenders: ['console'], level: 'info' } }
        });
        return new GMContext(getLogger('gm'), jar);
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
    protected compileContext(gmContext: GMContext, meta: ScriptCat.Metadata): ScriptCat.RunContext {
        const ret: ScriptCat.RunContext = {};
        if (meta['grant']) {
            for (let i = 0; i < meta['grant'].length; i++) {
                const func = (<() => void>gmContext.GmFunc(meta['grant'][i])).bind(gmContext);
                if (func) {
                    ret[meta['grant'][i]] = func;
                }
            }
        }
        return ret;
    }

}
