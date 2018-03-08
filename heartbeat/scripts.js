window.onload = function () {
  document.getElementById('send-to-localhost').addEventListener('click', function (e) {
    e.disabled = true
    submitPayload('http://localhost:8080/irc_entry/heartbeat', updatePreview(), function () {
      e.disabled = false
    })
  })
  document.getElementById('send-to-acp').addEventListener('click', function (e) {
    e.target.disabled = true
    submitPayload('https://api.dev.ircbd.homeoffice.gov.uk/irc_entry/heartbeat', updatePreview(), function (statusCode) {
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
  document.getElementById('send-to-dev').addEventListener('click', function (e) {
    e.target.disabled = true
    submitPayload('https://api-ircbd-dev.notprod.homeoffice.gov.uk/irc_entry/heartbeat', updatePreview(), function (statusCode) {
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
    submitPayload('https://api-ircbd-int.notprod.homeoffice.gov.uk/irc_entry/heartbeat', updatePreview(), function (statusCode) {
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
    submitPayload('https://api-ircbd-uat.notprod.homeoffice.gov.uk/irc_entry/heartbeat', updatePreview(), function (statusCode) {
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
  var timer = null
  document.getElementById('autosend').addEventListener('change', function (e) {
    if (e.target.checked === true) {
      timer = window.setInterval(autoSend, 1000)
    } else {
      window.clearInterval(timer)
      document.getElementById('autosend-label').innerHTML = 'Automatically send the heartbeat to dev once a minute'
    }
  })
  getJSON('heartbeat.json', function (err, data) {
    if (err) return console.error('Cannot get heartbeat data!')
    const heartbeat = data.heartbeat

    var placeholder = document.getElementById('keys')
    placeholder.innerHTML = '' // wipe previous for now

    for (var j = 0; j < heartbeat.length; j++) {
      var humanReadable = heartbeat[j].replace('_', ' ')
      humanReadable = humanReadable.charAt(0).toUpperCase() + humanReadable.slice(1)
      var fieldType = 'text'
      if (data.fields[heartbeat[j]]) {
        fieldType = data.fields[heartbeat[j]]
      }
      placeholder.appendChild(createField(humanReadable, heartbeat[j], fieldType))
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

      // force UTC:
      if (inputs[i].type === 'datetime-local') {
        payload[inputs[i].id] = payload[inputs[i].id] + ':00Z'
      } else if (inputs[i].type === 'number') {
        payload[inputs[i].id] = parseInt(payload[inputs[i].id])
      }
    }
  }

  document.getElementById('preview').innerHTML = JSON.stringify(payload, null, 4)
  document.getElementById('preview').className = 'code'

  getSchemaErrors(payload, function (error) {
    var errorBox = document.getElementById('errors')
    if (!error.valid) {
      var headline = error.toString()
      var subErrs = []
      var errsText = '<span class="text-secondary">(No sub-errors)</span>'
      if (error.error.subErrors) {
        for (var j = 0; j < error.error.subErrors.length; j++) {
          subErrs.push('<li>' + error.error.subErrors[j].message + '</li>')
        }
        errsText = '<details><summary>Sub-errors</summary><ul class="error-summary-list">' + subErrs.join('') + '</ul></details>'
      }
      errorBox.className = 'error-summary'
      errorBox.innerHTML = '<h2 class="heading-small error-summary-heading">' + headline + '</h2>' + errsText
      errorBox.innerHTML = errorBox.innerHTML += '<details><summary>Full error report</summary><pre class="code">' + JSON.stringify(error, null, 4) + '</details></p>'
    } else {
      errorBox.className = 'valid'
      errorBox.innerHTML = 'Passes validation'
    }
  })
  return payload
}

var getSchemaErrors = function (data, cb) {
  getJSON('https://raw.githubusercontent.com/UKHomeOffice/removals_schema/master/heartbeat.json', function (e, jsonSchema) {
    var result = tv4.validateResult(data, jsonSchema)
    return cb(result)
  })
}

var submitPayload = function (destination, payload, cb) {
  var xhr = new XMLHttpRequest()
  xhr.open('POST', destination, 'application/json')
  if (document.getElementById('bearer-token') !== '') {
    xhr.setRequestHeader('Authorization', 'Bearer ' + document.getElementById('bearer-token').value)
  }
  xhr.send(JSON.stringify(payload))
  xhr.onloadend = function () {
    cb(xhr.status)
  }
}

var autoSendTick = 0
var autoSend = function () {
  var tick = 60 - (autoSendTick++ % 60)
  document.getElementById('autosend-label').innerHTML = 'Automatically send the heartbeat to dev in ' + tick + ' seconds'
  if (tick === 60) {
    document.getElementById('send-to-dev').click()
  }
}
