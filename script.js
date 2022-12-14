const apikey = '99e5a840-cbc5-401f-a915-59d097f9c0eb';
const apihost = 'https://todo-api.coderslab.pl';

// Downloads all tasks from api

function apiListTasks() {
  return fetch(
    apihost + '/api/tasks',
    {
      headers: { Authorization: apikey }
    }
  ).then(
    function(resp) {
      if(!resp.ok) {
        alert('Error! Check devtools/Network!');
      }
      return resp.json();
    }
  )
}

// Renders HTML DOM with tasks, operations and form for creating new operations
// all basen on data from api

function renderTask(taskId, title, description, status) {
    const section = document.createElement("section");
    section.className = 'card mt-5 shadow-sm';
    document.querySelector('main').appendChild(section);

    const headerDiv = document.createElement('div');
    headerDiv.className = 'card-header d-flex justify-content-between align-items-center';
    section.appendChild(headerDiv);

    const headerLeftDiv = document.createElement('div');
    headerDiv.appendChild(headerLeftDiv);

    const h5 = document.createElement('h5');
    h5.innerText = title;
    headerLeftDiv.appendChild(h5);

    const h6 = document.createElement('h6');
    h6.className = 'card-subtitle text-muted';
    h6.innerText = description;
    headerLeftDiv.appendChild(h6);

    const headerRightDiv = document.createElement('div');
    headerDiv.appendChild(headerRightDiv);

    if (status === 'open'){
        const finishButton = document.createElement('button');
        finishButton.className = 'btn btn-dark btn-sm js-task-open-only';
        finishButton.innerText = 'Finish';
        headerRightDiv.appendChild(finishButton);

        finishButton.addEventListener('click', function (event) {
            event.preventDefault();
            apiUpdateTask(taskId, title, description, status).then(

            )
            const sectionParent = this.parentElement.closest('section');
            sectionParent.querySelectorAll('.js-task-open-only').forEach(item => item.remove());
        })
    }

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
    deleteButton.innerText = 'Delete';
    headerRightDiv.appendChild(deleteButton);

    deleteButton.addEventListener('click', function(event){
        event.preventDefault();
        apiDeleteTask(taskId).then(
            section.remove()
        )
    })

    const operationsList = document.createElement('ul');
    operationsList.className = 'list-group list-group-flush';

    apiListOperationsForTasks(taskId).then(
        function(response) {
            response.data.forEach(
                function(operation) {renderOperation(operationsList, operation.id, status, operation.description, operation.timeSpent);}
            )}
    );

    section.appendChild(operationsList);

    const formDiv = document.createElement('div');
    formDiv.className = 'card-body js-task-open-only';

    const form = document.createElement('form');
    const divInForm = document.createElement('div');
    divInForm.className = 'input-group';
    const input = document.createElement('input');
    input.className = 'form-control';
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Operation description');
    input.setAttribute('minLength', '5');
    const divBelowInput = document.createElement('div');
    divBelowInput.className = 'input-group-append';
    const buttonInput = document.createElement('button');
    buttonInput.className = 'btn btn-info';
    buttonInput.innerText = 'Add';
    divBelowInput.appendChild(buttonInput);
    divInForm.appendChild(input);
    divInForm.appendChild(divBelowInput);
    form.appendChild(divInForm);
    formDiv.appendChild(form);
    if (status === 'open') {
        section.appendChild(formDiv);
    }
    buttonInput.addEventListener('click', function(event) {
        event.preventDefault();
        apiCreateOperationForTask(taskId, input.value).then(response =>
            renderOperation(operationsList, response.data.id, status, response.data.description, response.data.timeSpent)
        )
        input.value = '';
        }
    )
}

// Fetch for getting operations for a given task

function apiListOperationsForTasks(taskId) {
  return fetch(
    apihost + '/api/tasks/' + taskId + '/operations',
    {
      headers: { Authorization: apikey }
    }
  ).then(
    function(resp) {
      if(!resp.ok) {
        alert('Error! Check devtools/Network!');
      }
      return resp.json();
    }
  )
}

// Renders HTML DOM for operations details

