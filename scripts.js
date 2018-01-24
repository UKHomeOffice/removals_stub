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
				placeholder.appendChild(createField(humanReadable, keys[j], 'text'))
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
	input.className = 'form-control'
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
		}
	}

	document.getElementById('preview').innerHTML = JSON.stringify(payload, null, 4)
	return payload
}
