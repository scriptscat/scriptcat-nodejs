
interface IValues {
	getValue(key: string, defaultVal: any): any;
}

declare namespace ScriptCat {
	export interface RunOptions {
		cookies?: ExportCookies[];
		values?: IValues;
	}

	export interface ExportCookies extends GetAllDetails {
		cookies?: Cookie[];
	}

	// 复制自@types/chrome
	export interface GetAllDetails {
		/** Optional. Restricts the retrieved cookies to those whose domains match or are subdomains of this one.  */
		domain?: string | undefined;
		/** Optional. Filters the cookies by name.  */
		name?: string | undefined;
		/** Optional. Restricts the retrieved cookies to those that would match the given URL.  */
		url?: string | undefined;
		/** Optional. The cookie store to retrieve cookies from. If omitted, the current execution context's cookie store will be used.  */
		storeId?: string | undefined;
		/** Optional. Filters out session vs. persistent cookies.  */
		session?: boolean | undefined;
		/** Optional. Restricts the retrieved cookies to those whose path exactly matches this string.  */
		path?: string | undefined;
		/** Optional. Filters the cookies by their Secure property.  */
		secure?: boolean | undefined;
	}
	export interface Cookie {
		/** The domain of the cookie (e.g. "www.google.com", "example.com"). */
		domain: string;
		/** The name of the cookie. */
		name: string;
		/** The ID of the cookie store containing this cookie, as provided in getAllCookieStores(). */
		storeId: string;
		/** The value of the cookie. */
		value: string;
		/** True if the cookie is a session cookie, as opposed to a persistent cookie with an expiration date. */
		session: boolean;
		/** True if the cookie is a host-only cookie (i.e. a request's host must exactly match the domain of the cookie). */
		hostOnly: boolean;
		/** Optional. The expiration date of the cookie as the number of seconds since the UNIX epoch. Not provided for session cookies.  */
		expirationDate?: number | undefined;
		/** The path of the cookie. */
		path: string;
		/** True if the cookie is marked as HttpOnly (i.e. the cookie is inaccessible to client-side scripts). */
		httpOnly: boolean;
		/** True if the cookie is marked as Secure (i.e. its scope is limited to secure channels, typically HTTPS). */
		secure: boolean;
		/**
		 * The cookie's same-site status (i.e. whether the cookie is sent with cross-site requests).
		 * @since Chrome 51.
		 */
		sameSite: SameSiteStatus;
	}
	export type SameSiteStatus = 'unspecified' | 'no_restriction' | 'lax' | 'strict';

	export type Metadata = { [key: string]: string[] };

	export interface ExecutorOptions {
		cookie?: string;
	}

	export type RunContext = { [key: string]: any };
	export type RunFunc = (context: any) => any;
}
