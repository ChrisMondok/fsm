function makeStateful(type) {
	console.log("Making %s stateful", type.name);
	Object.defineProperties(type.prototype, {
		__states: {
			value: {},
			enumerable: false,
			writeable: false,
			configurable: false
		},
		__stateful: {
			value: true,
			configurable: false,
			writeable: false,
			enumerable: false
		},
		goToState: {
			value: function(stateName) {
				if(this.leaveState)
					this.leaveState();

				if(stateName) {
					var targetState = this.__states[stateName];
					if(targetState)
						this.__state = targetState;
					else
						throw new Error("%s can't transition to non-existent state %s", type.name, stateName);
				}
				else
					this.__state = null;

				if(this.enterState)
					this.enterState();
			},
			enumerable: false,
			configurable: false,
			writeable: false
		}
	});
}

function addState(type, name, stateDef, base) {
	if(!type.prototype.__stateful)
		makeStateful(type);

	var baseState = null;
	if(base) {
		baseState = type.prototype.__states[base];
		if(!baseState)
			throw new Error("Error defining %s's state %s. Base state %s does not exist.",
				type.name, name, base);
	}

	var state = Object.create(baseState);

	for(var key in stateDef) {
		state[key] = stateDef[key];
		makeVirtual(type, key);
	}

	type.prototype.__states[name] = state;
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
