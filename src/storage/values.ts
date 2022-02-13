
export interface ModelsValue {
	id: number;
	scriptId: number;
	storageName?: string;
	key: string;
	value: any;
	createtime: number;
}

export class ModelsValues implements IValues {
	values = new Map<string, { value: string }>();

	constructor(models: ModelsValue[]) {
		models.forEach((val) => {
			this.values.set(val.key, val);
		});
	}

	getValue(key: string, defaultVal: any): any {
		const val = this.values.get(key);
		if (val) {
			return val.value;
		}
		return defaultVal;
	}
}
