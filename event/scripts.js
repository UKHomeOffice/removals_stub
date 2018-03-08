window.onload = function () {
  document.getElementById('send-to-localhost').addEventListener('click', function (e) {
    e.disabled = true
    submitPayload('http://localhost:8080/irc_entry/event', updatePreview(), function () {
      e.disabled = false
    })
  })
  document.getElementById('send-to-dev').addEventListener('click', function (e) {
    e.disabled = true
    submitPayload('https://api-ircbd-dev.notprod.homeoffice.gov.uk/irc_entry/event', updatePreview(), function () {
      e.disabled = false
    })
  })
  document.getElementById('send-to-int').addEventListener('click', function (e) {
    e.disabled = true
    submitPayload('https://api-ircbd-int.notprod.homeoffice.gov.uk/irc_entry/event', updatePreview(), function () {
      e.disabled = false
    })
  })
  document.getElementById('send-to-uat').addEventListener('click', function (e) {
    e.disabled = true
    submitPayload('https://api-ircbd-uat.notprod.homeoffice.gov.uk/irc_entry/event', updatePreview(), function () {
      e.disabled = false
    })
  })
  document.getElementById('send-to-acp').addEventListener('click', function (e) {
    e.disabled = true
    submitPayload('https://api.dev.ircbd.homeoffice.gov.uk/irc_entry/event', updatePreview(), function () {
      e.disabled = false
    })
  })
  getJSON('events.json', function (err, data) {
    if (err) return console.error('Cannot get events data!')
    const events = Object.keys(data.events)
    const eventDropdown = document.getElementById('event-type')
    for (var i = 0; i < events.length; i++) {
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
        var humanReadable = keys[j].replace(/_/g, ' ')
        humanReadable = humanReadable.replace('cid', 'CID')
        humanReadable = humanReadable.replace('ref', 'reference')
        humanReadable = humanReadable.replace('id', 'identifier')
        humanReadable = humanReadable.charAt(0).toUpperCase() + humanReadable.slice(1)
        var fieldType = 'text'
        if (data.fields[keys[j]]) {
          fieldType = data.fields[keys[j]]
        }
        placeholder.appendChild(createField(humanReadable, keys[j], fieldType))
      }
      updatePreview()
    })
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
  input.id = id
  input.className = 'form-control form-control-3-4'
  input.addEventListener('keyup', updatePreview)
  div.appendChild(input)

  return div
}

var updatePreview = function () {
  var payload = {}
  payload.operation = document.getElementById('event-type').value
  var inputs = document.getElementById('event-payload').getElementsByTagName('input')
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
      if (error.error.subErrors.length !== 0) {
        for (var j = 0; j < error.error.subErrors.length; j++) {
          subErrs.push('<li>' + error.error.subErrors[j].message + '</li>')
        }
      }
      errorBox.className = 'error-summary'
      errorBox.innerHTML = '<h2 class="heading-small error-summary-heading">' + headline + '</h2><details><summary>View possible problems</summary><ul class="error-summary-list">' + subErrs.join('') + '</ul>'
      errorBox.innerHTML = errorBox.innerHTML += '</details><details><summary>Full error report</summary><pre class="code">' + JSON.stringify(error, null, 4) + '</details></p>'
      document.getElementById('payload-error').className = 'error'
    } else {
      errorBox.className = 'valid'
      errorBox.innerHTML = 'Passes validation'
      document.getElementById('payload-error').className = 'visually-hidden'
    }
  })
  return payload
}

var getSchemaErrors = function (data, cb) {
  getJSON('https://raw.githubusercontent.com/UKHomeOffice/removals_schema/master/event.json', function (e, jsonSchema) {
    var result = tv4.validateResult(data, jsonSchema)
    return cb(result)
  })
}

var submitPayload = function (destination, payload, cb) {
  var xhr = new XMLHttpRequest()
  xhr.open('POST', destination, 'application/json')
  /* if (document.getElementById('bearer-token') !== '') {
    xhr.setRequestHeader('Authorization', 'Bearer ' + document.getElementById('bearer-token').value)
  } */
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify(payload))
  xhr.onloadend = function () {
    displayResponse(xhr)
    cb(xhr.status)
  }
}

var displayResponse = function (xhr) {
  var statusCode = xhr.status
  var response = document.getElementById('dev-response')
  if (statusCode > 399) {
    response.innerHTML = 'We received an error code of <a href="https://httpstatuses.com/' + xhr.status + '">' + xhr.status + '&nbsp;(' + xhr.statusText + ')</a>.'
    response.className = 'error-summary'
  } else if (statusCode === 0) {
    response.innerHTML = 'Problem sending to the API. (Cross-origin response sharing issue?)'
    response.className = 'error-summary'
  } else {
    response.innerHTML = xhr.status + '&nbsp;' + xhr.statusText
    response.className = 'valid'
  }
  if (xhr.response !== null && xhr.response !== '') {
    var text = document.createTextNode(xhr.response)
    var pre = document.createElement('pre')
    pre.className = 'code'
    pre.appendChild(text)
    // if long response, collapse it
    if (xhr.response.indexOf('\n') !== -1) {
      var details = document.createElement('details')
      details.innerHTML = '<summary>Response</summary>'
      details.appendChild(pre)
      response.appendChild(details)
    } else {
      response.appendChild(pre)
    }
  }
}
