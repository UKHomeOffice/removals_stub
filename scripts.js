window.onload = function () {
	getJSON('events.json', function (err, data) {
		console.log(data)
		const events = Object.keys(data.events)
		const eventDropdown = document.getElementById('event-type')
		console.log('aaa', events)
		for (var i = 0; i < events.length; i++) {
			console.log('bbb')
			var select = document.createElement('option')
			select.className = 'form-control'
			select.innerHTML = events[i]
			eventDropdown.appendChild(select)
		}
		document.getElementById('event-type').addEventListener('change', function (e) {
			var currEvent = e.target.value
			var placeholder = document.getElementById('keys')

			placeholder.innerHTML = '' // wipe previous for now

			var keys = data.events[currEvent]
			for (var j = 0; j < keys.length; j++) {
				var humanReadable = keys[j].replace('_', ' ')
				humanReadable = humanReadable.replace('cid', 'CID')
				humanReadable = humanReadable.replace('id', 'identifier')
				humanReadable = humanReadable.charAt(0).toUpperCase() + humanReadable.slice(1)
				var fieldType = 'text'
				if (keys[j] === 'timestamp') fieldType = 'datetime-local'
				placeholder.appendChild(createField(humanReadable, keys[j], fieldType))
			}
			updatePreview()
		})
	})
}

var getJSON = function(url, callback) {
	// https://stackoverflow.com/a/35970894/1875784
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
}


var createField = function (caption, id, type) {
	var div = document.createElement('div')
	div.className = 'form-group'

	var label = document.createElement('label')
	label.setAttribute('for', id)
	label.className = 'form-label'
	label.innerHTML = caption
	div.appendChild(label)

	var input = document.createElement('input')
	input.setAttribute('type', type ? type : 'text')
	input.id = id
	input.className = 'form-control form-control-3-4'
	input.addEventListener('keyup', updatePreview)
	div.appendChild(input)


	return div
}

var updatePreview = function () {
	var payload = {}
	payload.operation = document.getElementById('event-type').value
	var inputs = document.getElementsByTagName('input')
	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].value !== '') {
			payload[inputs[i].id] = inputs[i].value

			// force UTC:
			if (inputs[i].type === 'datetime-local') {
				payload[inputs[i].id] = payload[inputs[i].id] + ':00Z'
			}

		}
	}

	document.getElementById('preview').innerHTML = JSON.stringify(payload, null, 4)
	document.getElementById('preview').className = 'code'

	var schemaErrors = getSchemaErrors(payload, function (errors) {
		var errorBox = document.getElementById('errors')
		if (errors) {
			document.getElementById('preview').className += ' error'
			var errorsArray = []
			for (var j = 0; j < errors.length; j++) {
				errorsArray.push(JSON.stringify(errors[i]))
				var msg = errors[i].message
				msg = msg.replace(errors[i].keyword, '<strong>' + errors[i].keyword + '</strong>')
				if (!errorsArray.includes(msg)) {
					errorsArray.push(msg)
				}
			}
			errorBox.innerHTML = '<p><h2 class="heading-small">Schema validation problems</h2><ul class="error"><li>' + errorsArray.join('</li><li>') + '</ul></details></p>'
		} else {
			errorBox.innerHTML = ''
		}
	})
	return payload
}

var getSchemaErrors = function (data, cb) {
	getJSON('https://raw.githubusercontent.com/UKHomeOffice/removals_schema/master/event.json', function (e, jsonSchema) {
		var ajv = new Ajv()
		var isValid = ajv.validate(jsonSchema, data)
		if (!isValid) {
			return cb(ajv.errors)
		}
		return cb(isValid)
	})
}
