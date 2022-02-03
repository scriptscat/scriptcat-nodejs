
import axios, { AxiosRequestConfig, ResponseType } from 'axios';
import { CookieJar } from 'tough-cookie';
import { Logger } from 'log4js';
export class GMContext {

    cookiejar: CookieJar
    logger: Logger;

    constructor(logger: Logger, jar?: CookieJar) {
        this.logger = logger;
        this.cookiejar = jar || new CookieJar();
    }

    protected static gmFuncMap: { [key: string]: any } = {};

    public static Function() {
        return (target: any,
            propertyName: string,
            descriptor: PropertyDescriptor) => {
            GMContext.gmFuncMap[propertyName] = descriptor.value;
        }
    }

    public GmFunc(name: string): any {
        return GMContext.gmFuncMap[name];
    }

    @GMContext.Function()
    public GM_xmlhttpRequest(detail: GM_Types.XHRDetails) {
        let respType = <ResponseType>detail.responseType;
        if (detail.responseType == 'json') {
            respType = 'text';
        }
        const config: AxiosRequestConfig = {
            url: detail.url,
            method: detail.method || 'GET',
            headers: detail.headers || {},
            data: detail.data,
            timeout: detail.timeout,
            responseType: respType,
            maxRedirects: detail.maxRedirects
        };
        // 处理cookie
        for (const key in config.headers) {
            if (key.toLowerCase() == 'cookie') {
                detail.cookie = config.headers[key];
                delete config.headers[key];
            }
        }
        if (!detail.anonymous) {
            const cookieStr = this.cookiejar.getCookieStringSync(detail.url)
            if (cookieStr) {
                config.headers!['cookie'] = cookieStr;
            }
        }
        if (detail.cookie) {
            config.headers!['cookie'] = (config.headers!['cookie'] ? (config.headers!['cookie'] + ';') : '') + detail.cookie;
        }
        void axios.request(config).then(resp => {
            // 处理set-header
            if (resp.headers['set-cookie']) {
                this.logger.debug('jar set-cookie', detail.url, resp.headers['set-cookie']);
                for (let i = 0; i < resp.headers['set-cookie'].length; i++) {
                    this.cookiejar.setCookieSync(resp.headers['set-cookie'][i], detail.url);
                }
            }
            if (detail.onload) {
                let headers = '';
                for (const key in resp.headers) {
                    if (typeof resp.headers[key] == 'string') {
                        headers += `${key}: ${resp.headers[key]}\n`;
                    } else {
                        for (let i = 0; i < resp.headers[key].length; i++) {
                            headers += `${key}: ${resp.headers[key][i]}\n`;
                        }
                    }
                }
                // 根据gm的规则去处理response,以求兼容
                let respText = undefined;
                let response = undefined;
                switch (detail.responseType) {
                    case 'json':
                        try {
                            if (typeof resp.data == 'object') {
                                response = resp.data;
                                respText = JSON.stringify(resp.data);
                            } else {
                                respText = resp.data;
                                response = resp.data;
                            }
                        } catch (e) {
                        }
                        break;
                    case undefined:
                        // 默认传文本
                        try {
                            if (typeof resp.data == 'object') {
                                respText = JSON.stringify(resp.data);
                            } else {
                                respText = resp.data;
                            }
                            response = respText
                        } catch (e) {
                        }
                        break;
                }
                const req = <{ res: { responseUrl: string } }>resp.request;
                detail.onload({
                    finalUrl: req.res.responseUrl,
                    responseHeaders: headers,
                    status: resp.status,
                    statusText: resp.statusText,
                    response: response,
                    responseText: respText,
                    responseType: detail.responseType
                });
            }
        }).catch(e => {
            detail.onerror && detail.onerror('');
        });

    }

    @GMContext.Function()
    public GM_notification(detail: GM_Types.NotificationDetails) {
        this.logger.info('GM_notification', detail);
    }

    @GMContext.Function()
    public GM_log(level: GM_Types.LoggerLevel | string, log?: string) {
        if (arguments.length == 1) {
            this.logger.info('GM_log', 'info', log);
        } else {
            this.logger.info('GM_log', level, log);
        }
    }
}

