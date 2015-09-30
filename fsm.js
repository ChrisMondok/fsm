function makeStateful(type) {
	Object.defineProperties(type.prototype, {
		__states: {
			value: {},
			enumerable: false,
			writeable: false,
			configurable: false
		},
		goToState: {
			value: function(stateName) {
				this.__state = this.__states[stateName];
			},
			enumerable: false,
			configurable: false,
			writeable: false
		}
	});
}

function addState(type, stateDef) {
	var state;

	if(!('name' in stateDef))
		throw new Error("Anonymous states are not supported.");

	if('base' in stateDef)
		state = Object.create(type.prototype.__states[stateDef.base]);
	else
		state = {};

	for(var key in stateDef) {
		if(key == 'base' || key == 'name')
			continue;
		if(stateDef[key] instanceof Function) {
			state[key] = stateDef[key];
			makeVirtual(type, key);
		}
		else
			throw new Error("States must only contain functions");
	}

	type.prototype.__states[stateDef.name] = state;
}

function makeVirtual(type, functionName) {

	var original = Object.getOwnPropertyDescriptor(type.prototype, functionName);

	if(original && !original.configurable) {
		console.log("%s.%s is not configurable", type.name, functionName);
		return;
	}

	console.log("Making %s.%s virtual", type.name, functionName);

	Object.defineProperty(type.prototype, functionName, {
		configurable: false,
		enumerable: true,
		get: function() {
			if(this.__state && this.__state[functionName])
				return this.__state[functionName];
			return original && original.value || undefined;
		}
	});
}