function renderOperation(operationsList, operationId, status, operationDescription, timeSpent) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';

    operationsList.appendChild(li);

    const descriptionDiv = document.createElement('div');
    descriptionDiv.innerText = operationDescription;
    li.appendChild(descriptionDiv);

    const time = document.createElement('span');
    time.className = 'badge badge-success badge-pill ml-2';
    time.innerText = hourlyTime(timeSpent);
    descriptionDiv.appendChild(time);

    const buttonsRightDiv = document.createElement('div');
    li.appendChild(buttonsRightDiv);

    if (status === 'open'){
    const quarterButton = document.createElement('button');
    quarterButton.className = 'btn btn-outline-success btn-sm mr-2 js-task-open-only';
    quarterButton.innerText = '+15m';
    buttonsRightDiv.appendChild(quarterButton);

    quarterButton.addEventListener('click', function(event) {
        event.preventDefault();
        timeSpent = timeSpent + 15;
        apiUpdateOperation(operationId, operationDescription, timeSpent).then(response =>
        time.innerText = hourlyTime(response.data.timeSpent))
        })

    const hourButton = document.createElement('button');
    hourButton.className = 'btn btn-outline-success btn-sm mr-2 js-task-open-only';
    hourButton.innerText = '+1h';
    buttonsRightDiv.appendChild(hourButton);

    hourButton.addEventListener('click', function(event) {
        event.preventDefault();
        timeSpent = timeSpent + 60;
        apiUpdateOperation(operationId, operationDescription, timeSpent).then(response =>
        time.innerText = hourlyTime(response.data.timeSpent))
        })

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm js-task-open-only';
    deleteButton.innerText = 'Delete';
    buttonsRightDiv.appendChild(deleteButton);

    deleteButton.addEventListener('click', function(event) {
        event.preventDefault();
        apiDeleteOperation(operationId).then(response =>
        li.remove())
        })

    }

}

// Transforms time from minutes to hours and minutes

function hourlyTime(timeSpent) {
    if (timeSpent === 60){
        return "1h"
    }
    if (timeSpent > 0 && timeSpent < 60){
        return timeSpent + 'm'
    }
    if (timeSpent <= 0) {
        return "0m"
    }
    if (timeSpent > 60){
        let hours = Math.floor(timeSpent / 60);
        let minutes = timeSpent % 60;
        return (hours + 'h ' + minutes + 'm');
    }
}

// Renders tasks after page download

document.addEventListener('DOMContentLoaded', function() {
    apiListTasks().then(
        function(response) {
            response.data.forEach(
                function(task) { renderTask(task.id, task.title, task.description, task.status)}
            )

        }
    )
});

// Renders form for adding tasks after page download

document.addEventListener('DOMContentLoaded', function(){
    const addTaskForm = document.querySelector('form');

    addTaskForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const newTask = addTaskForm.title.value;
        const newTaskDescription = addTaskForm.description.value;
        apiCreateTask(newTask, newTaskDescription).then(
            function(response){
                renderTask(response.data.id, response.data.title, response.data.description, response.data.status);
            }
        )
        addTaskForm.title.value = '';
        addTaskForm.description.value = '';
    })
})

// Three fetch functions for creating, deleting and updating tasks

function apiCreateTask(title, description) {
  return fetch(
    apihost + '/api/tasks',
    {
      headers: { Authorization: apikey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title, description: description, status: 'open' }),
      method: 'POST'
    }
  ).then(
    function(resp) {
      if(!resp.ok) {
        alert('Error! Check devtools/Network!');
      }
      return resp.json();
    }
  )
}

function apiDeleteTask(taskId) {
    return fetch(
        apihost + '/api/tasks/' + taskId, {
      headers: { Authorization: apikey },
      method: 'DELETE'
    })
            .then(
                function(response) {
                    if(!response.ok){
                        alert('Error! Check devtools/Network!')
                    }
                }
            )
}

function apiUpdateTask(taskId, title, description, status){
    return fetch(
    apihost + '/api/tasks/' + taskId,
    {
      headers: { Authorization: apikey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title, description: description, status: 'closed' }),
      method: 'PUT'
    }
  ).then(
    function(resp) {
      if(!resp.ok) {
        alert('Error! Check devtools/Network!');
      }
      return resp.json();
    }
  )
}

// Three fetch functions for creating, deleting and updating operations

function apiCreateOperationForTask(taskId, description){
    return fetch(
        apihost + '/api/tasks/' + taskId + '/operations', {
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({description: description, timeSpent: 0 }),
            method: 'POST',
        }
    )
        .then(
            function(response){
                if(!response.ok){
                    alert('Error! Check devtools/Network!')
                }
                return response.json()
            }
        )
}

function apiUpdateOperation(operationId, description, timeSpent){
    return fetch(
        apihost + '/api/operations/' + operationId, {
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({description: description, timeSpent: timeSpent }),
            method: 'PUT',
        }
    )
        .then(
            function(response){
                if(!response.ok){
                    alert('Error! Check devtools/Network!')
                }
                return response.json()
            }
        )
}

function apiDeleteOperation(operationId){
    return fetch(
        apihost + '/api/operations/' + operationId, {
      headers: { Authorization: apikey },
      method: 'DELETE'
    })
            .then(
                function(response) {
                    if(!response.ok){
                        alert('Error! Check devtools/Network!')
                    }
                }
            )
}

