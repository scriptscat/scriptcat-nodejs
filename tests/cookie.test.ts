import { CookieJar } from 'tough-cookie';
import { ScriptCat } from '../src/scriptcat';

const cookie = <ScriptCat.ExportCookies[]>[{
	'domain': '.bilibili.com', 'cookies':
		[
			{ 'domain': 'api.vc.bilibili.com', 'hostOnly': true, 'httpOnly': false, 'name': 'l', 'path': '/dynamic_svr/v1/dynamic_svr', 'sameSite': 'unspecified', 'secure': false, 'session': true, 'value': 'v' },
			{ 'domain': 'data.bilibili.com', 'hostOnly': true, 'httpOnly': false, 'name': 'buvid2', 'path': '/v', 'sameSite': 'unspecified', 'secure': false, 'session': false, 'value': 'v2' },
			{ 'domain': '.bilibili.com', 'hostOnly': false, 'httpOnly': false, 'name': 'buvid3', 'path': '/', 'sameSite': 'unspecified', 'secure': false, 'session': false, 'value': 'v3' },
			{ 'domain': '.bilibili.com', 'hostOnly': false, 'httpOnly': false, 'name': 'buvid4', 'path': '/', 'sameSite': 'unspecified', 'secure': true, 'session': false, 'value': 'v4' }
		]
}]


describe('Run ScriptCat', () => {
	const sc = new ScriptCat();
	const jar = sc.cookieJar(cookie);

	it('bilibili', () => {
		expect(jar.getCookiesSync('https://www.bilibili.com/aa').length).toEqual(2);
		expect(jar.getCookiesSync('http://www.bilibili.com/').length).toEqual(1);
	})

	it('data', () => {
		expect(jar.getCookieStringSync('https://data.bilibili.com/v/aa')).toEqual('buvid2=v2; buvid3=v3; buvid4=v4');
		expect(jar.getCookiesSync('http://data.bilibili.com/v/aa').length).toEqual(2);
		expect(jar.getCookiesSync('https://data.bilibili.com/').length).toEqual(2);
	})

});

