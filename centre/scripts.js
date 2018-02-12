window.onload = function () {
  document.getElementById('send-to-dev').addEventListener('click', function (e) {
    e.target.disabled = true
    submitPayloadAsFormData('https://api-ircbd-dev.notprod.homeoffice.gov.uk/centres', updatePreview(), function (statusCode) {
      e.target.disabled = false
      var response = document.getElementById('dev-response')
      if (statusCode > 399) {
        response.innerHTML = 'We received a <a href="https://tools.ietf.org/html/rfc7231">status code</a> of ' + statusCode + '.'
        response.className = ' error-summary'
      } else if (statusCode === 0) {
        response.innerHTML = 'Looks like your cross-origin request got blocked by your browser.'
        response.className = ' error-summary'
      } else {
        response.innerHTML = statusCode
        response.className = 'valid'
      }
    })
  })
  document.getElementById('send-to-int').addEventListener('click', function (e) {
    e.target.disabled = true
    submitPayloadAsFormData('https://api-ircbd-int.notprod.homeoffice.gov.uk/centres', updatePreview(), function (statusCode) {
      e.target.disabled = false
      var response = document.getElementById('dev-response')
      if (statusCode > 399) {
        response.innerHTML = 'We received a <a href="https://tools.ietf.org/html/rfc7231">status code</a> of ' + statusCode + '.'
        response.className = ' error-summary'
      } else if (statusCode === 0) {
        response.innerHTML = 'Looks like your cross-origin request got blocked by your browser.'
        response.className = ' error-summary'
      } else {
        response.innerHTML = statusCode
        response.className = 'valid'
      }
    })
  })
  document.getElementById('send-to-uat').addEventListener('click', function (e) {
    e.target.disabled = true
    submitPayloadAsFormData('https://api-ircbd-uat.notprod.homeoffice.gov.uk/centres', updatePreview(), function (statusCode) {
      e.target.disabled = false
      var response = document.getElementById('dev-response')
      if (statusCode > 399) {
        response.innerHTML = 'We received a <a href="https://tools.ietf.org/html/rfc7231">status code</a> of ' + statusCode + '.'
        response.className = ' error-summary'
      } else if (statusCode === 0) {
        response.innerHTML = 'Looks like your cross-origin request got blocked by your browser.'
        response.className = ' error-summary'
      } else {
        response.innerHTML = statusCode
        response.className = 'valid'
      }
    })
  })
  getJSON('centre.json', function (err, data) {
    if (err) return console.error('Cannot get centre data!')
    const centre = data.centre

    var placeholder = document.getElementById('keys')
    placeholder.innerHTML = '' // wipe previous for now

    for (var j = 0; j < centre.length; j++) {
      var humanReadable = centre[j].replace(/_/gi, ' ')
      humanReadable = humanReadable.replace('cid', 'CID')
      humanReadable = humanReadable.charAt(0).toUpperCase() + humanReadable.slice(1)
      var fieldType = 'text'
      if (data.fields[centre[j]]) {
        fieldType = data.fields[centre[j]]
      }
      placeholder.appendChild(createField(humanReadable, centre[j], fieldType))
    }
    updatePreview()
  })
}

var getJSON = function (url, callback) {
  // https://stackoverflow.com/a/35970894/1875784
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'json'
  xhr.onload = function () {
    var status = xhr.status
    if (status === 200) {
      callback(null, xhr.response)
    } else {
      callback(status, xhr.response)
    }
  }
  xhr.send()
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
  input.setAttribute('type', type || 'text')
  if (type === 'number') input.setAttribute('step', 1)
  if (type === 'array') {
    var span = document.createElement('span')
    span.className = 'form-hint'
    span.innerHTML = '(This field has limited functionality)'
    label.appendChild(span)
  }
  input.id = id
  input.className = 'form-control form-control-3-4'
  input.addEventListener('keyup', updatePreview)
  div.appendChild(input)

  return div
}

var updatePreview = function () {
  var payload = {}
  var inputs = document.getElementById('payload').getElementsByTagName('input')
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].value !== '') {
      payload[inputs[i].id] = inputs[i].value

      if (inputs[i].attributes.type.nodeValue /* FIXME */ === 'array') {
        payload[inputs[i].id] = Array(payload[inputs[i].id])
      } else if (inputs[i].type === 'number') {
        payload[inputs[i].id] = parseInt(payload[inputs[i].id])
      }
    }
  }

  document.getElementById('preview').innerHTML = JSON.stringify(payload, null, 4)
  document.getElementById('preview').className = 'code'

  return payload
}

var submitPayload = function (destination, payload, cb) {
  var xhr = new XMLHttpRequest()
  xhr.open('POST', destination, 'application/json')
  /*if (document.getElementById('bearer-token') !== '') {
    xhr.setRequestHeader('Authorization', 'Bearer ' + document.getElementById('bearer-token').value)
  }*/
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify(payload))
  xhr.onloadend = function () {
    cb(xhr.status)
  }
}

var submitPayloadAsFormData = function (destination, jsonPayload, cb) {
	var formData = new FormData()
	var keys = Object.keys(jsonPayload)
	for (var i = 0; i > keys.length; i++) {
	  formData.append(keys[i], jsonPayload[keys[i]])
	}
	var xhr = new XMLHttpRequest()
	  /*if (document.getElementById('bearer-token') !== '') {
		xhr.setRequestHeader('Authorization', 'Bearer ' + document.getElementById('bearer-token').value)
	  }*/
	xhr.open('POST', destination)
	xhr.send(formData)
	xhr.onloadend = function () {
		cb(xhr.status)
	}
}
