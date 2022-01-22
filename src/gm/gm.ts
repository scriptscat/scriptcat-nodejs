
import axios, { Axios, AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios';
import http from 'http';

export class GM {

    protected static gmFuncMap: { [key: string]: any } = {};

    public static Function() {
        return (target: any,
            propertyName: string,
            descriptor: PropertyDescriptor) => {
            GM.gmFuncMap[propertyName] = descriptor.value;
        }
    }

    public static GmFunc(name: string): any {
        return GM.gmFuncMap[name];
    }

    @GM.Function()
    public static GM_xmlhttpRequest(detail: GM_Types.XHRDetails) {
        let respType = <ResponseType>detail.responseType;
        if (detail.responseType == 'json') {
            respType = 'text';
        }
        const config: AxiosRequestConfig = {
            url: detail.url,
            method: detail.method || 'GET',
            headers: detail.headers,
            data: detail.data,
            timeout: detail.timeout,
            responseType: respType
        };
        void axios.request(config).then(resp => {
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

    @GM.Function()
    public static GM_notification(detail: GM_Types.NotificationDetails) {
        // eslint-disable-next-line prefer-rest-params
        console.log(arguments);
    }

    @GM.Function()
    public static GM_log() {
        // eslint-disable-next-line prefer-rest-params
        console.log(arguments);
    }
}

