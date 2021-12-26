
export function parseMetadata(code: string): ScriptCat.Metadata | null {
    let issub = false;
    let regex = /\/\/\s*==UserScript==([\s\S]+?)\/\/\s*==\/UserScript==/m;
    let header = regex.exec(code)
    if (!header) {
        regex = /\/\/\s*==UserSubscribe==([\s\S]+?)\/\/\s*==\/UserSubscribe==/m;
        header = regex.exec(code)
        if (!header) {
            return null;
        }
        issub = true
    }
    regex = /\/\/\s*@([\S]+)((.+?)$|$)/gm;
    const ret: ScriptCat.Metadata = {};
    let meta: RegExpExecArray | null;
    while (meta = regex.exec(header[1])) {
        const [key, val] = [meta[1].toLowerCase().trim(), meta[2].trim()];
        let values = ret[key];
        if (values == null) {
            values = [];
        }
        values.push(val);
        ret[key] = values;
    }
    if (ret['name'] == undefined) {
        return null;
    }
    if (issub) {
        ret['usersubscribe'] = [];
    }
    return ret;
}
